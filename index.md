  Technical Architecture

  1. Framework preference: Do you want to use React, Vue, vanilla HTML/CSS/JS, or a static site generator like Next.js/Gatsby?
  
  Latest React with Most popular Libraries
  
  2. Deployment: Where will this be hosted? (GitHub Pages, Netlify, Vercel, etc.)

  GitHub Pages
  
  3. Build process: How should the app discover books and images? Scan folders at build time or runtime?

  Scan folders at build time

  Content Structure & Data

  4. Image formats: What image types should be supported? (jpg, png, webp, etc.)
  
  jpg, png, webp
  
  5. Image ordering: How should images be ordered within a book? (alphabetical, by date modified, custom order?)

  alphabetical

  6. Missing descriptions: What should happen if an image doesn't have a corresponding .md file?

  Use a default description or prompt the user to add one.

  7. Book metadata: Do you want book titles, dates, cover images, or other metadata beyond just folder names?

  Yes, include book titles, authors, publication dates, and cover images in a metadata JSON file.

  8. File naming: Any specific naming conventions for images and description files?

  Images should be named using a consistent format, such as `book-title_page-number.jpg`. Description files should be named `book-title_page-number.md`.

  UI/UX Design

  9. Visual style: What aesthetic are you going for? (modern/minimalist, playful/colorful, elegant/classic, etc.)

  playful/colorful and aesthetic

  10. Dashboard layout: How should books be displayed? (grid of cards, list view, thumbnail gallery?)

  grid of cards

  11. Color scheme: Any preferred colors or themes?

  Bright and cheerful colors, with a focus on primary colors.

  12. Typography: Any font preferences or accessibility considerations?

  Use Childrens books fonts like Serif with larger sizes and ample line spacing for readability.

  Slideshow Features

  13. Navigation: What controls do you want? (next/prev arrows, dots indicator, thumbnail strip, keyboard shortcuts?)

  opaque next/prev arrows and dots indicator

  14. Image handling: How should different aspect ratios be handled? (letterbox, crop, fit-to-width?)

  letterbox

  15. Zoom functionality: Should users be able to zoom in on images?

  No,
  
  16. Transitions: Any preferred slide transition effects?

  Book page turn effect

  17. Autoplay: Should slideshows auto-advance, and if so, with what timing?


  Configurable timing, defaulting to 3 seconds.

  Additional Features

  18. Mobile experience: Any specific mobile considerations or gestures (swipe navigation)?

  Yes, Mobile is very important. It must feel like Mobile First.
  
  19. Performance: Expected number of books and images per book?

  100s of Books, 200-300 images per book.

  20. Accessibility: Any specific accessibility requirements?

  Yes, ensure text is readable with sufficient contrast, and provide alt text for all images.

  21. Browser support: Which browsers need to be supported?

  Latest versions of Chrome, Firefox, Safari, and Edge.

  What aspects are most important to you, and shall we start with any particular area?

  Let's start with Technical Architecture First, then move on to Prompts List. First wirte the Architecture to Architecture.md file and then the Prompts List to Prompts.md file.