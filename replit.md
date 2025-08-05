# SnapDish - Smart Cooking Assistant

## Overview

SnapDish is a smart mobile cooking assistant application that helps users identify dishes from photos, discover recipes based on available ingredients, and get cooking assistance through an AI-powered chat interface. The app combines image recognition, recipe search, and nutritional analysis into a unified cooking experience.

The application is built as a full-stack web application with a React frontend and Express.js backend, designed with a mobile-first approach and responsive design principles.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom color scheme and typography
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Mobile-First Design**: Responsive layout optimized for mobile devices with bottom navigation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with organized route structure
- **File Upload**: Multer middleware for handling image uploads
- **Data Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error handling middleware
- **Development Tools**: Hot reloading with Vite integration in development

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for schema management
- **Connection**: Neon Database serverless PostgreSQL
- **Schema**: Structured tables for users, recipes, ingredients, and chat history
- **Session Storage**: In-memory storage with potential for database persistence
- **Local Storage**: Browser localStorage for user preferences and temporary data

### Authentication and Authorization
- **Session Management**: Basic session handling (implementation in progress)
- **User Model**: Simple username/password authentication structure
- **Storage**: Session data stored in memory with cookie-based session management

### External Service Integrations

#### Image Recognition Services
- **Google Vision API**: Primary service for food dish identification and ingredient recognition
- **OpenAI Vision API**: Alternative implementation for image analysis
- **Service Pattern**: Abstracted interface allowing switching between providers

#### Recipe and Nutrition APIs
- **Edamam Recipe API**: Recipe search, detailed recipe information, and cooking instructions
- **Edamam Nutrition API**: Nutritional analysis and calorie information
- **OpenAI Recipe Generation**: Fallback service for generating recipes using GPT-4
- **Caching Strategy**: In-memory caching for expensive API calls with configurable expiration

#### AI Assistant Integration
- **OpenAI GPT-4**: Conversational cooking assistant for recipe advice, substitutions, and cooking tips
- **Context Awareness**: Chat responses consider current recipe context and user history
- **Fallback Responses**: Mock responses for development and API failure scenarios

#### Development and Deployment
- **Environment**: Replit-optimized with development banners and cartographer integration
- **Build Process**: Separate client and server builds with static file serving
- **Hot Reloading**: Vite middleware integration for seamless development experience

### Key Design Patterns
- **Service Layer Architecture**: Separated business logic into dedicated service classes
- **Interface Segregation**: Abstract interfaces for external services enabling easy provider switching
- **Error Boundary Pattern**: Comprehensive error handling at API and UI levels
- **Mobile-First Responsive Design**: Optimized for mobile devices with progressive enhancement
- **Component Composition**: Reusable UI components with consistent design system