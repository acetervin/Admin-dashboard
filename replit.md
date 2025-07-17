# Family Peace Foundation - Donation & Event Registration Platform

## Overview

This is a full-stack web application for the Family Peace Foundation, a Kenyan non-profit organization focused on family counseling and community outreach. The platform facilitates online donations and event registrations with integrated payment processing through Pesapal.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Simple session-based authentication
- **Payment Integration**: Pesapal payment gateway for mobile money and card payments

## Key Components

### Database Schema
- **Users**: Admin authentication with role-based access
- **Transactions**: Payment transaction tracking with Pesapal integration
- **Donations**: Donation records linked to transactions with configurable amounts
- **Events**: Event management with registration fees and participant limits
- **Event Registrations**: Individual and organization registration tracking
- **Pesapal Integration**: Token and IPN URL management for payment processing

### Payment Processing
- **Integration**: Pesapal payment gateway supporting M-Pesa, Airtel Money, and card payments
- **Currency**: Kenyan Shillings (KES)
- **Transaction Flow**: Initiate → Redirect to Pesapal → IPN callback → Status update
- **Security**: Merchant reference validation and IPN verification

### User Interface
- **Public Pages**: Home, donation forms, event registration, payment status pages
- **Admin Dashboard**: Transaction monitoring, analytics, and system management
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: Radix UI components ensure WCAG compliance

## Data Flow

1. **Donation Flow**:
   - User selects donation type and amount
   - Form submission creates transaction record
   - Pesapal payment initiation with redirect URL
   - User completes payment on Pesapal
   - IPN callback updates transaction status
   - Email confirmation sent to donor

2. **Event Registration Flow**:
   - User browses available events
   - Registration form with individual/organization options
   - Payment processing identical to donations
   - Registration confirmation and event details

3. **Admin Monitoring**:
   - Real-time transaction status updates
   - Payment method analytics
   - Success rate monitoring
   - Donor and participant management

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL driver
- **drizzle-orm**: Type-safe database ORM
- **bcryptjs**: Password hashing for admin accounts
- **express**: Web application framework
- **react**: Frontend framework
- **@tanstack/react-query**: Server state management

### UI Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **wouter**: Lightweight React router

### Development Dependencies
- **typescript**: Type safety
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite development server with HMR
- **Database**: Neon Database with connection pooling
- **Environment Variables**: DATABASE_URL for database connection
- **Session Storage**: PostgreSQL session store

### Production Deployment
- **Build Process**: Vite builds client, esbuild bundles server
- **Static Assets**: Served from dist/public directory
- **Database Migrations**: Drizzle Kit for schema management
- **Environment**: NODE_ENV=production with optimized builds

### Database Management
- **Schema Migrations**: Located in ./migrations directory
- **ORM Configuration**: Drizzle config with PostgreSQL dialect
- **Connection Pooling**: Neon serverless connection management

### Security Considerations
- **Authentication**: Session-based admin authentication
- **Payment Security**: Pesapal IPN validation
- **Environment Variables**: Secure configuration management
- **CORS**: Configured for production domain

The application follows a monorepo structure with shared TypeScript definitions, separate client and server directories, and comprehensive type safety throughout the stack.