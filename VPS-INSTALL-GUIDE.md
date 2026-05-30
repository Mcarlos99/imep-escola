# Guia Completo de Instalação na VPS - IMEP Escola

Este documento fornece instruções detalhadas e passo a passo para instalar e configurar o projeto IMEP Escola em um servidor VPS (Virtual Private Server) com Ubuntu, incluindo configuração do Node.js, MySQL, Nginx, SSL e deploy completo da aplicação.

---

## Requisitos do Servidor

Antes de começar, certifique-se de que seu servidor VPS atende aos seguintes requisitos mínimos:

| Requisito | Especificação Mínima | Recomendado |
|-----------|---------------------|-------------|
| **Sistema Operacional** | Ubuntu 20.04 LTS | Ubuntu 22.04 LTS |
| **RAM** | 1 GB | 2 GB ou mais |
| **Armazenamento** | 10 GB | 20 GB ou mais |
| **CPU** | 1 vCPU | 2 vCPUs |
| **Acesso** | SSH com usuário root ou sudo | SSH com chave pública |
| **Domínio** | Opcional | Recomendado para SSL |

O projeto IMEP Escola é uma aplicação full-stack que utiliza Node.js no backend, React no frontend e MySQL como banco de dados. O servidor web Nginx será usado como proxy reverso para rotear requisições e servir arquivos estáticos com alta performance.

---

## Passo 1: Acessar o Servidor via SSH

Conecte-se ao seu servidor VPS usando SSH. Você precisará do endereço IP do servidor, nome de usuário e senha (ou chave SSH).

### 1.1. Conectar via Terminal

**No Linux/Mac:**
```bash
ssh usuario@seu-ip-do-servidor
# Exemplo: ssh root@192.168.1.100
```

**No Windows:**
- Use o **PuTTY** ([https://www.putty.org/](https://www.putty.org/))
- Ou use o **Windows Terminal** com OpenSSH

### 1.2. Atualizar o Sistema

Após conectar, atualize todos os pacotes do sistema para garantir que você tem as versões mais recentes e patches de segurança:

```bash
sudo apt update
sudo apt upgrade -y
```

Este processo pode levar alguns minutos dependendo da quantidade de atualizações disponíveis. O parâmetro `-y` confirma automaticamente todas as instalações sem pedir confirmação manual.

### 1.3. Criar Usuário Não-Root (Opcional mas Recomendado)

Por questões de segurança, é recomendado não usar o usuário root diretamente. Crie um usuário específico para a aplicação:

```bash
# Criar novo usuário
adduser imep

# Adicionar ao grupo sudo
usermod -aG sudo imep

# Trocar para o novo usuário
su - imep
```

A partir deste ponto, você pode usar este usuário para todas as operações. Se preferir continuar com root, pule esta etapa.

---

## Passo 2: Instalar Node.js

O projeto IMEP Escola requer Node.js versão 18 ou superior. Vamos instalar a versão LTS mais recente usando o NodeSource repository.

### 2.1. Adicionar Repositório NodeSource

```bash
# Baixar e executar script de instalação do Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

### 2.2. Instalar Node.js e npm

```bash
sudo apt install -y nodejs
```

### 2.3. Verificar Instalação

```bash
node --version
# Deve mostrar: v20.x.x

npm --version
# Deve mostrar: 10.x.x
```

### 2.4. Instalar pnpm (Gerenciador de Pacotes)

O projeto usa pnpm como gerenciador de pacotes, que é mais rápido e eficiente que o npm:

```bash
sudo npm install -g pnpm

# Verificar instalação
pnpm --version
# Deve mostrar: 9.x.x ou superior
```

---

## Passo 3: Instalar e Configurar MySQL

O MySQL será o banco de dados principal da aplicação, armazenando informações de cursos, usuários, categorias e todas as demais entidades do sistema.

### 3.1. Instalar MySQL Server

```bash
sudo apt install -y mysql-server
```

### 3.2. Iniciar e Habilitar MySQL

```bash
# Iniciar o serviço
sudo systemctl start mysql

# Habilitar para iniciar automaticamente no boot
sudo systemctl enable mysql

# Verificar status
sudo systemctl status mysql
```

Você deve ver uma mensagem indicando que o serviço está "active (running)".

### 3.3. Configurar Segurança do MySQL

Execute o script de segurança para configurar senha root e remover configurações inseguras:

```bash
sudo mysql_secure_installation
```

O script fará várias perguntas. Aqui estão as respostas recomendadas:

```
1. "Would you like to setup VALIDATE PASSWORD component?" 
   → Digite: Y (sim)

2. "Please enter 0 = LOW, 1 = MEDIUM and 2 = STRONG"
   → Digite: 1 (médio) ou 2 (forte)

3. "New password:" 
   → Digite uma senha forte e ANOTE EM LOCAL SEGURO

4. "Remove anonymous users?"
   → Digite: Y (sim)

5. "Disallow root login remotely?"
   → Digite: Y (sim)

6. "Remove test database and access to it?"
   → Digite: Y (sim)

7. "Reload privilege tables now?"
   → Digite: Y (sim)
```

### 3.4. Criar Banco de Dados e Usuário

Acesse o MySQL como root:

```bash
sudo mysql -u root -p
# Digite a senha que você criou no passo anterior
```

Dentro do MySQL, execute os seguintes comandos:

```sql
-- Criar banco de dados
CREATE DATABASE imep_escola CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário específico para a aplicação
CREATE USER 'imep_user'@'localhost' IDENTIFIED BY 'SuaSenhaForteAqui123!';

-- Conceder todas as permissões no banco imep_escola
GRANT ALL PRIVILEGES ON imep_escola.* TO 'imep_user'@'localhost';

-- Aplicar mudanças
FLUSH PRIVILEGES;

-- Verificar usuário criado
SELECT User, Host FROM mysql.user WHERE User = 'imep_user';

-- Sair do MySQL
EXIT;
```

**IMPORTANTE**: Substitua `SuaSenhaForteAqui123!` por uma senha forte e segura. Anote esta senha pois você precisará dela no arquivo `.env`.

### 3.5. Importar Schema do Banco de Dados

Agora vamos criar todas as tabelas usando o script SQL fornecido:

```bash
# Fazer upload do arquivo mysql-schema.sql para o servidor
# Você pode usar SCP, SFTP ou copiar o conteúdo manualmente

# Importar o schema
mysql -u imep_user -p imep_escola < mysql-schema.sql

# Digite a senha do usuário imep_user quando solicitado
```

**Alternativa via phpMyAdmin** (se você tiver instalado):
1. Acesse phpMyAdmin no navegador
2. Faça login com o usuário `imep_user`
3. Selecione o banco `imep_escola`
4. Clique na aba "SQL"
5. Cole todo o conteúdo do arquivo `mysql-schema.sql`
6. Clique em "Executar"

### 3.6. Verificar Tabelas Criadas

```bash
mysql -u imep_user -p imep_escola -e "SHOW TABLES;"
```

Você deve ver as seguintes tabelas:
- categories
- courses
- courses_with_category (view)
- dashboard_stats (view)
- favorites
- settings
- testimonials
- users

---

## Passo 4: Instalar phpMyAdmin (Opcional)

O phpMyAdmin é uma interface web para gerenciar o MySQL de forma visual e intuitiva. Esta etapa é opcional, mas altamente recomendada para facilitar o gerenciamento do banco de dados.

### 4.1. Instalar phpMyAdmin

```bash
sudo apt install -y phpmyadmin php-mbstring php-zip php-gd php-json php-curl
```

Durante a instalação, você verá algumas telas de configuração:

```
1. "Web server to reconfigure automatically"
   → Selecione: apache2 (use espaço para marcar)
   → Pressione Enter

2. "Configure database for phpmyadmin with dbconfig-common?"
   → Selecione: Yes

3. "MySQL application password for phpmyadmin"
   → Deixe em branco para gerar automaticamente
   → Ou digite uma senha se preferir
```

### 4.2. Configurar Apache (se necessário)

Se você escolheu Apache durante a instalação:

```bash
# Habilitar extensão mbstring
sudo phpenmod mbstring

# Reiniciar Apache
sudo systemctl restart apache2
```

### 4.3. Acessar phpMyAdmin

Abra o navegador e acesse:
```
http://seu-ip-do-servidor/phpmyadmin
```

Faça login com:
- **Usuário**: `imep_user`
- **Senha**: A senha que você criou no Passo 3.4

**Nota de Segurança**: Por padrão, o phpMyAdmin fica acessível publicamente. Considere protegê-lo com autenticação HTTP básica ou restringir o acesso por IP.

---

## Passo 5: Fazer Upload do Projeto

Agora vamos transferir os arquivos do projeto IMEP Escola para o servidor.

### 5.1. Criar Diretório da Aplicação

```bash
# Criar diretório
sudo mkdir -p /var/www/imep-escola

# Dar permissões ao usuário atual
sudo chown -R $USER:$USER /var/www/imep-escola

# Navegar para o diretório
cd /var/www/imep-escola
```

### 5.2. Transferir Arquivos

Você tem várias opções para transferir os arquivos:

**Opção 1: Via SCP (do seu computador local)**
```bash
# No seu computador local (não no servidor)
scp -r /caminho/local/imep-escola/* usuario@seu-ip:/var/www/imep-escola/
```

**Opção 2: Via Git (se você tiver um repositório)**
```bash
# No servidor
cd /var/www/imep-escola
git clone https://github.com/seu-usuario/imep-escola.git .
```

**Opção 3: Via FTP/SFTP**
- Use um cliente FTP como FileZilla
- Conecte-se ao servidor via SFTP
- Faça upload de todos os arquivos para `/var/www/imep-escola/`

**Opção 4: Via arquivo ZIP**
```bash
# No servidor, fazer upload do arquivo ZIP e extrair
cd /var/www/imep-escola
wget http://seu-servidor/imep-escola-deploy.zip
unzip imep-escola-deploy.zip
rm imep-escola-deploy.zip
```

### 5.3. Verificar Arquivos

```bash
ls -la /var/www/imep-escola
```

Você deve ver os seguintes diretórios e arquivos principais:
- `client/` - Frontend React
- `server/` - Backend Node.js
- `drizzle/` - Schema do banco de dados
- `package.json` - Dependências do projeto
- `.env.example` - Exemplo de variáveis de ambiente

---

## Passo 6: Configurar Variáveis de Ambiente

As variáveis de ambiente armazenam informações sensíveis como senhas de banco de dados, chaves de API e configurações do sistema.

### 6.1. Criar Arquivo .env

```bash
cd /var/www/imep-escola
cp .env.example .env
nano .env
```

### 6.2. Configurar Variáveis

Edite o arquivo `.env` com as seguintes informações:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL="mysql://imep_user:SuaSenhaAqui@localhost:3306/imep_escola"

# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV="production"
PORT=3000

# ============================================
# JWT SECRET
# ============================================
# Gere uma chave aleatória forte (mínimo 32 caracteres)
JWT_SECRET="sua-chave-secreta-jwt-super-segura-aqui-min-32-chars"

# ============================================
# OWNER INFORMATION
# ============================================
OWNER_NAME="IMEP - Instituto Magalhães"
OWNER_EMAIL="magalhaeseducacao.aedu@gmail.com"
OWNER_OPEN_ID="admin-default-id"

# ============================================
# WHATSAPP CONFIGURATION
# ============================================
WHATSAPP_NUMBER="5594992435333"

# ============================================
# AWS S3 CONFIGURATION (para upload de imagens)
# ============================================
AWS_ACCESS_KEY_ID="sua-access-key-aqui"
AWS_SECRET_ACCESS_KEY="sua-secret-key-aqui"
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="imep-escola-uploads"

# ============================================
# OAUTH CONFIGURATION (Manus OAuth)
# ============================================
OAUTH_SERVER_URL="https://oauth.manus.computer"
VITE_OAUTH_PORTAL_URL="https://portal.manus.computer"
VITE_APP_ID="seu-app-id-aqui"

# ============================================
# FRONTEND CONFIGURATION
# ============================================
VITE_APP_TITLE="IMEP - Instituto Magalhães de Educação Profissional"
VITE_APP_LOGO="/logo.png"
```

### 6.3. Substituir Valores

**IMPORTANTE**: Substitua os seguintes valores pelos seus dados reais:

| Variável | Como Obter |
|----------|------------|
| `DATABASE_URL` | Use a senha do MySQL que você criou no Passo 3.4 |
| `JWT_SECRET` | Gere com: `openssl rand -hex 32` |
| `AWS_ACCESS_KEY_ID` | Obtenha no console da AWS S3 |
| `AWS_SECRET_ACCESS_KEY` | Obtenha no console da AWS S3 |
| `AWS_BUCKET_NAME` | Nome do seu bucket S3 |

### 6.4. Gerar JWT Secret

```bash
# Gerar chave JWT segura
openssl rand -hex 32

# Copie o resultado e cole no .env na variável JWT_SECRET
```

### 6.5. Proteger o Arquivo .env

```bash
# Definir permissões restritas
chmod 600 .env

# Verificar permissões
ls -la .env
# Deve mostrar: -rw------- (apenas o dono pode ler/escrever)
```

---

## Passo 7: Instalar Dependências do Projeto

Com os arquivos no lugar e as variáveis de ambiente configuradas, agora vamos instalar todas as dependências necessárias.

### 7.1. Instalar Dependências

```bash
cd /var/www/imep-escola
pnpm install
```

Este processo pode levar alguns minutos, pois o pnpm irá baixar e instalar todas as bibliotecas necessárias (React, Express, tRPC, Drizzle ORM, etc.).

### 7.2. Verificar Instalação

```bash
# Verificar se node_modules foi criado
ls -la | grep node_modules

# Verificar algumas dependências principais
ls node_modules | grep -E "(react|express|drizzle)"
```

---

## Passo 8: Compilar o Projeto

Antes de colocar a aplicação em produção, precisamos compilar o código TypeScript e React para JavaScript otimizado.

### 8.1. Executar Build

```bash
cd /var/www/imep-escola
pnpm run build
```

Este comando irá:
1. Compilar o frontend React (Vite)
2. Compilar o backend Node.js (esbuild)
3. Otimizar assets (minificar CSS/JS, comprimir imagens)
4. Gerar arquivos prontos para produção na pasta `dist/`

O processo pode levar de 1 a 3 minutos dependendo do hardware do servidor.

### 8.2. Verificar Build

```bash
# Verificar se a pasta dist foi criada
ls -la dist/

# Deve conter:
# - client/ (frontend compilado)
# - index.js (backend compilado)
```

### 8.3. Testar Aplicação Localmente

Antes de configurar o Nginx, vamos testar se a aplicação funciona:

```bash
# Iniciar o servidor
NODE_ENV=production node dist/index.js
```

Você deve ver uma mensagem como:
```
Server running on http://localhost:3000
```

Abra outro terminal e teste:
```bash
curl http://localhost:3000
```

Se você ver HTML sendo retornado, a aplicação está funcionando! Pressione `Ctrl+C` para parar o servidor.

---

## Passo 9: Configurar PM2 (Process Manager)

O PM2 é um gerenciador de processos que mantém a aplicação rodando continuamente, reinicia automaticamente em caso de falhas e facilita o gerenciamento de logs.

### 9.1. Instalar PM2

```bash
sudo npm install -g pm2
```

### 9.2. Criar Arquivo de Configuração do PM2

```bash
cd /var/www/imep-escola
nano ecosystem.config.js
```

Cole o seguinte conteúdo:

```javascript
module.exports = {
  apps: [{
    name: 'imep-escola',
    script: './dist/index.js',
    cwd: '/var/www/imep-escola',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    exp_backoff_restart_delay: 100
  }]
};
```

Salve e feche o arquivo (Ctrl+X, depois Y, depois Enter).

### 9.3. Criar Diretório de Logs

```bash
mkdir -p /var/www/imep-escola/logs
```

### 9.4. Iniciar Aplicação com PM2

```bash
cd /var/www/imep-escola
pm2 start ecosystem.config.js
```

### 9.5. Verificar Status

```bash
pm2 status
```

Você deve ver algo como:

```
┌─────┬──────────────┬─────────┬─────────┬──────────┐
│ id  │ name         │ mode    │ status  │ cpu      │
├─────┼──────────────┼─────────┼─────────┼──────────┤
│ 0   │ imep-escola  │ cluster │ online  │ 0%       │
└─────┴──────────────┴─────────┴─────────┴──────────┘
```

### 9.6. Configurar PM2 para Iniciar no Boot

```bash
# Gerar script de startup
pm2 startup

# O comando acima mostrará um comando para executar
# Copie e execute o comando mostrado (algo como):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u seu-usuario --hp /home/seu-usuario

# Salvar lista de processos
pm2 save
```

### 9.7. Comandos Úteis do PM2

```bash
# Ver logs em tempo real
pm2 logs imep-escola

# Ver logs de erro apenas
pm2 logs imep-escola --err

# Reiniciar aplicação
pm2 restart imep-escola

# Parar aplicação
pm2 stop imep-escola

# Remover aplicação do PM2
pm2 delete imep-escola

# Monitorar recursos
pm2 monit
```

---

## Passo 10: Instalar e Configurar Nginx

O Nginx atuará como proxy reverso, roteando requisições HTTP para a aplicação Node.js e servindo arquivos estáticos com alta performance.

### 10.1. Instalar Nginx

```bash
sudo apt install -y nginx
```

### 10.2. Iniciar e Habilitar Nginx

```bash
# Iniciar serviço
sudo systemctl start nginx

# Habilitar no boot
sudo systemctl enable nginx

# Verificar status
sudo systemctl status nginx
```

### 10.3. Testar Nginx

Abra o navegador e acesse:
```
http://seu-ip-do-servidor
```

Você deve ver a página padrão de boas-vindas do Nginx.

### 10.4. Criar Configuração do Site

```bash
sudo nano /etc/nginx/sites-available/imep-escola
```

Cole a seguinte configuração:

```nginx
# Configuração do IMEP Escola
server {
    listen 80;
    listen [::]:80;
    
    # Substitua pelo seu domínio ou IP
    server_name seu-dominio.com.br www.seu-dominio.com.br;
    
    # Se não tiver domínio, use apenas o IP:
    # server_name 192.168.1.100;
    
    # Logs
    access_log /var/log/nginx/imep-escola-access.log;
    error_log /var/log/nginx/imep-escola-error.log;
    
    # Tamanho máximo de upload (para imagens de cursos)
    client_max_body_size 10M;
    
    # Proxy para a aplicação Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Cache para arquivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**IMPORTANTE**: Substitua `seu-dominio.com.br` pelo seu domínio real. Se você não tiver domínio, use o IP do servidor.

Salve e feche o arquivo (Ctrl+X, Y, Enter).

### 10.5. Habilitar o Site

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/imep-escola /etc/nginx/sites-enabled/

# Remover configuração padrão
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t
```

Você deve ver:
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 10.6. Reiniciar Nginx

```bash
sudo systemctl restart nginx
```

### 10.7. Testar o Site

Abra o navegador e acesse:
```
http://seu-dominio.com.br
# ou
http://seu-ip-do-servidor
```

Você deve ver o site IMEP Escola funcionando!

---

## Passo 11: Configurar SSL/HTTPS com Let's Encrypt

O SSL (HTTPS) é essencial para segurança, especialmente se você tiver formulários de login ou coleta de dados. O Let's Encrypt fornece certificados SSL gratuitos.

**IMPORTANTE**: Você precisa de um domínio registrado para usar SSL. Se você ainda não tem domínio, pule esta etapa por enquanto.

### 11.1. Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 11.2. Obter Certificado SSL

```bash
sudo certbot --nginx -d seu-dominio.com.br -d www.seu-dominio.com.br
```

Durante o processo, você será questionado:

```
1. "Enter email address"
   → Digite seu e-mail para notificações de renovação

2. "Please read the Terms of Service"
   → Digite: A (agree)

3. "Would you be willing to share your email address"
   → Digite: N (não é obrigatório)

4. "Please choose whether or not to redirect HTTP traffic to HTTPS"
   → Digite: 2 (redirecionar sempre para HTTPS)
```

### 11.3. Verificar SSL

Acesse seu site com HTTPS:
```
https://seu-dominio.com.br
```

Você deve ver o cadeado verde no navegador indicando conexão segura.

### 11.4. Configurar Renovação Automática

O Let's Encrypt emite certificados válidos por 90 dias. O Certbot configura renovação automática, mas vamos testar:

```bash
# Testar renovação (não renova de verdade, apenas simula)
sudo certbot renew --dry-run
```

Se não houver erros, a renovação automática está configurada corretamente.

### 11.5. Verificar Agendamento de Renovação

```bash
# Ver timer do systemd
sudo systemctl list-timers | grep certbot
```

Você deve ver uma entrada mostrando quando a próxima verificação de renovação será executada.

---

## Passo 12: Configurar Firewall

Configure o firewall para permitir apenas as portas necessárias e bloquear acessos não autorizados.

### 12.1. Instalar UFW (se não estiver instalado)

```bash
sudo apt install -y ufw
```

### 12.2. Configurar Regras

```bash
# Permitir SSH (IMPORTANTE: faça isso primeiro!)
sudo ufw allow 22/tcp

# Permitir HTTP
sudo ufw allow 80/tcp

# Permitir HTTPS
sudo ufw allow 443/tcp

# Permitir MySQL apenas localmente (mais seguro)
# Não execute este comando se você precisar acessar MySQL remotamente
sudo ufw allow from 127.0.0.1 to any port 3306

# Ver regras configuradas
sudo ufw show added
```

### 12.3. Habilitar Firewall

```bash
sudo ufw enable
```

Você verá um aviso sobre interrupção de conexões SSH. Digite `y` para confirmar.

### 12.4. Verificar Status

```bash
sudo ufw status verbose
```

Você deve ver algo como:

```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

---

## Passo 13: Configurar Backup Automático

Backups regulares são essenciais para proteger os dados contra perda acidental ou falhas de hardware.

### 13.1. Criar Script de Backup

```bash
sudo nano /usr/local/bin/backup-imep.sh
```

Cole o seguinte conteúdo:

```bash
#!/bin/bash

# Configurações
BACKUP_DIR="/var/backups/imep-escola"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="imep_escola"
DB_USER="imep_user"
DB_PASS="SuaSenhaAqui"
APP_DIR="/var/www/imep-escola"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Backup do banco de dados
echo "Fazendo backup do banco de dados..."
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Backup dos arquivos da aplicação (apenas uploads e configs)
echo "Fazendo backup dos arquivos..."
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz \
    $APP_DIR/.env \
    $APP_DIR/uploads \
    2>/dev/null

# Remover backups com mais de 7 dias
echo "Removendo backups antigos..."
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "files_backup_*.tar.gz" -mtime +7 -delete

echo "Backup concluído: $DATE"
```

**IMPORTANTE**: Substitua `SuaSenhaAqui` pela senha real do MySQL.

Salve e feche o arquivo.

### 13.2. Dar Permissão de Execução

```bash
sudo chmod +x /usr/local/bin/backup-imep.sh
```

### 13.3. Testar o Script

```bash
sudo /usr/local/bin/backup-imep.sh
```

Verifique se os backups foram criados:

```bash
ls -lh /var/backups/imep-escola/
```

### 13.4. Agendar Backup Automático Diário

```bash
# Editar crontab do root
sudo crontab -e
```

Adicione a seguinte linha ao final do arquivo:

```bash
# Backup diário às 3h da manhã
0 3 * * * /usr/local/bin/backup-imep.sh >> /var/log/backup-imep.log 2>&1
```

Salve e feche o arquivo.

### 13.5. Verificar Agendamento

```bash
sudo crontab -l
```

Você deve ver a linha do backup listada.

---

## Passo 14: Monitoramento e Logs

Configure ferramentas de monitoramento para acompanhar a saúde do servidor e da aplicação.

### 14.1. Ver Logs da Aplicação

```bash
# Logs do PM2 (aplicação Node.js)
pm2 logs imep-escola

# Logs do Nginx (acesso)
sudo tail -f /var/log/nginx/imep-escola-access.log

# Logs do Nginx (erros)
sudo tail -f /var/log/nginx/imep-escola-error.log

# Logs do MySQL
sudo tail -f /var/log/mysql/error.log
```

### 14.2. Monitorar Recursos do Sistema

```bash
# Ver uso de CPU e memória
htop

# Se htop não estiver instalado:
sudo apt install -y htop

# Ver uso de disco
df -h

# Ver processos da aplicação
pm2 monit
```

### 14.3. Configurar Alertas (Opcional)

Para receber alertas por e-mail quando algo der errado, você pode instalar o `monit`:

```bash
sudo apt install -y monit

# Configurar monit
sudo nano /etc/monit/monitrc
```

Adicione configurações básicas de monitoramento (CPU, memória, disco, etc.). Consulte a documentação do Monit para detalhes.

---

## Passo 15: Otimizações de Performance

Aplique otimizações para melhorar a performance do site.

### 15.1. Habilitar Compressão Gzip no Nginx

```bash
sudo nano /etc/nginx/nginx.conf
```

Procure a seção `gzip` e certifique-se de que está configurada assim:

```nginx
##
# Gzip Settings
##
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
gzip_disable "msie6";
```

Salve e reinicie o Nginx:

```bash
sudo systemctl restart nginx
```

### 15.2. Configurar Cache do Navegador

A configuração do Nginx que criamos no Passo 10.4 já inclui cache para arquivos estáticos. Verifique se está funcionando:

```bash
curl -I https://seu-dominio.com.br/logo.png | grep -i cache
```

Você deve ver headers como `Cache-Control: public, immutable`.

### 15.3. Otimizar MySQL

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Adicione ou ajuste as seguintes configurações na seção `[mysqld]`:

```ini
[mysqld]
# Performance
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
max_connections = 100
query_cache_type = 1
query_cache_size = 16M
```

Reinicie o MySQL:

```bash
sudo systemctl restart mysql
```

---

## Passo 16: Testes Finais

Realize testes completos para garantir que tudo está funcionando corretamente.

### 16.1. Checklist de Testes

Execute os seguintes testes:

| Teste | Como Verificar | Status |
|-------|----------------|--------|
| **Site carrega** | Acesse `https://seu-dominio.com.br` | ☐ |
| **SSL ativo** | Verifique o cadeado verde no navegador | ☐ |
| **Página inicial** | Verifique se todos os elementos carregam | ☐ |
| **Listagem de cursos** | Acesse `/cursos` e veja se os cursos aparecem | ☐ |
| **Detalhes do curso** | Clique em um curso e veja a página de detalhes | ☐ |
| **Formulário de contato** | Envie uma mensagem de teste | ☐ |
| **Botão WhatsApp** | Clique e veja se abre o WhatsApp | ☐ |
| **Painel admin** | Acesse `/admin` e faça login | ☐ |
| **Criar curso** | Crie um curso de teste no admin | ☐ |
| **Upload de imagem** | Faça upload de uma imagem de curso | ☐ |
| **Favoritos** | Adicione um curso aos favoritos | ☐ |
| **Performance** | Use PageSpeed Insights para testar | ☐ |

### 16.2. Testar Performance

Acesse o Google PageSpeed Insights:
```
https://pagespeed.web.dev/
```

Digite a URL do seu site e analise os resultados. Idealmente, você deve ter:
- **Performance**: 80+ (verde)
- **Accessibility**: 90+ (verde)
- **Best Practices**: 90+ (verde)
- **SEO**: 90+ (verde)

### 16.3. Testar SSL

Acesse o SSL Labs:
```
https://www.ssllabs.com/ssltest/
```

Digite seu domínio e verifique a nota. Idealmente, você deve ter nota **A** ou **A+**.

---

## Solução de Problemas Comuns

### Problema 1: Site não carrega (502 Bad Gateway)

**Sintomas**: Ao acessar o site, aparece erro 502 do Nginx.

**Soluções**:
```bash
# 1. Verificar se a aplicação está rodando
pm2 status

# Se não estiver online:
pm2 restart imep-escola

# 2. Verificar logs da aplicação
pm2 logs imep-escola --lines 50

# 3. Verificar se a porta 3000 está em uso
sudo netstat -tulpn | grep 3000

# 4. Verificar logs do Nginx
sudo tail -50 /var/log/nginx/imep-escola-error.log
```

### Problema 2: Erro de conexão com banco de dados

**Sintomas**: Aplicação inicia mas não consegue acessar dados.

**Soluções**:
```bash
# 1. Verificar se MySQL está rodando
sudo systemctl status mysql

# Se não estiver:
sudo systemctl start mysql

# 2. Testar conexão manual
mysql -u imep_user -p imep_escola

# 3. Verificar credenciais no .env
cat /var/www/imep-escola/.env | grep DATABASE_URL

# 4. Verificar logs do MySQL
sudo tail -50 /var/log/mysql/error.log
```

### Problema 3: Upload de imagens não funciona

**Sintomas**: Erro ao fazer upload de imagens no painel admin.

**Soluções**:
```bash
# 1. Verificar permissões da pasta uploads
ls -la /var/www/imep-escola/uploads

# Corrigir permissões se necessário:
sudo chown -R www-data:www-data /var/www/imep-escola/uploads
sudo chmod -R 755 /var/www/imep-escola/uploads

# 2. Verificar configuração do Nginx (tamanho máximo)
sudo nano /etc/nginx/sites-available/imep-escola
# Procure por: client_max_body_size

# 3. Verificar credenciais AWS S3 no .env
cat /var/www/imep-escola/.env | grep AWS_
```

### Problema 4: SSL não funciona

**Sintomas**: Certificado SSL expirado ou não carrega.

**Soluções**:
```bash
# 1. Verificar status do certificado
sudo certbot certificates

# 2. Renovar manualmente
sudo certbot renew

# 3. Verificar configuração do Nginx
sudo nginx -t

# 4. Reiniciar Nginx
sudo systemctl restart nginx
```

### Problema 5: Aplicação consome muita memória

**Sintomas**: Servidor fica lento ou aplicação reinicia sozinha.

**Soluções**:
```bash
# 1. Ver uso de memória
free -h
pm2 monit

# 2. Ajustar limite de memória no PM2
nano /var/www/imep-escola/ecosystem.config.js
# Altere: max_memory_restart: '500M'

# 3. Reiniciar com nova configuração
pm2 restart imep-escola

# 4. Considere upgrade do servidor se necessário
```

---

## Manutenção Regular

Execute estas tarefas regularmente para manter o sistema saudável:

### Diariamente (Automático)
- ✅ Backup do banco de dados (via cron)
- ✅ Verificação de logs de erro

### Semanalmente
```bash
# Verificar uso de disco
df -h

# Verificar logs de erro
sudo tail -100 /var/log/nginx/imep-escola-error.log
pm2 logs imep-escola --err --lines 100

# Verificar status dos serviços
sudo systemctl status nginx mysql
pm2 status
```

### Mensalmente
```bash
# Atualizar sistema
sudo apt update
sudo apt upgrade -y

# Atualizar dependências do Node.js (com cuidado)
cd /var/www/imep-escola
pnpm update

# Rebuild da aplicação
pnpm run build
pm2 restart imep-escola

# Verificar backups
ls -lh /var/backups/imep-escola/

# Testar restauração de backup (em ambiente de teste)
```

### Trimestralmente
- Revisar políticas de segurança
- Atualizar senhas
- Revisar logs de acesso para atividades suspeitas
- Testar plano de recuperação de desastres

---

## Comandos Úteis de Referência Rápida

### Gerenciamento da Aplicação
```bash
# Reiniciar aplicação
pm2 restart imep-escola

# Ver logs em tempo real
pm2 logs imep-escola

# Ver status
pm2 status

# Monitorar recursos
pm2 monit
```

### Gerenciamento do Nginx
```bash
# Testar configuração
sudo nginx -t

# Reiniciar
sudo systemctl restart nginx

# Ver logs de acesso
sudo tail -f /var/log/nginx/imep-escola-access.log

# Ver logs de erro
sudo tail -f /var/log/nginx/imep-escola-error.log
```

### Gerenciamento do MySQL
```bash
# Acessar MySQL
mysql -u imep_user -p imep_escola

# Backup manual
mysqldump -u imep_user -p imep_escola > backup.sql

# Restaurar backup
mysql -u imep_user -p imep_escola < backup.sql

# Ver processos
mysql -u root -p -e "SHOW PROCESSLIST;"
```

### Monitoramento do Sistema
```bash
# Uso de CPU e memória
htop

# Uso de disco
df -h

# Processos em execução
ps aux | grep node

# Conexões de rede
sudo netstat -tulpn
```

---

## Recursos Adicionais

### Documentação Oficial
- **Node.js**: [https://nodejs.org/docs/](https://nodejs.org/docs/)
- **MySQL**: [https://dev.mysql.com/doc/](https://dev.mysql.com/doc/)
- **Nginx**: [https://nginx.org/en/docs/](https://nginx.org/en/docs/)
- **PM2**: [https://pm2.keymetrics.io/docs/](https://pm2.keymetrics.io/docs/)
- **Let's Encrypt**: [https://letsencrypt.org/docs/](https://letsencrypt.org/docs/)

### Ferramentas de Teste
- **PageSpeed Insights**: [https://pagespeed.web.dev/](https://pagespeed.web.dev/)
- **SSL Labs**: [https://www.ssllabs.com/ssltest/](https://www.ssllabs.com/ssltest/)
- **GTmetrix**: [https://gtmetrix.com/](https://gtmetrix.com/)

### Comunidades e Suporte
- **Stack Overflow**: Para perguntas técnicas
- **DigitalOcean Community**: Tutoriais e guias
- **GitHub Issues**: Para problemas específicos do projeto

---

## Próximos Passos

Após a instalação completa, considere implementar:

1. **CDN (Content Delivery Network)**: Use Cloudflare para melhorar performance global
2. **Monitoramento Avançado**: Implemente ferramentas como New Relic ou Datadog
3. **CI/CD**: Configure deploy automático via GitHub Actions ou GitLab CI
4. **Escalabilidade**: Configure load balancer se o tráfego crescer
5. **Segurança Avançada**: Implemente WAF (Web Application Firewall)
6. **Analytics**: Integre Google Analytics ou Matomo
7. **Chat ao Vivo**: Adicione suporte via chat para alunos
8. **API Pública**: Exponha APIs para integrações externas

---

## Conclusão

Este guia cobriu todo o processo de instalação e configuração do projeto IMEP Escola em um servidor VPS, desde a configuração inicial do sistema operacional até otimizações de performance e segurança. Com todos os passos concluídos, você terá um site profissional, seguro e escalável rodando em produção.

O sistema está configurado para:
- ✅ Rodar continuamente com PM2
- ✅ Reiniciar automaticamente em caso de falhas
- ✅ Fazer backups diários automáticos
- ✅ Renovar certificado SSL automaticamente
- ✅ Servir conteúdo com alta performance via Nginx
- ✅ Proteger dados com firewall configurado
- ✅ Registrar logs para troubleshooting

Se você encontrar problemas não cobertos neste guia, consulte a seção de **Solução de Problemas Comuns** ou entre em contato com a comunidade de desenvolvedores.

---

**Documento criado por**: Manus AI  
**Data**: 22 de Janeiro de 2026  
**Versão**: 1.0  
**Projeto**: IMEP - Instituto Magalhães de Educação Profissional
