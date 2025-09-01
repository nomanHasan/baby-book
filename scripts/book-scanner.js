#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const booksDir = path.join(projectRoot, 'books');
const publicDir = path.join(projectRoot, 'public');
const outputDir = path.join(publicDir, 'processed-books');

// Supported image formats
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];

class BookScanner {
  constructor() {
    this.manifest = {
      books: [],
      generatedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  async scan() {
    console.log('🔍 Scanning books directory...');
    
    if (!await fs.pathExists(booksDir)) {
      console.log('📁 Creating books directory...');
      await fs.ensureDir(booksDir);
      await this.createSampleStructure();
    }

    await fs.ensureDir(outputDir);
    
    const bookFolders = await this.findBookFolders();
    console.log(`📚 Found ${bookFolders.length} book folders`);

    for (const bookFolder of bookFolders) {
      try {
        const book = await this.processBook(bookFolder);
        if (book) {
          this.manifest.books.push(book);
          console.log(`✅ Processed book: ${book.title}`);
        }
      } catch (error) {
        console.error(`❌ Error processing book folder ${bookFolder}:`, error.message);
      }
    }

    // Sort books by title
    this.manifest.books.sort((a, b) => a.title.localeCompare(b.title));

    await this.saveManifest();
    console.log(`🎉 Successfully processed ${this.manifest.books.length} books!`);
  }

  async findBookFolders() {
    try {
      const entries = await fs.readdir(booksDir, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => path.join(booksDir, entry.name));
    } catch (error) {
      console.error('Error reading books directory:', error);
      return [];
    }
  }

  async processBook(bookFolderPath) {
    const folderName = path.basename(bookFolderPath);
    const metadataPath = path.join(bookFolderPath, 'metadata.json');
    
    let metadata = {};
    if (await fs.pathExists(metadataPath)) {
      try {
        metadata = await fs.readJson(metadataPath);
      } catch (error) {
        console.warn(`⚠️  Invalid metadata.json in ${folderName}, using defaults`);
      }
    }

    const images = await this.findImages(bookFolderPath);
    if (images.length === 0) {
      console.warn(`⚠️  No images found in ${folderName}, skipping`);
      return null;
    }

    const book = {
      id: this.generateId(folderName),
      title: metadata.title || this.formatTitle(folderName),
      description: metadata.description || await this.findDescription(bookFolderPath),
      coverImage: null,
      pages: [],
      createdAt: metadata.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: metadata.tags || [],
      settings: {
        pageTransition: metadata.settings?.pageTransition || 'slide',
        autoplay: metadata.settings?.autoplay || false,
        showPageNumbers: metadata.settings?.showPageNumbers || true,
        ...metadata.settings
      }
    };

    const bookOutputDir = path.join(outputDir, book.id);
    await fs.ensureDir(bookOutputDir);

    // Process images with custom ordering
    const sortedImages = this.sortImages(images, metadata.pageOrder);

    for (let i = 0; i < sortedImages.length; i++) {
      const imagePath = sortedImages[i];
      const page = await this.processImage(imagePath, bookOutputDir, i, bookFolderPath);
      
      if (i === 0) {
        book.coverImage = page.image;
      }
      
      book.pages.push(page);
    }

    return book;
  }

  async findImages(folderPath) {
    const patterns = IMAGE_EXTENSIONS.map(ext => `**/*${ext}`);
    const images = [];
    
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd: folderPath,
        absolute: true,
        nocase: true
      });
      images.push(...matches);
    }
    
    return [...new Set(images)].sort();
  }

  async findDescription(bookFolderPath) {
    const descFiles = ['description.md', 'README.md', 'description.txt'];
    
    for (const filename of descFiles) {
      const filePath = path.join(bookFolderPath, filename);
      if (await fs.pathExists(filePath)) {
        try {
          return await fs.readFile(filePath, 'utf-8');
        } catch (error) {
          console.warn(`Could not read ${filename}:`, error.message);
        }
      }
    }
    
    return '';
  }

  sortImages(images, customOrder) {
    if (customOrder && Array.isArray(customOrder)) {
      const orderMap = new Map(customOrder.map((filename, index) => [filename, index]));
      return images.sort((a, b) => {
        const filenameA = path.basename(a);
        const filenameB = path.basename(b);
        const orderA = orderMap.get(filenameA) ?? 999;
        const orderB = orderMap.get(filenameB) ?? 999;
        
        if (orderA !== orderB) return orderA - orderB;
        return filenameA.localeCompare(filenameB);
      });
    }
    
    return images.sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
  }

  async processImage(imagePath, bookOutputDir, pageIndex, bookFolderPath) {
    const filename = path.basename(imagePath, path.extname(imagePath));
    const ext = path.extname(imagePath);
    
    try {
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      
      // Copy the original image to the output directory without any processing
      const outputFilename = `${filename}${ext}`;
      const outputPath = path.join(bookOutputDir, outputFilename);
      await fs.copy(imagePath, outputPath);
      
      // Check for page description
      const pageDescription = await this.findPageDescription(imagePath, bookFolderPath);
      
      return {
        id: `page-${pageIndex + 1}`,
        title: pageDescription.title || this.formatTitle(filename),
        description: pageDescription.content,
        image: {
          src: `/processed-books/${path.basename(bookOutputDir)}/${outputFilename}`,
          alt: pageDescription.alt || `Page ${pageIndex + 1}`,
          width: metadata.width,
          height: metadata.height,
          aspectRatio: metadata.width / metadata.height
        },
        pageNumber: pageIndex + 1
      };
    } catch (error) {
      console.error(`Error processing image ${imagePath}:`, error);
      throw error;
    }
  }

  async findPageDescription(imagePath, bookFolderPath) {
    const filename = path.basename(imagePath, path.extname(imagePath));
    const descPath = path.join(bookFolderPath, `${filename}.md`);
    
    if (await fs.pathExists(descPath)) {
      try {
        const content = await fs.readFile(descPath, 'utf-8');
        const lines = content.split('\n');
        const title = lines.find(line => line.startsWith('# '))?.replace('# ', '') || '';
        const alt = lines.find(line => line.startsWith('Alt: '))?.replace('Alt: ', '') || '';
        
        return {
          title,
          content: content,
          alt
        };
      } catch (error) {
        console.warn(`Could not read description for ${filename}:`, error.message);
      }
    }
    
    return { title: '', content: '', alt: '' };
  }


  formatTitle(text) {
    return text
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }

  generateId(folderName) {
    return folderName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async saveManifest() {
    const manifestPath = path.join(publicDir, 'books-manifest.json');
    await fs.writeJson(manifestPath, this.manifest, { spaces: 2 });
    console.log(`📋 Saved manifest to ${manifestPath}`);
  }

  async createSampleStructure() {
    const sampleBookDir = path.join(booksDir, 'my-first-book');
    await fs.ensureDir(sampleBookDir);
    
    const sampleMetadata = {
      title: "My First Baby Book",
      description: "A collection of precious moments and milestones",
      tags: ["milestones", "memories"],
      settings: {
        pageTransition: "slide",
        showPageNumbers: true
      }
    };
    
    await fs.writeJson(path.join(sampleBookDir, 'metadata.json'), sampleMetadata, { spaces: 2 });
    
    const readmePath = path.join(sampleBookDir, 'README.md');
    await fs.writeFile(readmePath, `# Getting Started

Place your images in this folder to create your baby book!

Supported formats: JPG, PNG, WebP, GIF, BMP

## File naming conventions:
- Images will be sorted alphabetically by filename
- Use prefixes like "001-first-smile.jpg" for custom ordering
- Or specify custom order in metadata.json

## Optional files:
- \`metadata.json\` - Book settings and metadata
- \`description.md\` - Book description
- \`image-name.md\` - Individual page descriptions

Happy book making! 📚✨
`);
    
    console.log('📝 Created sample book structure in books/my-first-book/');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const scanner = new BookScanner();
  scanner.scan().catch(console.error);
}

export default BookScanner;