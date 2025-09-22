# Frontend - Web-UI-AI

A modern React TypeScript frontend for the ChatGPT-like application.

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common components (Button, Input, Modal)
│   ├── layout/          # Layout components (Header, Sidebar, Footer)
│   └── chat/            # Chat-specific components
├── pages/               # Page components
│   ├── auth/            # Authentication pages
│   ├── chat/            # Chat pages
│   └── dashboard/       # Dashboard pages
├── hooks/               # Custom React hooks
├── services/            # API services and external integrations
├── store/               # State management (Redux/Context)
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and helpers
├── styles/              # Global styles and CSS variables
└── assets/              # Static assets (images, icons)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Features

### Components

- **Button**: Customizable button component with variants and sizes
- **Input**: Form input with validation and error states
- **Modal**: Accessible modal component with overlay and escape handling

### Pages

- **Login**: User authentication with Google OAuth
- **Register**: User registration with email verification
- **Dashboard**: Main application dashboard
- **AuthCallback**: OAuth callback handler

### Hooks

- **useAuth**: Authentication state management
- **useApi**: API call management with loading and error states
- **useLocalStorage**: Local storage management

### Services

- **authAPI**: Authentication API calls
- **conversationAPI**: Conversation management API calls
- **tokenStorage**: Token and user data storage

## 🎯 Key Features

- **TypeScript**: Full type safety throughout the application
- **Modern React**: Uses React 19 with hooks and functional components
- **CSS Modules**: Scoped styling with CSS modules
- **Responsive Design**: Mobile-first responsive design
- **Accessibility**: WCAG compliant components
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Loading indicators for better UX

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Web-UI-AI
VITE_APP_VERSION=1.0.0
```

### API Integration

The frontend integrates with the NestJS backend API:

- **Authentication**: JWT-based authentication with Google OAuth
- **Conversations**: CRUD operations for conversations
- **Real-time**: WebSocket integration for real-time messaging

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🎨 Styling

### CSS Variables

The application uses CSS custom properties for consistent theming:

```css
:root {
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --font-family-sans: 'Inter', sans-serif;
  /* ... more variables */
}
```

### Utility Classes

Common utility classes for spacing, typography, and layout:

```css
.container { /* Container with max-width */ }
.text-center { /* Center text alignment */ }
.flex { /* Flexbox display */ }
.grid { /* CSS Grid display */ }
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 📦 Build

```bash
# Development build
npm run build

# Production build
npm run build:prod

# Analyze bundle
npm run analyze
```

## 🚀 Deployment

The application can be deployed to any static hosting service:

- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **AWS S3**: Upload `dist/` folder
- **Docker**: Use the provided Dockerfile

## 🔍 Development

### Code Style

- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting
- **Husky**: Git hooks for code quality

### Git Workflow

1. Create feature branch from `main`
2. Make changes with proper commit messages
3. Run tests and linting
4. Create pull request

## 📚 Documentation

- **Component API**: Each component has TypeScript interfaces
- **Hooks**: Custom hooks are documented with JSDoc
- **Services**: API services have inline documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.