# Deployment Guide - Vercel Auto-Deploy Setup

Este documento describe los pasos para configurar el auto-deployment a Vercel con migraciones automáticas de base de datos.

## 📋 Pre-requisitos

- Cuenta de Vercel ([vercel.com](https://vercel.com))
- Repositorio en GitHub
- Base de datos PostgreSQL en producción (recomendado: Neon, Supabase, o Railway)

## 🚀 Paso 1: Configurar Base de Datos de Producción

### Opción A: Neon (Recomendado)
1. Ve a [neon.tech](https://neon.tech) y crea una cuenta
2. Crea un nuevo proyecto
3. Copia la connection string (DATABASE_URL)

### Opción B: Supabase
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Ve a Settings > Database
4. Copia la connection string de PostgreSQL

### Opción C: Railway
1. Ve a [railway.app](https://railway.app) y crea una cuenta
2. Crea un nuevo proyecto con PostgreSQL
3. Copia la connection string

## 🔧 Paso 2: Configurar Proyecto en Vercel

1. **Importar desde GitHub:**
   - Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click en "New Project"
   - Importa tu repositorio de GitHub

2. **Configurar Variables de Entorno:**
   En la sección "Environment Variables", agrega:

   ```bash
   # Database
   PRISMA_DATABASE_URL=your_production_database_url
   
   # AWS Amplify/Cognito
   NEXT_PUBLIC_AWS_REGION=us-east-1
   NEXT_PUBLIC_AWS_USER_POOL_ID=your_user_pool_id
   NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID=your_client_id
   
   # API Keys
   GEOCLIENT_APP_ID=your_geoclient_app_id
   GEOCLIENT_APP_KEY=your_geoclient_app_key
   GOOGLE_PLACES_API_KEY=your_google_places_key
   OPENAI_API_KEY=your_openai_key
   
   # LangChain (opcional)
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
   LANGCHAIN_API_KEY=your_langchain_key
   LANGCHAIN_PROJECT=your_project_name
   ```

3. **Configurar Build Settings:**
   - Framework Preset: Next.js
   - Build Command: `pnpm run vercel-build`
   - Install Command: `pnpm install --frozen-lockfile`
   - Output Directory: `.next`

## ⚙️ Paso 3: Auto-Deploy Configuration

### GitHub Integration
1. **Automatic Deployments:**
   - Production branch: `main`
   - Preview branches: Todas las demás ramas
   
2. **Branch Protection (Recomendado):**
   En GitHub, ve a Settings > Branches:
   ```
   Branch name pattern: main
   ✅ Require a pull request before merging
   ✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   ```

### Webhook Configuration (Opcional)
Para notificaciones de deployment:
```json
{
  "url": "https://your-app.vercel.app/api/webhooks/deployment",
  "events": ["deployment.created", "deployment.succeeded", "deployment.failed"]
}
```

## 🗄️ Paso 4: Database Migration Strategy

### Configuración Actual
Los scripts ya configurados en `package.json`:

```json
{
  "scripts": {
    "vercel-build": "npx prisma generate --no-engine && npx prisma migrate deploy && next build",
    "db:migrate:prod": "npx prisma migrate deploy",
    "postinstall": "npx prisma generate"
  }
}
```

### Flujo de Migraciones
1. **Desarrollo:**
   ```bash
   # Crear nueva migración
   pnpm run db:migrate:dev --name describe_your_change
   
   # Aplicar cambios
   pnpm run db:push
   ```

2. **Production (Automático):**
   - Al hacer merge a `main`, Vercel ejecuta `vercel-build`
   - Esto corre `prisma migrate deploy` automáticamente
   - Las migraciones se aplican antes del build

### ⚠️ Consideraciones Importantes
- **Migraciones Destructivas:** Siempre revisa antes de hacer merge
- **Backup:** Configura backups automáticos en tu proveedor de DB
- **Rollback:** Ten un plan de rollback para migraciones complejas

## 🔄 Paso 5: Workflow de Development

### Proceso Recomendado:
1. **Feature Branch:**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   # Desarrollar...
   ```

2. **Database Changes:**
   ```bash
   # Si necesitas cambios en DB
   pnpm run db:migrate:dev --name add_new_field
   ```

3. **Testing:**
   ```bash
   pnpm run build  # Test local build
   pnpm run lint   # Check linting
   pnpm test       # Run tests
   ```

4. **Pull Request:**
   ```bash
   git push origin feature/nueva-funcionalidad
   # Crear PR en GitHub
   ```

5. **Auto-Deploy:**
   - Merge to `main` → Automatic deployment
   - Vercel runs migrations → Builds app → Deploys

## 🔍 Paso 6: Monitoring & Troubleshooting

### Vercel Dashboard
- **Deployments:** Ve el estado de cada deployment
- **Functions:** Monitorea performance de API routes
- **Analytics:** Usage y performance metrics

### Logs y Debugging
```bash
# Ver logs de deployment en Vercel
vercel logs [deployment-url]

# Check migration status
npx prisma migrate status

# Reset migrations (SOLO EN DEV)
npx prisma migrate reset
```

### Common Issues
1. **Migration Fails:** Check database permissions
2. **Build Timeout:** Increase function timeout in vercel.json
3. **Environment Variables:** Ensure all required vars are set

## 📊 Paso 7: Environment Strategy

### Production
- Branch: `main`
- Database: Production DB
- Domain: your-app.vercel.app

### Staging (Opcional)
- Branch: `develop`
- Database: Staging DB
- Domain: your-app-git-develop.vercel.app

### Preview
- Branch: Feature branches
- Database: Preview DB (opcional) o shared staging
- Domain: your-app-git-[branch].vercel.app

## ✅ Checklist Final

Antes del primer deployment:

- [ ] Base de datos de producción configurada
- [ ] Variables de entorno configuradas en Vercel
- [ ] GitHub repository conectado
- [ ] Branch protection rules configuradas
- [ ] Migraciones testeadas localmente
- [ ] Build process testeado
- [ ] AWS Amplify/Cognito configurado para producción
- [ ] API keys válidas para producción

## 🚨 Security Notes

- Nunca commitear API keys al repositorio
- Usar diferentes keys para dev/staging/prod
- Configurar CORS apropiadamente
- Implementar rate limiting en API routes
- Regular security audits de dependencies

---

## 📞 Support

Para issues específicos:
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Prisma Docs: [prisma.io/docs](https://prisma.io/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)