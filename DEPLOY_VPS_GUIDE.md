# Guia Completo de Deploy do IMEP em VPS

## 📋 Índice
1. [Configuração do Banco de Dados MySQL](#configuração-do-banco-de-dados-mysql)
2. [Exportar Código para GitHub](#exportar-código-para-github)
3. [Deploy na VPS](#deploy-na-vps)
4. [Configuração de Domínio](#configuração-de-domínio)
5. [Variáveis de Ambiente](#variáveis-de-ambiente)

---

## 1. Configuração do Banco de Dados MySQL

### Passo 1: Conectar à VPS via SSH

```bash
ssh root@seu-ip-vps
# ou
ssh usuario@seu-ip-vps
```

### Passo 2: Instalar MySQL (se ainda não estiver instalado)

```bash
# Para Ubuntu/Debian
sudo apt update
sudo apt install mysql-server -y

# Iniciar serviço
sudo systemctl start mysql
sudo systemctl enable mysql
```

### Passo 3: Criar Banco de Dados e Usuário

Execute os comandos abaixo no MySQL:

```bash
mysql -u root -p
```

Depois, dentro do MySQL, execute:

```sql
-- Criar banco de dados
CREATE DATABASE imep_escola CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário MySQL
CREATE USER 'imep_user'@'localhost' IDENTIFIED BY 'Imep@2026Senha123';

-- Conceder permissões
GRANT ALL PRIVILEGES ON imep_escola.* TO 'imep_user'@'localhost';
FLUSH PRIVILEGES;

-- Verificar criação
SHOW DATABASES;
SHOW GRANTS FOR 'imep_user'@'localhost';
```

**Credenciais geradas:**
- **Host:** localhost (ou seu IP VPS se acessar remotamente)
- **Banco:** imep_escola
- **Usuário:** imep_user
- **Senha:** Imep@2026Senha123
- **Porta:** 3306 (padrão)

### Passo 4: Criar Tabelas (Schema)

Salve o script abaixo em um arquivo `schema.sql` e execute:

```bash
mysql -u imep_user -p imep_escola < schema.sql
```

**Arquivo schema.sql:**

```sql
-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_openId (openId),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Courses table
CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  shortDescription VARCHAR(500),
  categoryId INT NOT NULL,
  duration VARCHAR(50),
  modality ENUM('presencial', 'ead', 'hibrido') DEFAULT 'presencial' NOT NULL,
  price DECIMAL(10, 2),
  originalPrice DECIMAL(10, 2),
  image VARCHAR(500),
  videoUrl VARCHAR(500),
  isActive BOOLEAN DEFAULT TRUE,
  isFeatured BOOLEAN DEFAULT FALSE,
  `order` INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES categories(id),
  INDEX idx_slug (slug),
  INDEX idx_categoryId (categoryId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Curriculum table
CREATE TABLE curriculum (
  id INT AUTO_INCREMENT PRIMARY KEY,
  courseId INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  duration VARCHAR(50),
  `order` INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES courses(id),
  INDEX idx_courseId (courseId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Site Settings table
CREATE TABLE siteSettings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  type ENUM('text', 'number', 'boolean', 'json', 'html') DEFAULT 'text' NOT NULL,
  label VARCHAR(200),
  description TEXT,
  `group` VARCHAR(50),
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Testimonials table
CREATE TABLE testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  course VARCHAR(200),
  content TEXT NOT NULL,
  image VARCHAR(500),
  rating INT DEFAULT 5,
  isActive BOOLEAN DEFAULT TRUE,
  `order` INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_isActive (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Favorites table
CREATE TABLE favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  courseId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (courseId) REFERENCES courses(id),
  UNIQUE KEY unique_user_course (userId, courseId),
  INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enrollments table
CREATE TABLE enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  courseId INT NOT NULL,
  stripeCustomerId VARCHAR(255),
  stripePaymentIntentId VARCHAR(255),
  stripeCheckoutSessionId VARCHAR(255),
  status ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending' NOT NULL,
  enrollmentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completionDate TIMESTAMP NULL,
  certificateIssued BOOLEAN DEFAULT FALSE,
  certificateUrl VARCHAR(500),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (courseId) REFERENCES courses(id),
  INDEX idx_userId (userId),
  INDEX idx_courseId (courseId),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments table
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enrollmentId INT NOT NULL,
  userId INT NOT NULL,
  stripePaymentIntentId VARCHAR(255) NOT NULL,
  stripeChargeId VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'brl' NOT NULL,
  status ENUM('pending', 'succeeded', 'failed', 'refunded') DEFAULT 'pending' NOT NULL,
  paymentMethod VARCHAR(50),
  paidAt TIMESTAMP NULL,
  refundedAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollmentId) REFERENCES enrollments(id),
  FOREIGN KEY (userId) REFERENCES users(id),
  INDEX idx_userId (userId),
  INDEX idx_status (status),
  INDEX idx_stripePaymentIntentId (stripePaymentIntentId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pre-Enrollments table
CREATE TABLE preEnrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullName VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  cpf VARCHAR(14),
  birthDate DATE,
  courseId INT NOT NULL,
  message TEXT,
  preferredShift ENUM('morning', 'afternoon', 'evening', 'flexible'),
  howDidYouHear VARCHAR(100),
  status ENUM('new', 'contacted', 'converted', 'lost') DEFAULT 'new' NOT NULL,
  contactedAt TIMESTAMP NULL,
  convertedAt TIMESTAMP NULL,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES courses(id),
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_courseId (courseId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 2. Exportar Código para GitHub

### Passo 1: Criar Repositório GitHub

1. Acesse [github.com](https://github.com)
2. Clique em "New Repository"
3. Nome: `imep-escola`
4. Descrição: "IMEP - Instituto Magalhães de Educação Profissional"
5. Selecione "Private" (privado)
6. Clique em "Create repository"

### Passo 2: Exportar do Manus

No painel de gerenciamento do Manus, vá para **Settings → GitHub** e selecione a opção de exportar para o repositório que você criou.

Ou, via linha de comando:

```bash
cd /home/ubuntu/imep-escola

# Adicionar remote do GitHub
git remote add github https://github.com/seu-usuario/imep-escola.git

# Push para GitHub
git branch -M main
git push -u github main
```

---

## 3. Deploy na VPS

### Passo 1: Clonar Repositório na VPS

```bash
ssh root@seu-ip-vps

# Navegar para diretório de aplicações
cd /var/www

# Clonar repositório
git clone https://github.com/seu-usuario/imep-escola.git
cd imep-escola
```

### Passo 2: Instalar Dependências

```bash
# Instalar pnpm (se não estiver instalado)
npm install -g pnpm

# Instalar dependências do projeto
pnpm install
```

### Passo 3: Configurar Variáveis de Ambiente

Crie arquivo `.env` na raiz do projeto:

```bash
nano .env
```

Cole o conteúdo abaixo (ajuste conforme necessário):

```env
# Database
DATABASE_URL="mysql://imep_user:Imep@2026Senha123@localhost:3306/imep_escola"

# JWT Secret (gere uma string aleatória segura)
JWT_SECRET="sua-chave-secreta-super-segura-aqui-32-caracteres-minimo"

# OAuth (Manus)
VITE_APP_ID="seu-app-id-manus"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# Owner Info
OWNER_NAME="seu-nome"
OWNER_OPEN_ID="seu-open-id-manus"

# Stripe (opcional, se usar pagamentos)
STRIPE_SECRET_KEY="sk_test_..."
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Built-in APIs
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="sua-chave-api"
VITE_FRONTEND_FORGE_API_KEY="sua-chave-frontend"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT="https://analytics.manus.im"
VITE_ANALYTICS_WEBSITE_ID="seu-website-id"

# App Info
VITE_APP_TITLE="IMEP - Instituto Magalhães de Educação Profissional"
VITE_APP_LOGO="https://seu-cdn/logo.png"

# Node Environment
NODE_ENV="production"
```

### Passo 4: Build da Aplicação

```bash
# Build do frontend e backend
pnpm build

# Migrar banco de dados (se necessário)
pnpm db:push
```

### Passo 5: Iniciar Aplicação com PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
pm2 start dist/index.js --name "imep-escola"

# Salvar configuração PM2
pm2 save

# Ativar startup automático
pm2 startup
```

### Passo 6: Configurar Nginx como Reverse Proxy

```bash
# Instalar Nginx
sudo apt install nginx -y

# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/imep-escola
```

Cole o conteúdo:

```nginx
server {
    listen 80;
    server_name site.imepescola.com.br;

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

Ative o site:

```bash
sudo ln -s /etc/nginx/sites-available/imep-escola /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Passo 7: Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Gerar certificado SSL
sudo certbot --nginx -d site.imepescola.com.br
```

---

## 4. Configuração de Domínio

### Apontar DNS para VPS

No seu provedor de domínio (GoDaddy, Namecheap, etc.):

1. Acesse o painel de DNS
2. Crie um registro **A** apontando para o IP da sua VPS:
   - **Host:** site.imepescola.com.br
   - **Type:** A
   - **Value:** seu-ip-vps
   - **TTL:** 3600

Aguarde a propagação do DNS (pode levar até 48 horas).

---

## 5. Variáveis de Ambiente

### Gerar JWT_SECRET Seguro

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Obter Credenciais Manus

1. Acesse o painel Manus
2. Vá para **Settings → Integrations**
3. Copie as credenciais OAuth e API

---

## 📝 Checklist de Deploy

- [ ] MySQL instalado e configurado na VPS
- [ ] Banco de dados `imep_escola` criado
- [ ] Usuário `imep_user` criado com permissões
- [ ] Código clonado do GitHub
- [ ] Dependências instaladas (`pnpm install`)
- [ ] Arquivo `.env` configurado
- [ ] Build realizado (`pnpm build`)
- [ ] PM2 iniciado e configurado
- [ ] Nginx configurado como reverse proxy
- [ ] SSL ativado com Let's Encrypt
- [ ] DNS apontando para VPS
- [ ] Site acessível em site.imepescola.com.br

---

## 🔧 Comandos Úteis

```bash
# Verificar status da aplicação
pm2 status

# Ver logs
pm2 logs imep-escola

# Reiniciar aplicação
pm2 restart imep-escola

# Parar aplicação
pm2 stop imep-escola

# Verificar MySQL
mysql -u imep_user -p imep_escola -e "SHOW TABLES;"

# Verificar Nginx
sudo systemctl status nginx

# Verificar porta 3000
lsof -i :3000
```

---

## 🆘 Troubleshooting

### Erro: "Connection refused" ao conectar MySQL

```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Reiniciar MySQL
sudo systemctl restart mysql
```

### Erro: "Port 3000 already in use"

```bash
# Encontrar processo usando porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>
```

### Erro: "Cannot find module"

```bash
# Reinstalar dependências
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

---

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com o suporte Manus ou consulte a documentação oficial.

**Sucesso no deploy! 🚀**
