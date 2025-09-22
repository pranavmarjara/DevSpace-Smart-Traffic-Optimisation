# Smart Traffic Management System

## Overview

This is an AI-powered Smart Traffic Management System designed for government use, specifically for urban traffic optimization. The system provides real-time monitoring and control of traffic intersections, with the goal of reducing commute times by 10% through intelligent signal management.

The application features a comprehensive dashboard for traffic officials to monitor intersection status, analyze traffic patterns, receive system alerts, and make informed decisions about traffic signal adjustments. The system includes AI-powered recommendations for signal timing optimization and supports emergency mode operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessible, professional interface components
- **Styling**: Tailwind CSS with custom design system following Fluent Design principles for government enterprise applications
- **State Management**: TanStack Query for server state management and data fetching
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Flask (Python) with modular blueprint structure
- **API Design**: RESTful API using Flask-RESTful for standardized endpoint management
- **Authentication**: Flask-Login for session management (currently disabled during migration)
- **Security**: Flask-WTF for CSRF protection and form validation
- **Application Factory**: Centralized app configuration using Flask application factory pattern

### Data Storage
- **Database**: SQLAlchemy ORM for database abstraction
- **Models**: Structured data models for Users, Intersections, Alerts, Traffic Volume, and Metric Snapshots
- **Schema**: UUID-based primary keys for scalability and JSON fields for flexible configuration storage

### Key Features
- **Real-time Monitoring**: Live traffic intersection status with color-coded visualization
- **AI Recommendations**: Intelligent signal timing adjustments based on traffic patterns
- **Alert System**: Multi-level alert notifications (critical, warning, info, success)
- **Analytics Dashboard**: Performance metrics with trend analysis and target tracking
- **Emergency Mode**: Special handling for critical traffic situations
- **Traffic Map**: Interactive visualization of intersection locations and status

### Design System
- **Color Scheme**: Government-appropriate blue primary colors with status-specific colors (green for optimal, orange for moderate, red for congested)
- **Typography**: Inter font family for professional, readable interface
- **Layout**: Responsive design with sidebar navigation and card-based content organization
- **Dark Mode**: Full dark/light theme support with system preference detection

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React 18, React DOM for core framework functionality
- **UI Components**: Radix UI primitives for accessible component foundation
- **Data Visualization**: Recharts for traffic analytics charts and graphs
- **Styling**: Tailwind CSS with custom configuration and animation plugins
- **Icons**: Lucide React for consistent iconography
- **Utilities**: Class-variance-authority for component variant management, clsx and tailwind-merge for className handling

### Backend Dependencies
- **Web Framework**: Flask with extensions (SQLAlchemy, Login, WTF)
- **Database**: SQLAlchemy for ORM and database management
- **Security**: Werkzeug for password hashing and security utilities
- **Environment**: Python-dotenv for environment variable management

### Development Tools
- **Build System**: Vite with React plugin for development and production builds
- **TypeScript**: Full TypeScript support with strict configuration
- **Linting**: ESLint and TypeScript compiler for code quality
- **CSS Processing**: PostCSS with Tailwind CSS and Autoprefixer

### Server Configuration
- **Production Server**: Configured for Gunicorn deployment with uv package manager
- **Static Files**: Flask serves React build from dist/public directory  
- **API Routing**: Separate API blueprint mounted at /api prefix
- **Environment Variables**: DATABASE_URL and SECRET_KEY configuration configured
- **Database**: PostgreSQL database provisioned and initialized
- **Build Process**: Vite builds React frontend to dist/public, Flask serves as static files

### Recent Setup Changes (September 22, 2025)
- Migrated from development stack to production-ready Flask + React architecture
- Configured uv Python package manager for dependency management
- Set up PostgreSQL database with environment variables
- Updated build process to use Vite for React frontend compilation
- Configured Gunicorn with proper host binding for Replit environment
- Fixed TypeScript path mappings for proper module resolution
- Established workflow for serving combined Flask backend + React frontend on port 5000