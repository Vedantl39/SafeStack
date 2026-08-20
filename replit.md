# SafeStack - AI Governance Playbook

## Overview

SafeStack is a full-stack web application designed to help FinTech SMEs navigate AI compliance and governance requirements. The application provides interactive tools for risk assessment, bias detection, compliance planning, and regulatory guidance, specifically targeting GDPR, EU AI Act, and other financial technology regulations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful API endpoints with JSON responses

### Database Architecture
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Connection Pooling**: Neon serverless connection pooling
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Session Storage**: PostgreSQL-based session storage

## Key Components

### Authentication System
- JWT token-based authentication
- Secure password hashing with bcrypt
- Session management with localStorage
- Protected routes and API endpoints

### Module System
1. **Model Classification**: AI-powered tool to categorize AI systems as Low, Medium, High-Risk, or Prohibited under EU AI Act
2. **Document Risk Analyzer**: AI-powered document analysis for compliance risks and sensitive data detection
3. **Bias & Fairness Module**: Interactive checklist to ensure AI systems are fair and unbiased
4. **Regulation Translator**: Breaks down complex GDPR and EU AI Act regulations into plain English explanations
5. **Global Chat Assistant (SafeBot)**: Context-aware AI assistant available on every page for real-time regulatory guidance

### Dashboard & Analytics
- User progress tracking across modules
- Risk assessment distribution charts
- Module usage analytics
- Feedback collection and analysis

### Resource Bank
- Template downloads for compliance documentation
- Open-source tool recommendations
- External resource links and guides

## Data Flow

1. **User Registration/Login**: Client authenticates with server, receives JWT token
2. **AI Model Classification**: Users input AI system details, OpenAI API analyzes and categorizes risk level
3. **Document Analysis**: PDF/Word documents uploaded, AI analyzes for compliance risks and sensitive data
4. **Dashboard Analytics**: Real-time metrics showing classification results, document analyses, and risk distributions
5. **SafeBot Interactions**: Context-aware chat responses using EU AI Act content and user's current analysis results

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Query)
- UI libraries (Radix UI, Lucide icons, Chart.js)
- Form handling (React Hook Form, Zod validation)
- Styling (Tailwind CSS, class-variance-authority)

### Backend Dependencies
- Express.js for HTTP server
- Drizzle ORM for database operations
- Neon serverless PostgreSQL driver
- Authentication libraries (jsonwebtoken, bcrypt)
- Session management (connect-pg-simple)

### Development Dependencies
- TypeScript for type safety
- Vite for build tooling and development server
- Drizzle Kit for database schema management
- ESBuild for backend bundling

## Deployment Strategy

### Development Environment
- Replit configuration with Node.js 20, PostgreSQL 16
- Vite dev server on port 5000
- Hot module replacement for frontend development
- tsx for TypeScript execution in development

### Production Build
- Frontend: Vite build to `dist/public`
- Backend: ESBuild bundle to `dist/index.js`
- Environment variables for database connection and JWT secrets
- Autoscale deployment target on Replit

### Database Setup
- Drizzle migrations in `./migrations` directory
- Schema defined in `shared/schema.ts`
- Database URL from environment variables
- Connection pooling for production scalability

## User Preferences

Preferred communication style: Simple, everyday language.
Chat interface: No automatic scrolling - user controls scroll position manually.
Response formatting: Natural, conversational English without bullet points, dashes, or markdown symbols. Elegant, flowing text that sounds professional yet human.

## Recent Changes

- July 23, 2025: Enhanced SafeBot Assistant user experience and conversational behavior
  - Changed user message bubbles from green to primary blue for visual consistency with website theme
  - Enhanced SafeBot to behave like a real assistant: asking follow-up questions, guiding step-by-step, offering help conversationally
  - Updated welcome messages to be more conversational and helpful rather than formal
  - Improved quick questions to focus on actionable assistance
  - SafeBot now engages users personally and offers concrete next steps instead of just providing information

- July 21, 2025: Removed Regulation Chat Assistant tab and replaced with persistent SafeBot
  - Eliminated standalone regulation translator page and navigation menu item
  - Replaced dedicated chat page with global floating SafeBot widget accessible on all pages
  - Users now interact with SafeBot directly from any page instead of navigating to separate chat interface

- July 21, 2025: Implemented Global Context-Aware Chat Assistant (SafeBot)
  - Transformed existing regulation chat into persistent floating widget available on all pages
  - Added context-awareness that detects current page and tailors responses accordingly
  - Created chat context provider that fetches relevant data (classifications, document analyses, metrics)
  - Enhanced AI responses with page-specific context and real-time data references
  - Added "Ask SafeBot" button in header navigation for easy access
  - Integrated with existing EU AI Act and GDPR knowledge base
  - Chat remembers conversation history per session and provides contextual quick questions
  - Widget automatically adjusts welcome messages based on current page location

- July 15, 2025: Created AI Model Classification Python Application
  - Built full-stack Streamlit application for EU AI Act compliance classification
  - Integrated OpenAI API for intelligent AI model risk assessment
  - Implemented Replit database storage for classification reports
  - Added CSV upload/download functionality for model inventory management
  - Created traffic-light dashboard with risk visualization
  - Supports Prohibited, High-Risk, Medium-Risk, Low-Risk, and Unregulated classifications
  - Includes comprehensive report history and analytics features

- July 7, 2025: Enhanced Document Risk Analyzer UI consistency
  - Updated Risk Analysis Results empty state to match Document Upload styling
  - Applied consistent dashed border design across both sections
  - Improved visual consistency and user experience

- July 7, 2025: Added Document Risk Analyzer Module
  - Created comprehensive document upload and analysis system for PDF and Word documents
  - Implemented AI-powered risk detection using OpenAI for regulatory compliance analysis
  - Added automated detection of sensitive data usage, missing human oversight, unclear legal basis
  - Built risk categorization system with High/Medium/Low/None tiers
  - Used subprocess approach for PDF parsing to avoid library conflicts
  - Integrated with existing module completion and progress tracking system
  - Added smooth Framer Motion animations consistent with other modules

- July 4, 2025: Added Smooth Animated UI Transitions for Regulatory Sections
  - Implemented sophisticated Framer Motion animations throughout regulation translator interface
  - Added smooth entrance animations for header, sidebar, and chat sections with staggered timing
  - Enhanced chat messages with spring-based animations and hover effects
  - Added interactive button animations with scale transitions and micro-interactions
  - Improved loading states with breathing animations and smooth transitions
  - Created elegant badge animations for sources and articles with cascading effects
  - Enhanced input area with focus animations and interactive send button
  - All animations use natural spring physics for premium user experience

- July 4, 2025: Integrated EU AI Act Document Analysis & Chat Interface
  - Added comprehensive EU AI Act PDF analysis using OpenAI integration
  - Transformed Regulation Translator into interactive chat interface for EU AI Act and GDPR questions
  - Created Risk Assessment module with authentic EU AI Act risk categories
  - Built Bias & Fairness module with fundamental rights compliance checklist
  - Implemented AI-powered document analysis for authentic regulatory guidance
  - Added real-time chat with plain English answers from actual EU AI Act content
  - Connected all modules to actual EU AI Act content for accurate compliance information

- July 2, 2025: Fixed UI/UX Issues
  - Removed Health Status field from GDPR assessment form per user request
  - Fixed "View Modules" button text visibility on landing page with semi-transparent background
  - Enhanced button contrast for better accessibility across light/dark themes
  - Streamlined GDPR form to focus on essential data: Name, Income, Location, Financial Behavior, AI usage

- July 1, 2025: Added GDPR Risk Assessment Module
  - Created comprehensive client data input form with file upload support (CSV/JSON)
  - Implemented GDPR risk assessment API with automated sensitive data detection
  - Added risk categorization: High (AI + sensitive data), Medium (AI only), Low (no AI)
  - Integrated sensitive keyword detection for financial and personal data
  - Created new module page accessible via navigation menu
  - Enhanced form components with proper dark mode styling

- July 1, 2025: Rebranded to "SafeStack" and enhanced theme functionality
  - Changed website name from "AI Governance Playbook" to "SafeStack"
  - Implemented comprehensive dark/light theme system with ThemeProvider
  - Added theme toggle component with sun/moon icons and smooth transitions
  - Updated all branding across login, register, header, and landing pages
  - Enhanced UI with proper dark mode styling throughout the application
  - Improved session analytics with time-period aggregation for better data visualization

- June 25, 2025: Added comprehensive analytics features
  - Session time tracking with automatic start/end
  - Click heatmap analytics to track user interaction patterns
  - Resource access tracking for most popular templates and tools
  - New dashboard charts showing session duration, click patterns, and resource usage
  - Analytics context provider for seamless tracking across the application

## Changelog

Changelog:
- July 1, 2025. Rebranded to SafeStack with comprehensive dark/light theme support
- June 25, 2025. Initial setup with full AI Governance Playbook features
- June 25, 2025. Added analytics: session tracking, click heatmaps, resource access monitoring