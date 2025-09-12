# 🚀 Pasos para Deploy Automático en Vercel

## 📁 Archivos Configurados

✅ **Archivos creados/modificados:**
- `vercel.json` - Configuración de Vercel
- `package.json` - Scripts de build y migraciones
- `.env.example` - Template de variables de entorno
- `DEPLOYMENT.md` - Guía completa de deployment
- `.github/workflows/ci.yml` - Pipeline de CI/CD
- `scripts/deploy-check.sh` - Script de verificación
- Migración inicial: `prisma/migrations/20250912180611_initial_schema/`

## 🚀 Pasos para Deploy

### 1. Configurar Base de Datos de Producción

**Opción Recomendada: Neon**
```bash
# 1. Ve a https://neon.tech
# 2. Crea una cuenta y un nuevo proyecto
# 3. Copia la connection string
```

**Connection String ejemplo:**
```
postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. Configurar Proyecto en Vercel

1. **Importar repositorio:**
   - Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Conecta con GitHub y selecciona tu repositorio

2. **Variables de entorno en Vercel:**
   ```bash
   PRISMA_DATABASE_URL=postgresql://username:password@host:5432/database
   NEXT_PUBLIC_AWS_REGION=us-east-1
   NEXT_PUBLIC_AWS_USER_POOL_ID=us-east-1_XXXXXXXXX
   NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID=your_client_id
   GEOCLIENT_APP_ID=your_geoclient_app_id
   GEOCLIENT_APP_KEY=your_geoclient_app_key
   GOOGLE_PLACES_API_KEY=your_google_places_api_key
   OPENAI_API_KEY=sk-your_openai_api_key
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
   LANGCHAIN_API_KEY=your_langchain_api_key
   LANGCHAIN_PROJECT=energy-insight-front
   ```

3. **Build Settings:**
   - Framework: Next.js
   - Build Command: `pnpm run vercel-build`
   - Install Command: `pnpm install --frozen-lockfile`
   - Output Directory: `.next`

### 3. Configurar Auto-Deploy

**Branch Configuration:**
- **Production**: `main` → Deploy automático a producción
- **Preview**: Otras ramas → Deploy a preview URLs

**GitHub Integration:**
- Los deploys se activan automáticamente con push a cualquier branch
- CI/CD pipeline ejecuta tests antes del deploy
- Migrations se ejecutan automáticamente en production

### 4. Workflow de Desarrollo

```bash
# 1. Crear feature branch
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y commitear cambios
git add .
git commit -m "feat: nueva funcionalidad"

# 3. Si hay cambios en DB, crear migración
pnpm run db:migrate:dev --name describe_your_change

# 4. Verificar que todo esté listo para deploy
./scripts/deploy-check.sh

# 5. Push para crear preview deployment
git push origin feature/nueva-funcionalidad

# 6. Crear Pull Request en GitHub
# 7. Merge a main para deploy a producción
```

### 5. Comandos Útiles

```bash
# Verificar readiness para deploy
./scripts/deploy-check.sh

# Generar cliente Prisma
pnpm run db:generate

# Aplicar migraciones (local dev)
pnpm run db:migrate:dev

# Aplicar migraciones (production - automático en Vercel)
pnpm run db:migrate:prod

# Build local
pnpm run build

# Build para Vercel (con migraciones)
pnpm run vercel-build

# Linting
pnpm run lint

# Tests
pnpm test
```

## ⚡ Flujo Automático en Vercel

Cuando haces **merge a main**:

1. **GitHub Action** ejecuta CI pipeline:
   - ✅ Linting y type checking
   - ✅ Tests
   - ✅ Build verification
   - ✅ Security audit

2. **Vercel** detecta el push y ejecuta:
   - 📦 `pnpm install --frozen-lockfile`
   - 🔄 `npx prisma generate --no-engine`
   - 🗄️ `npx prisma migrate deploy` (aplica migraciones)
   - 🏗️ `next build`
   - 🚀 Deploy a producción

3. **URLs resultantes:**
   - Production: `https://your-app.vercel.app`
   - Preview: `https://your-app-git-branch-name.vercel.app`

## 🔍 Monitoreo y Debug

**Vercel Dashboard:**
- Ver status de deployments
- Logs de build y runtime
- Performance metrics
- Function logs

**Útiles para debugging:**
```bash
# Ver logs en tiempo real
npx vercel logs [deployment-url] --follow

# Check migration status
npx prisma migrate status

# Ver deployments
npx vercel ls
```

## ⚠️ Consideraciones Importantes

1. **Migraciones Destructivas:**
   - Siempre revisar migraciones antes de merge a main
   - Hacer backup de DB antes de migraciones complejas

2. **Variables de Entorno:**
   - Nunca commitear API keys
   - Usar diferentes keys para dev/prod

3. **Performance:**
   - Functions timeout configurado a 30s
   - Region configurada a `iad1` (US East)

4. **Security:**
   - CI pipeline incluye security audit
   - Branch protection en main recomendado

## 🎯 Estado Actual

✅ **Listo para deploy:**
- Configuración de Vercel completa
- Scripts de migration configurados
- CI/CD pipeline configurado
- Migración inicial creada
- Variables de entorno documentadas

**Next Steps:**
1. Push estos cambios a tu repositorio
2. Configurar el proyecto en Vercel
3. Añadir variables de entorno
4. Hacer merge a main para primer deploy

**¡Tu aplicación está lista para auto-deploy! 🚀**