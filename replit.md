# Overview

Aura is a social media platform focused on emotional experiences and meaningful connections. Unlike traditional social networks centered around likes and followers, Aura enables users to share mood-based content, create time capsules for future unlocking, participate in anonymous "whisper mode" conversations, and grow virtual trees through positive interactions. The application emphasizes authenticity, emotional well-being, and genuine human connections through features like mood-based posting, global mood visualization, and experience-driven social interactions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Authentication**: Session-based authentication integrated with Replit Auth
- **Responsive Design**: Mobile-first approach with glassmorphism design elements

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with OpenID Connect strategy via Replit Auth
- **Session Management**: Express sessions with PostgreSQL storage
- **File Upload**: Multer for handling media uploads
- **API Design**: RESTful API with structured error handling

## Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Design**: 
  - Users table with profile data and aura points/tree progression
  - Posts table supporting mood-based content with optional media
  - Time capsules with unlock date functionality
  - Mood circles for group interactions
  - Vibes system for positive interactions
  - Global mood statistics tracking
- **Migrations**: Managed through Drizzle Kit

## Key Features Architecture
- **Mood-Based Posting**: Posts are categorized by emotional states (happy, calm, motivated, etc.)
- **Time Capsule System**: Scheduled content unlocking for future dates
- **Aura Tree Growth**: Gamification through points and virtual tree progression
- **Whisper Mode**: Anonymous posting with content moderation
- **Global Mood Map**: Real-time visualization of worldwide emotional trends
- **Experience Exchange**: Cultural and emotional sharing across geographical boundaries

## Design Patterns
- **Component Composition**: Modular UI components with consistent interfaces
- **Data Fetching**: React Query for caching, synchronization, and optimistic updates
- **Error Handling**: Centralized error boundaries with user-friendly messaging
- **Authentication Flow**: Automatic redirect handling for unauthorized users
- **Real-time Updates**: WebSocket integration for live mood statistics

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for state management
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Development server and build tool with HMR support

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives (@radix-ui/react-* packages)
- **shadcn/ui**: Pre-built component library with consistent design tokens
- **Lucide React**: Icon library for consistent iconography

## Backend Infrastructure
- **Express.js**: Web application framework
- **Passport.js**: Authentication middleware
- **Multer**: File upload handling
- **WebSocket**: Real-time communication support

## Database and ORM
- **Neon Database**: Serverless PostgreSQL hosting (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe database operations (drizzle-orm)
- **Connection Pooling**: PostgreSQL connection management

## Authentication Services
- **Replit Auth**: OAuth integration for user authentication
- **OpenID Connect**: Standardized authentication protocol
- **Session Storage**: PostgreSQL-backed session management

## Development and Deployment
- **Replit Platform**: Hosting and development environment
- **Environment Configuration**: Secure environment variable management
- **Build Pipeline**: Vite for frontend, ESBuild for backend compilation

## Third-Party Integrations
- **Font Integration**: Google Fonts (Inter, Poppins, Fira Code)
- **Replit Services**: Development banner and Cartographer for debugging
- **PostCSS**: CSS processing with Autoprefixer