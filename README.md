# Energy Insight - Unified Application

Energy Insight is a full-stack Next.js application that analyzes building energy consumption and calculates energy savings potential when upgrading from PTAC (Packaged Terminal Air Conditioner) to PTHP (Packaged Terminal Heat Pump) systems in NYC residential buildings.

## 🏗️ Unified Architecture

This application combines frontend and backend in a single Next.js project:

- **Frontend**: React with AWS Amplify authentication, Tailwind CSS, and Zustand state management
- **Backend**: Next.js API routes that integrate with NYC Open Data APIs and LangChain AI services
- **Database**: PostgreSQL with Prisma ORM
- **AI/ML**: LangChain and OpenAI for building analysis

## 🚀 Quick Start

### Prerequisites

1. Node.js 18+ and pnpm
2. PostgreSQL 16
3. Required API keys (see `.env.example`)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repo-url>
   cd energy-insight-front
   pnpm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   # Configure all variables in .env.local
   ```

3. **Set up database:**
   ```bash
   # Create PostgreSQL database
   createdb energy_insight_db
   
   # Apply schema and generate client
   pnpm run db:push
   pnpm run db:generate
   ```

4. **Run application:**
   ```bash
   pnpm run dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 📋 Available Scripts

```bash
# Development
pnpm run dev               # Development server with Turbopack
pnpm run build             # Production build
pnpm run start             # Production server

# Database
pnpm run db:push           # Apply schema changes
pnpm run db:generate       # Generate Prisma client
pnpm run db:studio         # Open Prisma Studio

# Code quality
pnpm run lint              # ESLint
pnpm run test              # Jest tests

# Documentation
pnpm run latex:build       # Generate energy calculations PDF
pnpm run latex:watch       # Auto-rebuild PDF on changes
pnpm run latex:clean       # Clean LaTeX artifacts
pnpm run latex:open        # Build and open PDF
```

## 🔧 Environment Variables

Configure in `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user@localhost:5432/energy_insight_db"

# NYC APIs
GEO_CLIENT_API_KEY="your-geoclient-key"

# AWS Cognito
AWS_REGION="us-east-1"
NEXT_PUBLIC_COGNITO_USER_POOL_ID="your-user-pool-id"
NEXT_PUBLIC_USER_POOL_CLIENT_ID="your-client-id"

# Google Maps
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY="your-google-places-key"

# LangChain/OpenAI
OPENAI_API_KEY="your-openai-key"
LANGSMITH_API_KEY="your-langsmith-key"
```

## 🏛️ API Structure

### Main Endpoints

- `POST /api/calculations` - Create new energy calculation
- `GET /api/calculations/user` - Get user's calculations
- `GET /api/calculations/[id]` - Get specific calculation
- `PUT /api/calculations/[id]` - Update calculation
- `POST /api/geo-client/address` - Resolve address to BBL

### Data Flow

1. User enters NYC address → GeoClient resolves to BBL
2. System fetches PLUTO + Local Law 84 data from NYC Open Data
3. LangChain AI service analyzes building characteristics
4. Energy calculation engine computes PTAC vs PTHP metrics
5. Results stored in database with user association

## 🛠️ Development

### Database

The project uses Prisma with PostgreSQL. For rapid development:

1. Modify `prisma/schema.prisma`
2. Run `pnpm run db:push`
3. Run `pnpm run db:generate`

### Authentication

Uses AWS Amplify with Cognito for JWT authentication. API routes automatically verify valid tokens.

### Global State

- **Zustand stores** handle application state
- **React Context** for authentication and notifications
- **API client** handles authenticated calls to local endpoints

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                 # API routes (backend)
│   │   ├── auth/           # Authentication middleware
│   │   ├── calculations/   # Calculation endpoints
│   │   └── geo-client/     # GeoClient integration
│   ├── auth/               # Authentication pages
│   ├── panel/              # User panel
│   └── page.tsx            # Landing page
├── lib/
│   ├── services/           # Backend services
│   ├── ai/                # LangChain services
│   ├── types/             # TypeScript types
│   └── prisma.ts          # Database client
├── components/            # React components
├── stores/               # Zustand stores
└── hooks/                # Custom React hooks
```

## 🚢 Deployment

The application can be deployed on any platform that supports Next.js:

- **Vercel** (recommended)
- **Railway**
- **DigitalOcean App Platform**
- **AWS Amplify Hosting**

Make sure all environment variables are configured in the deployment platform.

## 📖 Documentation

### Energy Calculations PDF

The project includes comprehensive technical documentation for the energy calculation methodology:

- **Location**: `docs/energy-calculations.tex`
- **Output**: `docs/energy-calculations.pdf`
- **Content**: Mathematical formulas, calculation methodology, and technical specifications

### Generating Documentation

```bash
# Generate PDF from LaTeX source
pnpm run latex:build

# Development workflow with auto-rebuild
pnpm run latex:watch

# Build and open PDF automatically
pnpm run latex:open

# Clean build artifacts
pnpm run latex:clean
```

### Prerequisites for LaTeX

- LuaLaTeX compiler (installed with BasicTeX or TeX Live)
- Standard LaTeX packages (amsmath, geometry, tikz, pgfplots, etc.)

The generated PDF provides detailed documentation of the energy calculation algorithms used throughout the application.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
