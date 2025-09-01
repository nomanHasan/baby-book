import { Plugin } from 'vite';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';

export function booksPlugin(): Plugin {
  let isBuilding = false;
  let isDev = false;
  
  return {
    name: 'vite-plugin-books',
    
    configResolved(config) {
      isDev = config.command === 'serve';
      isBuilding = config.command === 'build';
    },

    async buildStart() {
      if (isBuilding) {
        console.log('\n📚 Processing books for production build...');
        await runBookScanner();
      }
    },

    async configureServer(server) {
      if (isDev) {
        console.log('\n📚 Setting up book processing for development...');
        
        await runBookScanner();

        const booksDir = path.resolve('books');
        
        if (await fs.pathExists(booksDir)) {
          const watcher = server.watcher;
          watcher.add(booksDir);
          
          let debounceTimer: NodeJS.Timeout;
          
          const handleChange = async (filePath: string) => {
            if (filePath.startsWith(booksDir)) {
              console.log(`\n📝 Book files changed: ${path.relative(process.cwd(), filePath)}`);
              
              clearTimeout(debounceTimer);
              debounceTimer = setTimeout(async () => {
                try {
                  console.log('🔄 Reprocessing books...');
                  await runBookScanner();
                  
                  server.ws.send({
                    type: 'full-reload'
                  });
                  
                  console.log('✅ Books reprocessed successfully');
                } catch (error) {
                  console.error('❌ Error reprocessing books:', error);
                }
              }, 500);
            }
          };
          
          watcher.on('change', handleChange);
          watcher.on('add', handleChange);
          watcher.on('unlink', handleChange);
          
          console.log('👀 Watching books directory for changes...');
        }
      }
    }
  };
}

function runBookScanner(): Promise<void> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve('scripts/book-scanner.js');
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Book scanner exited with code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

export default booksPlugin;