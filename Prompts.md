# Baby Book Viewer App - Development Prompts List

This comprehensive prompts list provides step-by-step guidance for implementing the Baby Book Viewer App. Each prompt builds upon the previous ones and includes context for why each step is important.

## Phase 1: Complete Project Foundation

### Task 1: Full Project Setup with Core Dependencies
```
Set up a complete React TypeScript project with Vite including all necessary configurations and dependencies:

**Project Initialization:**
- Create React TypeScript project with Vite
- Configure TypeScript strict mode, ESLint, Prettier
- Set up Tailwind CSS with optimal configuration
- Configure Vite for development and GitHub Pages deployment

**Core Dependencies Installation:**
- React Router v6 for navigation
- Framer Motion for page-turn animations
- TanStack Query for data management and caching
- Lucide React for consistent iconography
- React Intersection Observer for lazy loading
- React Swipeable for mobile touch gestures
- Additional utilities: clsx, date-fns, sharp (for build process)

**Project Structure Setup:**
- Create complete folder structure per architecture document
- Set up proper import paths and aliases
- Configure development environment variables
- Create basic provider setup in App.tsx with all contexts

**TypeScript Configuration:**
- Define comprehensive interfaces for Book, Page, AppState
- Create proper typing for all API responses and services
- Set up proper JSDoc documentation standards
- Export all types from centralized types/index.ts

Deliverable: Fully functional development environment ready for feature implementation.
```

## Phase 2: Build System and Data Processing

### Task 2: Complete Build Pipeline with Flexible Book Scanning
```
Implement a comprehensive build system that handles flexible folder structures and optimizes all assets:

**Flexible Book Discovery System:**
- Scan ./books/ for any folder structure (simple or advanced)
- Support filename-as-title: "cute-puppy.jpg" → "Cute Puppy"
- Handle .md description files with matching image names
- Generate metadata.json automatically for simple structures
- Support existing metadata.json files for advanced structures
- Create content trees based on discovered file structures

**Image Processing Pipeline:**
- Generate responsive image sets (320w, 768w, 1024w, 1920w)
- Convert to WebP with original format fallbacks
- Create LQIP (Low Quality Image Placeholders) for progressive loading
- Optimize images while maintaining visual quality
- Handle all common formats: jpg, jpeg, png, webp, gif, bmp

**Build Integration:**
- Integrate with Vite build process seamlessly
- Generate books-manifest.json with complete book catalog
- Configure for GitHub Pages deployment with proper paths
- Set up development file watching and hot-reloading
- Handle missing files gracefully with meaningful fallbacks
- Sort books and pages intelligently (metadata override or filename)

**Vite Configuration:**
- Configure base paths for GitHub Pages subdirectory
- Optimize build output for static hosting
- Set up proper asset chunking and lazy loading
- Configure environment-specific settings
- Enable source maps for dev, disable for production

Deliverable: Complete build system that processes any ./books folder structure into optimized static site.
```

## Phase 3: Data Services and Performance Layer

### Task 3: Complete Data Management and Caching System
```
Implement a comprehensive data management system with advanced caching and performance optimization:

**Book Service Layer:**
- Load and parse books-manifest.json with full error handling
- Provide typed functions: getAllBooks(), getBookById(), getBookPages()
- Implement search and filtering across titles, authors, descriptions
- Handle missing or corrupted data with graceful fallbacks
- Use TanStack Query for intelligent caching and background updates
- Support real-time updates during development

**Advanced Image Loading Service:**
- Progressive loading: LQIP → optimized image → full resolution
- Format fallbacks: WebP → JPG/PNG with browser detection
- Preload next 3-5 slideshow images for smooth navigation
- Intersection Observer for dashboard lazy loading
- Adaptive loading based on connection speed and device capabilities
- Error handling with retry logic and fallback images

**Performance and Caching Strategy:**
- Browser caching with proper cache headers
- Service worker for offline-first experience
- Memory caching for recently viewed content with LRU eviction
- Cache invalidation strategies for updated content
- Performance monitoring and metrics collection
- Bundle splitting and code splitting for optimal loading

**React Hooks Integration:**
- useBooks() for book data management
- useImageLoader() for progressive image loading
- useSlideshow() for slideshow state management
- useSwipeGestures() for mobile touch interactions
- Custom hooks with proper TypeScript typing and error boundaries

Deliverable: Robust data layer supporting 100s of books with 200-300 images each, optimized for performance.
```

## Phase 4: Core Dashboard and Navigation

### Task 4: Complete Dashboard with Responsive Design and Navigation
```
Build the complete dashboard experience with beautiful, responsive design and seamless navigation:

**Responsive Dashboard Layout:**
- CSS Grid-based layout optimized for mobile-first design
- Defined breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop)
- Bright, cheerful primary colors with playful aesthetic
- Children's book serif fonts with proper sizing and spacing
- Smooth transitions and micro-interactions

**Book Card Components:**
- Display cover images with proper aspect ratio handling
- Show title (from folder name or metadata), author, publication date
- Tactile, inviting design that feels like physical books
- Hover/focus states with accessibility compliance
- Attractive placeholders for missing cover images
- Proper touch targets (44px minimum) for mobile
- Semantic HTML with comprehensive ARIA labels

**Navigation and Routing:**
- React Router v6 setup with TypeScript route parameters
- Routes: dashboard (/), slideshow (/book/:bookId), dev tools (/dev/book-creator)
- Invalid book ID handling with friendly error pages
- Proper browser history and back button support
- Loading states during route transitions
- Breadcrumb navigation for better user experience

**Loading and Error States:**
- Skeleton loading components for book cards
- Progressive loading of book covers
- Error boundaries with helpful error messages
- Empty state handling (no books found)
- Search and filter functionality integration

Deliverable: Complete dashboard that beautifully displays any number of books with smooth navigation.
```

## Phase 5: Immersive Slideshow Experience

### Task 5: Complete Slideshow with Smart Text Positioning and Navigation
```
Create an immersive slideshow experience with intelligent layout and intuitive controls:

**Core Slideshow Engine:**
- Letterbox image display handling all aspect ratios gracefully
- Smart text positioning logic: overlay on full-screen images, below when space available
- Responsive text sizing based on available space and content length
- Children's book serif fonts optimized for readability
- Proper state management for current page, loading states, errors

**Intelligent Text Display:**
- Calculate screen dimensions and image aspect ratios in real-time
- Position text overlay with proper contrast backgrounds (4.5:1 ratio minimum)
- Handle varying description lengths (short titles vs. long stories)
- Ensure text never obstructs important image content
- Smooth transitions between overlay and below-image positioning
- Support for markdown formatting in descriptions

**Navigation Controls:**
- Semi-transparent arrow controls (previous/next)
- Dots indicator showing current position and total pages
- Edge case handling (first page, last page, single page books)
- Comprehensive keyboard support (arrow keys, escape, enter)
- Mouse, touch, and keyboard navigation working seamlessly
- Proper ARIA labels for full screen reader accessibility

**Interactive Features:**
- Smooth visual feedback for all interactions
- Loading states while images are being fetched
- Error handling for missing images or descriptions
- Breadcrumb back to dashboard
- Optional autoplay with user controls (start/stop)

Deliverable: Book-like reading experience that adapts to any image size and description length.
```

## Phase 6: Advanced Interactions and Animations

### Task 6: Page Turn Animations and Mobile Gesture System
```
Implement delightful animations and comprehensive mobile support:

**Realistic Page Turn Animations:**
- 3D page flip effect using Framer Motion with proper physics
- Easing curves that mimic physical book page turning
- 60fps performance optimization with GPU acceleration
- Handle different image sizes and orientations gracefully
- Interruptible animations for quick navigation
- Accessibility: respect prefers-reduced-motion setting
- Optional subtle haptic feedback on supported devices

**Mobile Touch Gestures:**
- Left/right swipe navigation using React Swipeable
- Visual feedback during swipes (slight image movement)
- Proper gesture recognition with sensitivity controls
- Handle edge cases: partial swipes, fast swipes, momentum
- Prevent accidental navigation from vertical scrolling
- Consistent behavior across iOS Safari, Chrome Mobile
- Touch-friendly controls and proper touch target sizes

**Configurable Autoplay System:**
- Auto-advance slides with configurable timing (default 3 seconds)
- Pause/resume on user interaction
- Visual progress indicator (circular or linear)
- Easy start/stop controls with clear visual states
- Respect accessibility preferences (prefers-reduced-motion)
- Handle end-of-book scenarios (stop, loop, or return to dashboard)
- Smooth countdown animations for next slide transitions

**Performance and Accessibility:**
- Optimize animations for older devices
- Provide motion reduction alternatives
- Maintain full functionality when animations disabled
- Test across various device capabilities and screen sizes

Deliverable: Engaging, accessible animation system that enhances the book-reading experience.
```

## Phase 7: Performance Optimization

### Prompt 7.1: Lazy Loading Implementation
```
Implement comprehensive lazy loading that:
- Uses Intersection Observer to load images as they approach the viewport
- Loads dashboard book covers progressively as user scrolls
- Preloads next 3-5 slideshow images for smooth navigation
- Implements skeleton loading states for better perceived performance
- Handles different connection speeds with adaptive loading strategies
- Includes proper error handling for failed image loads
- Uses React hooks for clean component integration

Optimize for the large dataset while maintaining smooth user experience.
```

### Prompt 7.2: Virtual Scrolling for Large Book Collections
```
Implement virtual scrolling for the dashboard that:
- Only renders visible book cards to handle 100s of books efficiently
- Maintains proper scroll position and navigation
- Handles dynamic card sizes based on content
- Implements smooth scrolling with proper momentum
- Works correctly with search/filter functionality
- Provides proper accessibility with screen readers
- Uses React Intersection Observer or similar optimization

Ensure the dashboard remains performant with large book collections.
```


## Phase 8: Mobile-First Responsive Design

### Prompt 8.1: Mobile-First CSS Implementation
```
Create comprehensive mobile-first styles that:
- Start with mobile (320px) and progressively enhance
- Use CSS Grid and Flexbox for responsive layouts
- Implement proper touch targets (minimum 44px) for all interactive elements
- Handle safe areas on modern mobile devices (notch, home indicator)
- Use relative units (rem, em, %) for scalable design
- Implement proper font sizing that scales with user preferences
- Test across different screen sizes and orientations

Ensure the app feels native on mobile devices while scaling beautifully to desktop.
```

### Prompt 8.2: Touch Interaction Refinements
```
Enhance touch interactions for mobile devices:
- Add subtle visual feedback for all touch interactions
- Implement proper touch states (active, hover equivalent)
- Handle multi-touch scenarios gracefully
- Prevent text selection on UI elements
- Optimize for one-handed usage on mobile devices
- Include proper spacing between interactive elements
- Test on various device sizes and input methods

Touch interactions should feel responsive and natural.
```

### Prompt 8.3: Device-Specific Optimizations
```
Implement device-specific optimizations that:
- Detect and optimize for different screen densities
- Handle landscape/portrait orientation changes
- Optimize for different device capabilities (CPU, memory)
- Implement proper meta tags for mobile browsers
- Handle different keyboard types and input methods
- Optimize for battery usage on mobile devices
- Include proper PWA manifest for installability

The app should feel optimized for each user's specific device.
```

## Phase 9: Accessibility Implementation

### Prompt 9.1: Screen Reader and Keyboard Support
```
Implement comprehensive accessibility features:
- Add proper ARIA labels and descriptions for all interactive elements
- Create proper heading hierarchy (h1, h2, h3) for content structure
- Implement full keyboard navigation with visible focus indicators
- Add skip links for main content and navigation
- Ensure all images have descriptive alt text from .md files
- Create proper landmark regions (main, nav, aside)
- Test with actual screen readers (NVDA, JAWS, VoiceOver)

The app should be fully usable without mouse or visual interface.
```

### Prompt 9.2: Color Contrast and Typography
```
Ensure visual accessibility with:
- Minimum 4.5:1 color contrast ratio for all text
- Test with color blindness simulators and adjust color choices
- Implement user-scalable fonts that respect browser zoom
- Use proper line height and letter spacing for readability
- Ensure sufficient color differentiation for UI states
- Provide high contrast mode option
- Test with users who have visual impairments

Text should be readable for users with various visual capabilities.
```

### Prompt 9.3: Motion and Animation Accessibility
```
Create accessible animations that:
- Respect prefers-reduced-motion media query
- Provide alternative indicators for motion-sensitive users
- Allow users to disable animations completely
- Ensure animations don't cause seizures or vestibular disorders
- Maintain functionality when animations are disabled
- Use semantic animations that convey meaning, not just decoration
- Test with users who have motion sensitivities

Animations should enhance, not hinder, accessibility.
```

## Phase 10: Testing & Quality Assurance

### Prompt 10.1: Unit and Integration Testing
```
Create comprehensive tests using Vitest that:
- Test all critical component functionality
- Mock image loading and external dependencies
- Test error boundaries and edge cases
- Include accessibility testing with jest-axe
- Test mobile gesture interactions
- Create visual regression tests for UI components
- Test performance with large datasets

Achieve high test coverage for critical user paths.
```

### Prompt 10.2: Performance Testing and Monitoring
```
Implement performance testing that:
- Measures Core Web Vitals (LCP, FID, CLS)
- Tests with simulated slow networks and devices
- Monitors bundle size and loading performance
- Tests memory usage with large image collections
- Includes lighthouse audits in CI/CD pipeline
- Measures real user performance
- Sets performance budgets and alerts

Ensure the app performs well for all users regardless of device or connection.
```

### Prompt 10.3: Cross-Browser and Device Testing
```
Test across different environments:
- Latest versions of Chrome, Firefox, Safari, Edge
- Various mobile devices (iOS Safari, Chrome Mobile)
- Different screen sizes and pixel densities
- Test touch vs mouse interactions
- Verify GitHub Pages deployment works correctly
- Test offline functionality and service worker
- Validate with HTML and CSS validators

Ensure consistent experience across all supported browsers and devices.
```

## Phase 11: Book Creator Development Tool (Dev Environment Only)

### Prompt 11.1: Book Creator Window - Main Interface
```
Create a comprehensive Book Creator development tool that runs only in dev environment:
- Design a full-screen modal/window interface for book creation
- Include a sidebar for book management (list existing books, create new)
- Main content area with tabbed interface: "Book Info", "Pages", "Preview"
- Real-time preview of book as it's being created
- Save all data directly to ./books/ folder structure
- No database required - work directly with file system
- Include proper error handling and validation

The interface should be intuitive and feel like a professional content management tool.
```

### Task 11.2: Unified Book and Folder Management Editor
```
Implement a comprehensive book management system that handles both simple and advanced structures:

**Book Metadata Management:**
- Form fields for title, author, publication date, description, tags
- Cover image upload with drag-and-drop functionality
- Auto-generate book folder names from titles (e.g., "My First Year" → "my-first-year")
- Handle existing simple folders (rename, reorganize) without breaking structure

**Flexible Structure Support:**
- Edit simple folder structures directly (rename folders, move images)
- Convert simple structures to advanced (add metadata.json when needed)
- Convert advanced structures to simple (remove metadata, use folder names)
- Real-time folder watching and UI sync

**Content Tree Management:**
- Visual drag-and-drop interface for reordering pages/images
- Bulk rename operations for files
- Generate content tree in metadata.json based on current folder structure
- Support custom page ordering that overrides filename sorting

**File Operations:**
- Direct folder and file manipulation through the UI
- Rename files and see immediate reflection in page titles
- Create/edit .md description files alongside images
- Validate and fix naming conflicts automatically

The editor should make it easy to work with any folder structure while maintaining data integrity.
```

### Task 11.3: Smart Image Management with Flexible Naming
```
Create a versatile image management system supporting multiple workflows:

**Upload and Organization:**
- Drag-and-drop upload with visual feedback and progress indicators
- Bulk upload from folders maintaining original filenames
- Support all common formats: jpg, jpeg, png, webp, gif, bmp
- Smart duplicate detection and handling

**Flexible Naming Strategies:**
- Option 1: Keep original filenames (descriptive titles from filenames)
- Option 2: Sequential naming (page-001.jpg, page-002.jpg)
- Option 3: Custom naming patterns (book-name_page-number.jpg)
- Easy switching between naming strategies with preview

**Visual Management:**
- Thumbnail grid with drag-and-drop reordering
- Live preview of how filename changes affect page titles
- Inline editing of filenames and corresponding titles
- Visual indicators for files with/without descriptions (.md files)

**File Operations:**
- Rename images and auto-update corresponding .md files
- Delete images with option to keep or remove descriptions
- Replace images while preserving descriptions
- Batch operations for large collections

**Integration with Simple Structures:**
- Direct manipulation of existing folder contents
- Preserve existing naming patterns when possible
- Smart suggestions for organization improvements

The system should handle both organized collections and casual photo dumps equally well.
```

### Task 11.4: Contextual Description Editor with File Sync
```
Build a markdown editor that seamlessly integrates with the file system:

**Editor Interface:**
- Split-pane view with markdown editor and live preview
- Toolbar for common markdown formatting (bold, italic, lists, links)
- Syntax highlighting and auto-completion for markdown
- Real-time preview matching final app styling

**File System Integration:**
- Auto-save .md files alongside images with matching names
- Handle filename changes by renaming corresponding .md files
- Create .md files on-demand when descriptions are added
- Support both sequential (page-001.md) and descriptive naming

**Batch Operations:**
- Multi-select images to edit descriptions in sequence
- Copy descriptions between similar images
- Template system for common description patterns
- Find and replace across all descriptions in a book

**Smart Features:**
- Auto-suggest descriptions based on image analysis (alt text generation)
- Word count and reading time estimates
- Spell check with custom dictionary support
- Export descriptions as plain text or formatted document

**Visual Context:**
- Show image thumbnail alongside editor
- Navigate between images without losing unsaved changes
- Visual indicators for images missing descriptions
- Bulk completion status tracking

The editor should make it easy to add rich descriptions to any image collection.
```

### Prompt 11.5: File System Integration and Auto-Save
```
Create robust file system integration that:
- Automatically saves changes to ./books/ folder in real-time
- Watches for external file changes and syncs with the UI
- Handles file naming conflicts and provides resolution options
- Creates proper folder structure automatically
- Implements file versioning/backup system for safety
- Provides import/export functionality for entire books
- Includes file validation and corruption detection
- Shows file system status and sync indicators in the UI
- Handles concurrent editing scenarios gracefully

Ensure data integrity and provide clear feedback about save status.
```

### Prompt 11.6: Book Preview and Testing Features
```
Implement comprehensive preview and testing features that:
- Provides full slideshow preview within the Book Creator
- Tests all interactive features (navigation, animations, responsive design)
- Simulates different device sizes and orientations
- Includes accessibility testing tools and checkers
- Validates all images load correctly and descriptions display properly
- Tests page turn animations and mobile gestures
- Provides performance metrics for the created book
- Includes export functionality to generate production-ready book
- Shows validation errors and warnings with suggested fixes

The preview should be identical to the final user experience.
```

### Prompt 11.7: Book Creator UI/UX Design
```
Design the Book Creator interface with:
- Clean, professional design that matches the main app's playful aesthetic
- Responsive layout that works on various screen sizes
- Intuitive navigation between different creation steps
- Progress indicators showing completion status
- Contextual help and tooltips for all features
- Keyboard shortcuts for power users
- Dark/light mode toggle for comfortable editing
- Customizable workspace layout (panels, toolbars)
- Quick actions for common tasks (duplicate page, bulk operations)

The interface should feel like a professional creative tool while remaining approachable.
```

### Prompt 11.8: Development Environment Integration
```
Integrate the Book Creator seamlessly with the development environment:
- Add a floating action button or menu item to access Book Creator
- Include hot-reloading for changes made through the creator
- Provide development-only routing (/dev/book-creator)
- Include debugging tools and console logging for file operations
- Add environment checks to ensure creator only runs in development
- Include performance monitoring for file operations
- Provide CLI commands for book operations (create, validate, export)
- Include proper TypeScript types for all creator functionality

Ensure the creator integrates smoothly with the existing development workflow.
```

## Phase 12: Deployment, Production, and Documentation

### Task 12: Complete Deployment Pipeline and Documentation
```
Implement full production deployment with comprehensive documentation:

**Automated GitHub Actions Deployment:**
- Trigger on push to main branch with proper branch protection
- Execute book scanning and image optimization pipeline
- Run complete test suite with coverage requirements
- Build optimized production bundle with asset optimization
- Deploy to GitHub Pages with proper error handling
- Rollback capabilities for failed deployments
- Deployment status notifications and monitoring

**Production Optimization:**
- Configure optimal caching headers for GitHub Pages
- Set up error monitoring and reporting (Sentry or similar)
- Implement privacy-friendly analytics for user behavior insights
- Create performance monitoring dashboards
- Automated Lighthouse audits in CI/CD pipeline
- Security headers configuration (CSP, HSTS, etc.)
- Bundle size monitoring with automated alerts

**Comprehensive Documentation:**
- Complete build and deployment process documentation
- User guide for adding new books to ./books/ folder
- Folder structure and naming convention explanations
- Troubleshooting guide for common issues
- Accessibility features and testing procedure documentation
- Contributor guidelines for future developers
- Performance optimization recommendations and best practices
- Book Creator development tool usage guide

**Maintenance and Monitoring:**
- Dependency update automation with security monitoring
- Performance regression detection
- User feedback collection and analysis
- Regular accessibility audits and compliance checking
- Backup and disaster recovery procedures

Deliverable: Production-ready deployment with comprehensive documentation enabling easy maintenance and extension.
```

## Phase 13: Optional Advanced Features

### Advanced Task A: Search, Sharing, and Personalization Features
```
Implement advanced features to enhance user experience:

**Advanced Search and Filtering:**
- Full-text search across book titles, authors, descriptions, and page content
- Real-time search with instant results as user types
- Advanced filtering: by date, author, tags, book length
- Search term highlighting in results
- Search state persistence during navigation
- Search suggestions and autocomplete
- Offline search with cached content

**Social Sharing Capabilities:**
- Generate beautiful share cards for individual books and pages
- Create shareable links to specific book pages
- Proper Open Graph meta tags for social media previews
- Pinterest-friendly image previews and rich pins
- Privacy-respecting sharing preferences
- Integration with messaging apps and social platforms
- QR code generation for easy mobile sharing

**User Personalization:**
- Remember last viewed position in each book (reading progress)
- Customizable reading preferences (autoplay speed, animation settings)
- Bookmark functionality for favorite pages
- Reading history and statistics tracking
- Custom themes and display preferences
- Local storage for offline personalization
- Optional cross-device preference syncing

**Analytics and Insights:**
- Privacy-friendly usage analytics
- Popular books and pages tracking
- User engagement metrics
- Performance monitoring and optimization suggestions

Deliverable: Enhanced user experience with search, sharing, and personalization features.
```

---

Each prompt in this list builds upon the previous ones and can be implemented incrementally. The prompts are designed to be specific enough to be actionable while flexible enough to adapt to changing requirements during development.