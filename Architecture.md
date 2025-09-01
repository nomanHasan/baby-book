# Baby Book Viewer App - Technical Architecture

## Overview
A mobile-first, static React application for viewing baby books in an immersive slideshow experience. Designed to handle hundreds of books with 200-300 images each, optimized for GitHub Pages deployment.

## Technology Stack

### Core Framework
- **React 18+** with TypeScript for type safety
- **Vite** for build tooling and development server (faster than CRA, better GitHub Pages support)
- **React Router v6** for navigation between books and slideshow views

### Popular Libraries & Tools
- **Framer Motion** for page-turn animations and smooth transitions
- **Tailwind CSS** for utility-first styling and responsive design
- **React Query/TanStack Query** for data caching and management
- **React Intersection Observer** for lazy loading optimization
- **React Swipeable** for mobile touch gestures
- **Lucide React** for consistent iconography

### Build & Deployment
- **Vite Static Build** optimized for GitHub Pages
- **Sharp/ImageMin** for build-time image optimization
- **Workbox** for service worker and caching strategies

## Project Structure

```
baby-book-viewer/
├── public/
│   ├── books/                    # Static book folders
│   │   ├── book-1/
│   │   │   ├── metadata.json     # Book metadata
│   │   │   ├── cover.jpg         # Book cover image
│   │   │   ├── page-001.jpg      # Book pages
│   │   │   ├── page-001.md       # Page descriptions
│   │   │   └── ...
│   │   └── book-2/
│   │       └── ...
│   └── generated/                # Build-time generated files
│       ├── books-manifest.json   # All books metadata
│       └── optimized-images/     # Optimized image variants
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── BookGrid.tsx
│   │   │   ├── BookCard.tsx
│   │   │   └── SearchFilter.tsx
│   │   ├── Slideshow/
│   │   │   ├── SlideshowViewer.tsx
│   │   │   ├── SlideImage.tsx
│   │   │   ├── SlideText.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── ProgressDots.tsx
│   │   ├── Common/
│   │   │   ├── Layout.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   └── UI/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       └── Toast.tsx
│   ├── hooks/
│   │   ├── useBooks.ts          # Book data management
│   │   ├── useSlideshow.ts      # Slideshow logic
│   │   ├── useSwipeGestures.ts  # Mobile gestures
│   │   └── useImageLoader.ts    # Progressive image loading
│   ├── services/
│   │   ├── bookService.ts       # API for book data
│   │   ├── imageService.ts      # Image optimization utilities
│   │   └── cacheService.ts      # Browser caching logic
│   ├── types/
│   │   ├── Book.ts
│   │   ├── Page.ts
│   │   └── AppState.ts
│   ├── utils/
│   │   ├── imageUtils.ts
│   │   ├── textUtils.ts
│   │   └── performanceUtils.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── components.css
│   │   └── animations.css
│   └── scripts/
│       ├── build-manifest.js    # Build-time book scanning
│       └── optimize-images.js   # Image processing
```

## Data Structure

### Book Metadata Format
```json
{
  "id": "unique-book-id",
  "title": "My First Year",
  "author": "Mom & Dad",
  "publicationDate": "2024-01-15",
  "coverImage": "cover.jpg",
  "description": "A beautiful collection of memories",
  "tags": ["newborn", "milestones", "family"],
  "pageCount": 287,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-12-31T23:59:59Z"
}
```

### Page Structure
```json
{
  "pageNumber": 1,
  "imagePath": "page-001.jpg",
  "description": "First smile captured!",
  "altText": "Baby's first smile in a white onesie",
  "imageMetadata": {
    "width": 1920,
    "height": 1080,
    "aspectRatio": 1.78,
    "fileSize": 245678
  }
}
```

## Build Process

### 1. Pre-build Scanning
- Node.js script scans `/public/books/` directory
- Generates `books-manifest.json` with all book metadata
- Creates optimized image variants (WebP, multiple sizes)
- Validates naming conventions and file structure

### 2. Image Optimization
- Generate responsive image sets (320w, 768w, 1024w, 1920w)
- Convert to WebP format for modern browsers
- Maintain original formats as fallbacks
- Create low-quality image placeholders (LQIP)

### 3. Static Generation
- Vite builds optimized React bundle
- Pre-renders book list for faster initial load
- Generates service worker for offline capability

## Performance Architecture

### Image Loading Strategy
- **Lazy Loading**: Images load only when approaching viewport
- **Progressive Enhancement**: LQIP → Low-res → High-res
- **Format Selection**: WebP for modern browsers, fallback to original
- **Virtual Scrolling**: Only render visible book cards in dashboard

### Caching Strategy
- **Browser Cache**: Long-term caching for images and static assets
- **Service Worker**: Offline-first approach for visited books
- **Memory Cache**: Keep recently viewed images in memory
- **Preloading**: Preload next 3-5 images in slideshow

### Bundle Optimization
- **Code Splitting**: Separate chunks for Dashboard vs Slideshow
- **Tree Shaking**: Remove unused library code
- **Asset Optimization**: Compress CSS/JS bundles
- **Dynamic Imports**: Load slideshow code only when needed

## Mobile-First Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
.container {
  /* Base: Mobile (320px+) */
  padding: 1rem;
}

@media (min-width: 640px) {
  /* Small tablets */
  .container { padding: 1.5rem; }
}

@media (min-width: 768px) {
  /* Tablets */
  .container { padding: 2rem; }
}

@media (min-width: 1024px) {
  /* Desktop */
  .container { padding: 3rem; }
}
```

### Touch Interactions
- **Swipe Navigation**: Left/right swipes for slideshow navigation
- **Touch Feedback**: Visual feedback for all interactive elements
- **Gesture Recognition**: Pinch-to-zoom disabled, swipe-to-navigate enabled
- **Safe Areas**: Respect notch and home indicator on mobile devices

## Animation & Transitions

### Page Turn Effect Implementation
```tsx
// Using Framer Motion for book page turn
const pageVariants = {
  enter: { rotateY: -90, opacity: 0 },
  center: { rotateY: 0, opacity: 1 },
  exit: { rotateY: 90, opacity: 0 }
}

const transition = {
  duration: 0.6,
  ease: [0.4, 0.0, 0.2, 1] // Custom cubic-bezier for book-like feel
}
```

### Performance Considerations
- Use `transform` properties for GPU acceleration
- Limit concurrent animations to maintain 60fps
- Preload next/previous slides during transitions

## Accessibility Implementation

### Visual Accessibility
- **Color Contrast**: Minimum 4.5:1 ratio for text
- **Font Sizing**: Minimum 16px base size, scalable with user preferences
- **Focus Indicators**: Clear visual focus states for keyboard navigation

### Screen Reader Support
- **Alt Text**: Comprehensive image descriptions from .md files
- **ARIA Labels**: Proper labeling for interactive elements
- **Semantic HTML**: Use appropriate heading hierarchy and landmarks

### Keyboard Navigation
- **Arrow Keys**: Navigate slideshow without mouse
- **Tab Order**: Logical focus flow through interface
- **Escape Key**: Exit slideshow and return to dashboard

## GitHub Pages Deployment

### Build Configuration
```javascript
// vite.config.ts
export default defineConfig({
  base: '/baby-book-viewer/', // GitHub Pages subpath
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false // Reduce bundle size
  },
  plugins: [
    react(),
    // Custom plugin for build-time book scanning
    bookManifestPlugin()
  ]
})
```

### Deployment Workflow
1. **Pre-build**: Scan books, optimize images
2. **Build**: Generate static React app
3. **Deploy**: GitHub Actions pushes to gh-pages branch
4. **CDN**: GitHub Pages serves static files

## Error Handling & Resilience

### Graceful Degradation
- **Missing Images**: Show placeholder with error message
- **Missing Descriptions**: Display default text or filename
- **Network Issues**: Offline mode with cached content
- **Browser Compatibility**: Progressive enhancement for older browsers

### Error Boundaries
```tsx
class SlideshowErrorBoundary extends React.Component {
  // Handle slideshow-specific errors
  // Fallback to simple image gallery view
}
```

## Development Workflow

### Development Server
```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run scan-books   # Regenerate book manifest
npm run optimize     # Run image optimization
```

### Code Quality
- **ESLint + Prettier**: Consistent code formatting
- **TypeScript Strict**: Full type safety
- **Husky**: Pre-commit hooks for linting/testing
- **Vitest**: Unit tests for critical components

This architecture provides a solid foundation for a scalable, performant, and accessible baby book viewer that can handle the specified requirements while maintaining excellent user experience across all devices.