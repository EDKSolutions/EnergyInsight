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

# LaTeX documentation generation
pnpm run latex:build      # Generate energy calculations PDF
pnpm run latex:watch      # Auto-rebuild PDF on changes
pnpm run latex:clean      # Clean LaTeX build artifacts
pnpm run latex:open       # Build and open PDF
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

### Variable Naming Conventions

#### Energy Unit Abbreviations
Consistent naming for energy calculations is critical for alignment between implementation code and LaTeX documentation:

**Energy Units:**
- `kWh` (kilowatt-hour): Use "kWh" in variable names, never "kwh" or "KWH"
- `MMBtu` (million British thermal units): Use "MMBtu" for consistency
- `tCO₂e` (tons of CO₂ equivalent): Use "tCO2e" in code (LaTeX uses proper subscripts)

**Variable Naming Patterns:**
```typescript
// Annual building totals by unit and system type
annualBuilding[Unit][System]: 
  - annualBuildingkWhHeatingPTHP
  - annualBuildingkWhCoolingPTAC
  - annualBuildingMMBtuTotalPTAC

// Per-unit consumption rates  
annualUnit[Unit][System]:
  - annualUnitKwhCoolingPTAC
  - annualUnitMMBtuHeatingPTAC

// Pricing variables
price[Unit][Time]:
  - priceKwhHour ($0.24 per kWh)
  - priceThermHour ($1.50 per therm)

// Conversion constants
[UNIT]_PER_[UNIT]:
  - KWH_PER_MMBTU (293.1 kWh per MMBtu)
  - MMBTU_PER_KWH (0.003412 MMBtu per kWh)
```

**Documentation Alignment:**
- Variable names in TypeScript code must match exactly with those used in LaTeX documentation
- Use descriptive names that clearly indicate units, time periods, and system types
- Maintain consistency between database schema field names and calculation variable names

### Testing
- Jest configured for testing (though minimal test coverage currently exists)
- Run `pnpm test` to execute test suite

## LaTeX Documentation

The project includes comprehensive energy calculations documentation in LaTeX format located in `docs/`.

### LaTeX Setup
- Uses LuaLaTeX compiler for better font handling and Unicode support
- Main document: `energy-calculations.tex`
- Includes mathematical equations, diagrams, and technical specifications

### Building Documentation
```bash
# Generate PDF from LaTeX source
pnpm run latex:build

# Development workflow - auto-rebuild on changes
pnpm run latex:watch

# Build and open PDF in system viewer
pnpm run latex:open

# Clean build artifacts (aux, log, etc.)
pnpm run latex:clean
```

### LaTeX Dependencies
The system requires:
- LuaLaTeX compiler (included in BasicTeX or TeX Live)
- Standard LaTeX packages: amsmath, amsfonts, geometry, xcolor, tikz, pgfplots, listings

### Output
Generated PDF contains detailed energy calculations methodology, formulas, and analysis used by the application's calculation engine.

### LaTeX Setup on macOS
For detailed LaTeX installation and setup instructions on macOS, see `latex-macbook-setup.md` in the project root.