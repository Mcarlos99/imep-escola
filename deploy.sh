#!/bin/bash

# ============================================================================
# Script de Deploy Automático - IMEP Escola
# Este script automatiza o processo de deploy na VPS
# ============================================================================

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy do IMEP Escola..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# ============================================================================
# Verificações Iniciais
# ============================================================================

print_info "Verificando pré-requisitos..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado"
    exit 1
fi
print_success "Node.js encontrado: $(node -v)"

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
    print_info "pnpm não encontrado, instalando..."
    npm install -g pnpm
fi
print_success "pnpm encontrado: $(pnpm -v)"

# Verificar MySQL
if ! command -v mysql &> /dev/null; then
    print_error "MySQL não está instalado"
    exit 1
fi
print_success "MySQL encontrado"

# Verificar arquivo .env
if [ ! -f .env ]; then
    print_error "Arquivo .env não encontrado!"
    print_info "Copie o arquivo ENV_SETUP_VPS.md para criar o .env"
    exit 1
fi
print_success "Arquivo .env encontrado"

echo ""
print_info "Todos os pré-requisitos verificados!"
echo ""

# ============================================================================
# Instalação de Dependências
# ============================================================================

print_info "Instalando dependências..."
pnpm install
print_success "Dependências instaladas"

echo ""

# ============================================================================
# Build da Aplicação
# ============================================================================

print_info "Compilando aplicação..."
pnpm build
print_success "Build concluído"

echo ""

# ============================================================================
# Migração do Banco de Dados
# ============================================================================

print_info "Migrando banco de dados..."
pnpm db:push
print_success "Banco de dados migrado"

echo ""

# ============================================================================
# Iniciar com PM2
# ============================================================================

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    print_info "PM2 não encontrado, instalando..."
    npm install -g pm2
fi

print_info "Iniciando aplicação com PM2..."

# Parar aplicação anterior se existir
pm2 stop imep-escola 2>/dev/null || true
pm2 delete imep-escola 2>/dev/null || true

# Iniciar nova instância
pm2 start dist/index.js --name "imep-escola" --env production

# Salvar configuração PM2
pm2 save

# Ativar startup automático
pm2 startup

print_success "Aplicação iniciada com PM2"

echo ""

# ============================================================================
# Verificações Finais
# ============================================================================

print_info "Realizando verificações finais..."

# Aguardar 2 segundos para a aplicação iniciar
sleep 2

# Verificar se a porta 3000 está aberta
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_success "Aplicação está rodando na porta 3000"
else
    print_error "Aplicação não está respondendo na porta 3000"
    print_info "Verifique os logs: pm2 logs imep-escola"
    exit 1
fi

echo ""
echo "============================================================================"
print_success "Deploy concluído com sucesso! 🎉"
echo "============================================================================"
echo ""
echo "📊 Status da Aplicação:"
pm2 status
echo ""
echo "📝 Logs:"
echo "  Ver logs: pm2 logs imep-escola"
echo "  Monitorar: pm2 monit"
echo ""
echo "🔗 Acesse: http://seu-dominio.com.br"
echo ""
echo "⚠️  Próximos passos:"
echo "  1. Configurar Nginx como reverse proxy"
echo "  2. Ativar SSL com Let's Encrypt"
echo "  3. Apontar DNS para o IP da VPS"
echo ""
