# Baby Book - Digital Memory Keeper

A beautiful React TypeScript application for creating and sharing digital baby books with interactive pages, photo galleries, and milestone tracking.

## 🌟 Features

- **Interactive Digital Books**: Create beautiful, page-turning digital books
- **Media Support**: Add photos, videos, and audio recordings
- **Multiple Page Layouts**: Choose from various layouts for different content types
- **Milestone Tracking**: Document important moments and achievements
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Offline Support**: Works without an internet connection (coming soon)
- **Theme Support**: Light, dark, and system theme options

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   ├── layout/         # Layout components
│   ├── book/           # Book-specific components
│   └── shared/         # Shared components
├── pages/              # Application pages/routes
├── hooks/              # Custom React hooks
├── services/           # API and external service integrations
├── stores/             # Context providers and state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── assets/             # Static assets (images, sounds)
```

## 🎨 Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom animations
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **State Management**: React Context + TanStack Query
- **Icons**: Lucide React
- **Development Tools**: ESLint, Prettier, TypeScript

## 📱 Mobile Support

The application includes:
- Responsive design for all screen sizes
- Touch gestures for page navigation
- Mobile-optimized layouts
- Progressive Web App capabilities (coming soon)

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
VITE_APP_TITLE="Baby Book"
VITE_ENABLE_ANALYTICS=false
VITE_DEV_MODE=true
```

### Customization

- **Themes**: Modify `tailwind.config.js` for custom colors and styles
- **Fonts**: Update font imports in `index.html` and theme configuration
- **Animations**: Customize animations in `src/index.css`

## 🚀 Deployment

### GitHub Pages

The project is configured for GitHub Pages deployment:

```bash
npm run build
# Deploy dist/ folder to gh-pages branch
```

### Other Platforms

The build output in `dist/` can be deployed to any static hosting service.

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and code of conduct.

## 📞 Support

If you encounter any issues or have questions, please file an issue on GitHub.

---

Made with ❤️ for preserving precious family memories.