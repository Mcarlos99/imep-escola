# Configuração de Variáveis de Ambiente para VPS

## 📋 Variáveis Necessárias

Após clonar o repositório na VPS, crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================
# Formato: mysql://usuario:senha@host:porta/banco_de_dados
DATABASE_URL="mysql://imep_user:Imep@2026Senha123@localhost:3306/imep_escola"

# ============================================================================
# JWT CONFIGURATION
# Gere uma string aleatória segura com:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# ============================================================================
JWT_SECRET="sua-chave-secreta-super-segura-aqui-32-caracteres-minimo"

# ============================================================================
# MANUS OAUTH CONFIGURATION
# Obtenha estes valores no painel Manus → Settings → OAuth
# ============================================================================
VITE_APP_ID="seu-app-id-manus"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# ============================================================================
# OWNER INFORMATION
# ============================================================================
OWNER_NAME="seu-nome-completo"
OWNER_OPEN_ID="seu-open-id-manus"

# ============================================================================
# STRIPE CONFIGURATION (Opcional)
# ============================================================================
STRIPE_SECRET_KEY="sk_test_..."
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ============================================================================
# MANUS BUILT-IN APIs
# ============================================================================
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="sua-chave-api-manus"
VITE_FRONTEND_FORGE_API_KEY="sua-chave-frontend-manus"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"

# ============================================================================
# ANALYTICS CONFIGURATION (Opcional)
# ============================================================================
VITE_ANALYTICS_ENDPOINT="https://analytics.manus.im"
VITE_ANALYTICS_WEBSITE_ID="seu-website-id-analytics"

# ============================================================================
# APPLICATION INFORMATION
# ============================================================================
VITE_APP_TITLE="IMEP - Instituto Magalhães de Educação Profissional"
VITE_APP_LOGO="https://seu-cdn/logo.png"

# ============================================================================
# ENVIRONMENT
# ============================================================================
NODE_ENV="production"
PORT="3000"
```

## 🔑 Como Obter as Credenciais

### 1. Credenciais Manus OAuth
1. Acesse o painel Manus
2. Vá para **Settings → OAuth**
3. Copie `VITE_APP_ID` e `OAUTH_SERVER_URL`

### 2. JWT_SECRET
Execute na VPS:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Stripe (se usar)
1. Acesse [dashboard.stripe.com](https://dashboard.stripe.com)
2. Vá para **Developers → API Keys**
3. Copie as chaves de teste ou produção

### 4. Built-in APIs Manus
Obtenha no painel Manus → **Settings → API Keys**

## 📝 Passo a Passo para Criar .env na VPS

```bash
# Conectar à VPS
ssh root@seu-ip-vps

# Navegar para o diretório do projeto
cd /var/www/imep-escola

# Criar arquivo .env
nano .env

# Colar o conteúdo acima e preencher com seus valores reais
# Pressionar Ctrl+X, depois Y, depois Enter para salvar

# Verificar se foi criado
cat .env
```

## ✅ Validação

Após criar o `.env`, execute:

```bash
# Verificar se as variáveis foram carregadas
node -e "console.log(process.env.DATABASE_URL)"

# Build da aplicação
pnpm build

# Testar conexão com banco de dados
pnpm db:push
```

## 🚀 Próximos Passos

1. Criar arquivo `.env` com as variáveis acima
2. Executar `pnpm install`
3. Executar `pnpm build`
4. Executar `pnpm db:push` para migrar o banco
5. Iniciar com PM2: `pm2 start dist/index.js --name "imep-escola"`

---

**⚠️ IMPORTANTE:** Nunca compartilhe o arquivo `.env` ou suas credenciais. Mantenha-o seguro e fora do controle de versão (já está no `.gitignore`).
