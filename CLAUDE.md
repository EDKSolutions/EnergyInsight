# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server with Turbopack
pnpm run dev

# Production build (includes Prisma client generation)
pnpm run build

# Code quality
pnpm run lint
pnpm test

# Database operations
pnpm run db:push          # Apply schema changes to database
pnpm run db:generate      # Generate Prisma client
pnpm run db:studio        # Open Prisma Studio GUI

# Release management
pnpm run release          # Create versioned release with standard-version
```

## Architecture Overview

This is a unified Next.js 15 full-stack application that combines frontend and backend in a single project:

### Core Technologies
- **Frontend**: React 19, Tailwind CSS, Zustand for state management
- **Backend**: Next.js API routes with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: AWS Amplify with Cognito (JWT-based)
- **AI/ML**: LangChain with OpenAI for building analysis
- **External APIs**: NYC Open Data (GeoClient, PLUTO, Local Law 84)

### Application Domain
Energy efficiency analysis for NYC residential buildings, specifically calculating PTAC to PTHP conversion savings. The application processes real building data from NYC Open Data APIs and performs complex energy calculations.

## Key Architectural Patterns

### API Structure
- All API routes are in `src/app/api/`
- Authentication middleware in `src/app/api/auth/middleware.ts` validates JWT tokens
- Main calculation endpoints: `/api/calculations` (CRUD operations)
- External data integration: `/api/geo-client/address` (BBL resolution)

### State Management
- **Zustand stores**: Primary state management (calculations, edit mode, results)
- **React Context**: Authentication (`AuthContext`) and notifications (`ToastContext`)
- **Custom hooks**: `use-auth.ts`, `useCalculationEdit.ts` for business logic

### Database Schema
The Prisma schema defines:
- `Calculations`: Core entity with comprehensive energy calculation fields
- `User` and `UserIdentityProvider`: Authentication models
- `UserCalculations`: Many-to-many relationship between users and calculations

### AI Integration
- `src/lib/ai/` contains LangChain services for building analysis
- Two implementations: `LlmBasedUnitBreakdown` and `LangsmithUnitBreakdown`
- Services analyze building characteristics from PLUTO data to determine unit mix

### Authentication Flow
1. AWS Amplify handles user authentication
2. API routes automatically verify JWT tokens via middleware
3. User context provides authentication state to React components
4. Protected routes redirect to `/auth/sign-in` if unauthenticated

## Important Development Notes

### Database Workflow
Always run `pnpm run db:generate` after schema changes to update the Prisma client. The build process includes this automatically.

### Environment Dependencies
The application requires multiple API keys:
- NYC GeoClient API for address resolution
- Google Places API for address autocomplete
- OpenAI API for building analysis
- AWS Cognito for authentication

### Code Conventions
- TypeScript strict mode enabled
- ESLint with Next.js configuration
- Husky pre-commit hooks with standard-version for releases
- Components follow atomic design patterns in `src/components/`

### Testing
- Jest configured for testing (though minimal test coverage currently exists)
- Run `pnpm test` to execute test suite