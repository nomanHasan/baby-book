# Baby Book Build System Documentation

## Overview

The Baby Book build system is a comprehensive pipeline that automatically discovers, processes, and optimizes images from the `./books/` directory into a complete static site ready for deployment.

## Features

### 🔍 Flexible Book Discovery
- **Any folder structure**: Works with simple flat directories or complex nested structures
- **Smart naming**: Converts filenames like `cute-puppy.jpg` to "Cute Puppy" automatically
- **Metadata support**: Optional `metadata.json` files for advanced configuration
- **Description files**: Supports `.md`, `.txt`, and `README.md` files for book descriptions
- **Custom page descriptions**: Individual `image-name.md` files for page-specific content

### 🖼️ Advanced Image Processing
- **Responsive images**: Generates multiple sizes (320w, 768w, 1024w, 1920w)
- **Modern formats**: Converts to WebP with original format fallbacks
- **LQIP generation**: Low Quality Image Placeholders for progressive loading
- **Optimization**: Smart compression while maintaining visual quality
- **Format support**: JPG, JPEG, PNG, WebP, GIF, BMP

### ⚡ Development Experience
- **Hot reloading**: Automatic reprocessing when books directory changes
- **File watching**: Monitors for added, changed, or removed files
- **Fast rebuilds**: Incremental processing for development
- **Clear logging**: Detailed progress and error reporting

### 🚀 Production Optimization
- **Asset chunking**: Optimized JavaScript bundle splitting
- **GitHub Pages ready**: Configured base paths and deployment
- **Static site generation**: Complete manifest with all book data
- **Progressive loading**: LQIP and responsive image sets

## Directory Structure

```
books/
├── my-first-book/                    # Simple book folder
│   ├── metadata.json                 # Optional: Book settings
│   ├── description.md                # Optional: Book description
│   ├── 001-first-smile.jpg          # Numbered for custom ordering
│   ├── 002-walking.png              
│   └── 002-walking.md               # Optional: Page description
├── vacation-photos/                  # Another book
│   ├── beach-day.jpg
│   ├── sunset.png
│   └── family-photo.jpg
└── advanced-book/                    # Advanced structure
    ├── metadata.json                 # Custom settings & ordering
    ├── README.md                     # Book description
    ├── images/
    │   ├── chapter1/
    │   │   ├── page1.jpg
    │   │   └── page2.jpg
    │   └── chapter2/
    │       └── finale.jpg
    └── descriptions/
        ├── page1.md                  # Page-specific descriptions
        └── page2.md
```

## Configuration Files

### metadata.json Format

```json
{
  "title": "My Baby Book",
  "description": "A collection of precious moments",
  "tags": ["milestones", "memories", "2024"],
  "pageOrder": ["first-smile.jpg", "walking.png", "birthday.jpg"],
  "settings": {
    "pageTransition": "slide",        // slide, fade, flip
    "autoplay": false,                // Auto-advance pages
    "showPageNumbers": true,          // Show page numbers
    "autoplayDelay": 5000            // Milliseconds between pages
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "author": "Parent Name"
}
```

### Page Description Format (image-name.md)

```markdown
# Page Title

Alt: Descriptive alt text for accessibility

This is the page description that will appear below the image.
Supports **markdown** formatting.

- List items work
- Multiple paragraphs supported

*Metadata like date, location, etc.*
```

## Build Scripts

### Available Commands

```bash
# Development
npm run dev                    # Start dev server with hot reloading
npm run process-books          # Process books manually
npm run typecheck              # Check TypeScript types
npm run lint                   # Check code quality

# Production
npm run build                  # Full production build
npm run build:fast             # Skip book processing (use existing)
npm run preview                # Preview production build locally

# Deployment
npm run deploy                 # Deploy to GitHub Pages
npm run deploy:gh-pages        # Deploy using gh-pages directly
```

### Build Pipeline

1. **Book Discovery**: Scans `./books/` for folders containing images
2. **Metadata Loading**: Reads `metadata.json` and description files
3. **Image Processing**: 
   - Generates responsive image sets
   - Converts to WebP format
   - Creates LQIP (Low Quality Image Placeholders)
   - Optimizes file sizes
4. **Manifest Generation**: Creates `books-manifest.json` with all book data
5. **Asset Copying**: Moves processed images to `public/processed-books/`
6. **Build Integration**: Vite processes the application with book data

## Generated Files

### Books Manifest (`public/books-manifest.json`)

```json
{
  "books": [
    {
      "id": "my-first-book",
      "title": "My First Book",
      "description": "...",
      "coverImage": { /* responsive image data */ },
      "pages": [
        {
          "id": "page-1",
          "title": "First Smile",
          "description": "...",
          "image": {
            "src": "/processed-books/my-first-book/image-320w.png",
            "srcSet": {
              "webp": "image-320w.webp 320w, image-768w.webp 768w, ...",
              "original": "image-320w.png 320w, image-768w.png 768w, ..."
            },
            "alt": "First smile at 2 months",
            "width": 1024,
            "height": 1536,
            "lqip": "data:image/webp;base64,UklGR...",
            "aspectRatio": 0.6666666666666666
          },
          "pageNumber": 1
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "tags": ["milestones"],
      "settings": { /* book settings */ }
    }
  ],
  "generatedAt": "2024-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

### Processed Images Structure

```
public/processed-books/
├── book-id-1/
│   ├── image1-320w.webp
│   ├── image1-320w.png
│   ├── image1-768w.webp
│   ├── image1-768w.png
│   ├── image1-1024w.webp
│   ├── image1-1024w.png
│   └── image1-lqip.webp
└── book-id-2/
    └── ...
```

## GitHub Actions Deployment

The included GitHub Actions workflow automatically:

1. **Build Check**: Runs TypeScript and ESLint checks
2. **Book Processing**: Processes all books in the repository
3. **Production Build**: Creates optimized static site
4. **Deployment**: Deploys to GitHub Pages

### Required Repository Settings

1. **Enable GitHub Pages**: Settings → Pages → Source: GitHub Actions
2. **Permissions**: Settings → Actions → Permissions → Read and write permissions

## Error Handling

### Common Issues

1. **Missing Images**: Books with no images are skipped with warnings
2. **Invalid Metadata**: Malformed JSON files fall back to defaults
3. **Image Processing Errors**: Individual image failures don't stop the build
4. **Missing Directories**: Missing `books/` directory triggers sample creation

### File Watching Limitations

- **Large Directories**: Very large image collections may slow file watching
- **Network Drives**: File watching may not work on network-mounted directories
- **Permissions**: Ensure Node.js has read/write access to books directory

## Performance Optimizations

### Image Processing
- **Smart Resize**: Only generates sizes smaller than original
- **Quality Settings**: WebP at 85% quality, JPEG at 90%
- **Parallel Processing**: Multiple images processed simultaneously
- **Caching**: Processed images aren't regenerated unless source changes

### Build Optimization
- **Code Splitting**: Vendor chunks separated from application code
- **Tree Shaking**: Unused code eliminated from bundles
- **Asset Optimization**: Images, fonts, and other assets optimized
- **Gzip Compression**: All text assets compressed

## Customization

### Adding New Image Formats
Modify `IMAGE_EXTENSIONS` in `scripts/book-scanner.js`:

```javascript
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg'];
```

### Custom Responsive Sizes
Adjust `RESPONSIVE_WIDTHS` in `scripts/book-scanner.js`:

```javascript
const RESPONSIVE_WIDTHS = [320, 480, 768, 1024, 1440, 1920];
```

### Build Hooks
Extend the Vite plugin in `scripts/vite-plugin-books.ts` to add custom processing steps.

## Troubleshooting

### Build Failures
1. **Check Node.js version**: Requires Node.js 16+ for ES modules
2. **Verify dependencies**: Run `npm install` to ensure all packages installed
3. **Clear cache**: Delete `node_modules/.vite` and restart dev server
4. **Check file permissions**: Ensure read/write access to books directory

### Image Processing Issues
1. **Sharp errors**: Sharp library handles most common image formats
2. **Memory issues**: Large images may require increased Node.js memory limit
3. **Color profiles**: Some images with exotic color profiles may need conversion

### Development Server
1. **Port conflicts**: Default port 3000, change in vite.config.ts if needed
2. **Hot reload issues**: Try refreshing browser if changes don't appear
3. **File watching**: Restart dev server if file watching stops working

## Advanced Usage

### Custom Build Scripts
Create custom scripts for specific workflows:

```javascript
// custom-build.js
import BookScanner from './scripts/book-scanner.js';

const scanner = new BookScanner();
// Custom processing logic here
await scanner.scan();
```

### CI/CD Integration
The build system works with any CI/CD platform that supports Node.js:

```yaml
# Example for other CI platforms
- name: Setup Node.js
  uses: actions/setup-node@v3
  with:
    node-version: '18'
    
- name: Install dependencies
  run: npm ci
  
- name: Process books and build
  run: npm run build
```

This build system provides a complete solution for creating beautiful, optimized baby books from simple image folders while maintaining flexibility for advanced use cases.