# Guia de Deploy - IMEP Website

Este documento fornece instruções detalhadas para fazer o deploy do site do IMEP em sua própria hospedagem.

## Requisitos do Servidor

O projeto requer um servidor com as seguintes especificações mínimas:

- **Node.js:** versão 22.x ou superior
- **Banco de Dados:** MySQL 8.0 ou superior (ou TiDB compatível)
- **Memória RAM:** mínimo 512MB, recomendado 1GB+
- **Armazenamento:** mínimo 500MB de espaço livre
- **Sistema Operacional:** Linux (Ubuntu 22.04 recomendado), Windows Server, ou macOS

## Passo 1: Preparar o Ambiente

imepedu-site
3005
17XNXAgb3ex0mD8SdDBh

/home/imepedu-site/htdocs/www.imepedu.com.br

### 1.1 Instalar Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version  # deve mostrar v22.x.x
npm --version
```

### 1.2 Instalar pnpm

```bash
npm install -g pnpm
pnpm --version
```

### 1.3 Preparar Banco de Dados MySQL

Crie um banco de dados vazio para o projeto:

DATABASE imepsitedb
USER:  imepsiteuser
senha: 3j7CtsLdCNO1nMn8PhWe


## Passo 2: Configurar o Projeto

### 2.1 Extrair os Arquivos

Extraia o arquivo ZIP para o diretório do seu servidor:

```bash
unzip imep-escola.zip
cd imep-escola
```

### 2.2 Instalar Dependências

```bash
pnpm install
```

### 2.3 Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure as seguintes variáveis **obrigatórias**:

```env
# Banco de Dados
DATABASE_URL="mysql://usuario:senha@localhost:3306/imep_escola"

# Segurança
JWT_SECRET="gere_uma_chave_aleatoria_segura_aqui"

# OAuth (Manus) - IMPORTANTE: Você precisa configurar OAuth próprio
OAUTH_SERVER_URL="https://seu-servidor-oauth.com"
VITE_OAUTH_PORTAL_URL="https://seu-portal-oauth.com"
VITE_APP_ID="seu_app_id"
OWNER_OPEN_ID="seu_open_id"
OWNER_NAME="Nome do Proprietário"

# AWS S3 para Upload de Imagens
AWS_ACCESS_KEY_ID="sua_access_key"
AWS_SECRET_ACCESS_KEY="sua_secret_key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="nome-do-seu-bucket"

# Informações do Site
VITE_APP_TITLE="IMEP - Instituto Magalhães de Educação Profissional"
VITE_APP_LOGO="/images/logo.png"
```

### 2.4 Gerar JWT_SECRET

Para gerar uma chave JWT segura, execute:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copie o resultado e cole no `.env` como valor de `JWT_SECRET`.

## Passo 3: Configurar Banco de Dados

### 3.1 Executar Migrações

```bash
pnpm db:push
```

Este comando criará todas as tabelas necessárias no banco de dados.

### 3.2 Criar Usuário Administrador

Após fazer o primeiro login via OAuth, você precisa promover seu usuário a administrador:

```sql
USE imep_escola;
UPDATE users SET role = 'admin' WHERE email = 'seu-email@exemplo.com';
```

## Passo 4: Build do Projeto

### 4.1 Compilar para Produção

```bash
pnpm build
```

Este comando irá:
- Compilar o frontend React em `client/dist`
- Compilar o backend Express em `dist`

## Passo 5: Deploy

### Opção A: Executar com Node.js Diretamente

```bash
# Modo produção
NODE_ENV=production node dist/index.js
```

### Opção B: Usar PM2 (Recomendado)

PM2 é um gerenciador de processos que mantém a aplicação rodando e reinicia automaticamente em caso de falha.

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start dist/index.js --name imep-escola

# Configurar para iniciar automaticamente no boot
pm2 startup
pm2 save

# Comandos úteis
pm2 status          # Ver status
pm2 logs imep-escola  # Ver logs
pm2 restart imep-escola  # Reiniciar
pm2 stop imep-escola     # Parar
```

### Opção C: Usar Docker (Avançado)

Crie um arquivo `Dockerfile`:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Build e execute:

```bash
docker build -t imep-escola .
docker run -d -p 3000:3000 --env-file .env --name imep-escola imep-escola
```

## Passo 6: Configurar Nginx (Proxy Reverso)

Para expor a aplicação na porta 80/443, configure o Nginx:

```nginx
server {
    listen 80;
    server_name seudominio.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ativar o site:

```bash
sudo ln -s /etc/nginx/sites-available/imep /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Passo 7: Configurar SSL (HTTPS)

Use o Certbot para obter certificado SSL gratuito:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com.br
```

## Passo 8: Configurar AWS S3 para Upload de Imagens

### 8.1 Criar Bucket S3

1. Acesse o AWS Console
2. Vá para S3 e crie um novo bucket
3. Configure as permissões para permitir uploads

### 8.2 Criar Usuário IAM

1. Vá para IAM > Users > Add User
2. Ative "Programmatic access"
3. Anexe a política `AmazonS3FullAccess`
4. Salve as credenciais (Access Key ID e Secret Access Key)
5. Adicione as credenciais no arquivo `.env`

### 8.3 Configurar CORS no Bucket

No bucket S3, adicione a seguinte configuração CORS:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["https://seudominio.com.br"],
        "ExposeHeaders": []
    }
]
```

## Passo 9: Configurar OAuth (Autenticação)

**IMPORTANTE:** O sistema de autenticação atual usa OAuth do Manus. Para usar em produção, você tem duas opções:

### Opção A: Implementar OAuth Próprio

Você precisará implementar seu próprio servidor OAuth ou usar um provedor como:
- Auth0
- Firebase Authentication
- Keycloak
- OAuth2 próprio

### Opção B: Remover Autenticação

Se não precisar de autenticação de usuários, você pode:
1. Remover as rotas protegidas
2. Criar um sistema de login simples com senha fixa para o admin

## Troubleshooting

### Erro: "Cannot connect to database"

Verifique:
- Se o MySQL está rodando: `sudo systemctl status mysql`
- Se as credenciais no `.env` estão corretas
- Se o banco de dados existe: `mysql -u root -p -e "SHOW DATABASES;"`

### Erro: "Port 3000 already in use"

Mude a porta no código ou mate o processo:

```bash
lsof -ti:3000 | xargs kill -9
```

### Erro: "Permission denied" ao fazer upload de imagens

Verifique as permissões do bucket S3 e as credenciais AWS no `.env`.

### Site não carrega após deploy

Verifique os logs:

```bash
# Se usando PM2
pm2 logs imep-escola

# Se usando Node diretamente
# Os logs aparecerão no terminal
```

## Manutenção

### Backup do Banco de Dados

```bash
mysqldump -u imep_user -p imep_escola > backup_$(date +%Y%m%d).sql
```

### Restaurar Backup

```bash
mysql -u imep_user -p imep_escola < backup_20260122.sql
```

### Atualizar o Projeto

```bash
cd /caminho/para/imep-escola
git pull  # se estiver usando git
pnpm install
pnpm build
pm2 restart imep-escola
```

## Suporte

Para dúvidas ou problemas:
- Email: magalhaeseducacao.aedu@gmail.com
- WhatsApp: (94) 99243-5333

## Licença

Este projeto foi desenvolvido exclusivamente para o IMEP - Instituto Magalhães de Educação Profissional.
