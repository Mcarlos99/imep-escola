# Guia de Instalação - Hostinger Cloud Panel

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ Conta na Hostinger com Cloud Panel
- ✅ Acesso ao phpMyAdmin
- ✅ Node.js 18+ instalado no servidor (Cloud Panel já vem com Node.js)
- ✅ Acesso SSH ao servidor (opcional, mas recomendado)

---

## 🗂️ Estrutura do Pacote

O arquivo ZIP contém:

```
imep-escola/
├── dist/                    # Aplicação compilada (frontend + backend)
│   ├── public/             # Arquivos estáticos (HTML, CSS, JS)
│   └── index.js            # Servidor Node.js compilado
├── mysql-schema.sql        # Script SQL para criar banco de dados
├── package.json            # Dependências do projeto
├── .env.example            # Exemplo de variáveis de ambiente
├── HOSTINGER-INSTALL.md    # Este guia
└── ecosystem.config.js     # Configuração PM2 para produção
```

---

## 🚀 Passo a Passo de Instalação

### 1. Upload dos Arquivos

**Opção A: Via File Manager (Mais Fácil)**

1. Acesse o **Hostinger Cloud Panel**
2. Vá em **Files → File Manager**
3. Navegue até `/home/u123456789/domains/seudominio.com/public_html` (substitua pelo seu caminho)
4. Faça upload do arquivo `imep-escola.zip`
5. Clique com botão direito no arquivo → **Extract**
6. Delete o arquivo ZIP após extrair

**Opção B: Via SSH (Recomendado)**

```bash
# Conectar via SSH
ssh u123456789@seudominio.com

# Navegar até o diretório
cd domains/seudominio.com/public_html

# Fazer upload via SCP (do seu computador local)
scp imep-escola.zip u123456789@seudominio.com:~/domains/seudominio.com/public_html/

# Extrair o arquivo
unzip imep-escola.zip
rm imep-escola.zip
```

---

### 2. Configurar Banco de Dados MySQL

#### 2.1. Criar Banco de Dados

1. No **Hostinger Cloud Panel**, vá em **Databases → MySQL Databases**
2. Clique em **Create Database**
3. Preencha:
   - **Database Name:** `u123456789_imep` (substitua u123456789 pelo seu ID)
   - **Username:** `u123456789_imep_user`
   - **Password:** Gere uma senha forte (anote!)
4. Clique em **Create**

#### 2.2. Importar Schema SQL

1. Vá em **Databases → phpMyAdmin**
2. Selecione o banco `u123456789_imep` na barra lateral esquerda
3. Clique na aba **Import**
4. Clique em **Choose File** e selecione `mysql-schema.sql`
5. Role até o final e clique em **Go**
6. Aguarde a mensagem de sucesso: "Import has been successfully finished"

**Verificação:**
- Você deve ver 6 tabelas criadas: `users`, `categories`, `courses`, `enrollments`, `payments`, `favorites`

---

### 3. Configurar Variáveis de Ambiente

#### 3.1. Criar arquivo `.env`

No diretório do projeto, crie um arquivo `.env` com o seguinte conteúdo:

```env
# Database Configuration
DATABASE_URL=mysql://u123456789_imep_user:SUA_SENHA_AQUI@localhost:3306/u123456789_imep

# Server Configuration
NODE_ENV=production
PORT=3000

# JWT Secret (gere uma chave aleatória forte)
JWT_SECRET=sua_chave_secreta_muito_forte_aqui_min_32_caracteres

# Manus OAuth (obtenha em https://manus.im/settings/oauth)
VITE_APP_ID=seu_app_id_manus
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Stripe Keys (obtenha em https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Owner Information
OWNER_OPEN_ID=seu_open_id
OWNER_NAME=Seu Nome

# Built-in APIs (se usar serviços Manus)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_api_key

# Frontend URLs
VITE_APP_TITLE=IMEP - Instituto Magalhães
VITE_APP_LOGO=/logo.png
```

**⚠️ IMPORTANTE:**
- Substitua `u123456789` pelo seu ID de usuário da Hostinger
- Substitua `SUA_SENHA_AQUI` pela senha do banco de dados
- Gere um `JWT_SECRET` forte: use https://randomkeygen.com/ (CodeIgniter Encryption Keys)
- Configure as chaves do Stripe (modo produção)

#### 3.2. Proteger o arquivo `.env`

Crie um arquivo `.htaccess` na raiz do projeto:

```apache
# Proteger arquivo .env
<Files .env>
    Order allow,deny
    Deny from all
</Files>
```

---

### 4. Instalar Dependências

Via SSH:

```bash
cd /home/u123456789/domains/seudominio.com/public_html/imep-escola

# Instalar dependências de produção
npm install --production

# Ou usando pnpm (se disponível)
pnpm install --prod
```

**Nota:** A Hostinger Cloud Panel geralmente já tem `npm` instalado. Se não tiver, use o Node.js App Manager do painel.

---

### 5. Configurar Node.js Application

#### 5.1. Via Cloud Panel (Recomendado)

1. No **Hostinger Cloud Panel**, vá em **Advanced → Node.js**
2. Clique em **Create Application**
3. Preencha:
   - **Application Root:** `/domains/seudominio.com/public_html/imep-escola`
   - **Application URL:** `https://seudominio.com` (ou subdomínio)
   - **Application Startup File:** `dist/index.js`
   - **Node.js Version:** 18.x ou superior
4. Clique em **Create**

#### 5.2. Configurar Proxy Reverso

O Cloud Panel configurará automaticamente o Nginx como proxy reverso. Verifique se está rodando:

```nginx
# Configuração automática do Hostinger
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

---

### 6. Iniciar Aplicação

#### Opção A: Via Cloud Panel

1. No **Node.js Applications**, clique em **Start** na sua aplicação
2. Aguarde o status mudar para **Running**

#### Opção B: Via PM2 (SSH)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
pm2 start dist/index.js --name imep-escola

# Configurar para iniciar automaticamente
pm2 startup
pm2 save

# Ver logs
pm2 logs imep-escola

# Ver status
pm2 status
```

---

### 7. Configurar SSL/HTTPS

1. No **Hostinger Cloud Panel**, vá em **Security → SSL/TLS**
2. Selecione seu domínio
3. Clique em **Install SSL Certificate**
4. Escolha **Let's Encrypt** (gratuito)
5. Aguarde a instalação (1-2 minutos)
6. Ative **Force HTTPS Redirect**

---

### 8. Configurar Webhook do Stripe

1. Acesse https://dashboard.stripe.com/webhooks
2. Clique em **Add endpoint**
3. Preencha:
   - **Endpoint URL:** `https://seudominio.com/api/stripe/webhook`
   - **Events to send:**
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
4. Copie o **Signing secret** (whsec_...)
5. Adicione ao arquivo `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_copiado_aqui
   ```
6. Reinicie a aplicação

---

### 9. Testar a Aplicação

1. Acesse `https://seudominio.com`
2. Verifique se a página inicial carrega corretamente
3. Teste o login (se configurado OAuth)
4. Acesse `/admin` para painel administrativo
5. Teste uma matrícula de teste com cartão `4242 4242 4242 4242`

---

## 🔧 Comandos Úteis

### Reiniciar Aplicação

```bash
# Via PM2
pm2 restart imep-escola

# Via Cloud Panel
# Vá em Node.js Applications → Restart
```

### Ver Logs

```bash
# Via PM2
pm2 logs imep-escola

# Via SSH (logs do Node.js)
tail -f /home/u123456789/logs/nodejs.log
```

### Atualizar Aplicação

```bash
# Fazer backup do banco de dados primeiro!
# No phpMyAdmin: Export → Go

# Parar aplicação
pm2 stop imep-escola

# Fazer backup dos arquivos
cp -r imep-escola imep-escola-backup-$(date +%Y%m%d)

# Substituir arquivos novos
# (upload via FTP/SSH)

# Reinstalar dependências
cd imep-escola
npm install --production

# Reiniciar
pm2 restart imep-escola
```

---

## 🛠️ Solução de Problemas

### Erro: "Cannot connect to database"

**Causa:** Credenciais incorretas no `.env`

**Solução:**
1. Verifique `DATABASE_URL` no `.env`
2. Teste conexão no phpMyAdmin com as mesmas credenciais
3. Certifique-se de que o usuário tem permissões no banco

### Erro: "Port 3000 already in use"

**Causa:** Outra aplicação usando a porta

**Solução:**
1. Mude a porta no `.env`: `PORT=3001`
2. Atualize configuração do proxy no Nginx
3. Reinicie a aplicação

### Erro: "Module not found"

**Causa:** Dependências não instaladas

**Solução:**
```bash
cd imep-escola
rm -rf node_modules
npm install --production
pm2 restart imep-escola
```

### Webhook do Stripe não funciona

**Causa:** Assinatura inválida ou URL incorreta

**Solução:**
1. Verifique se `STRIPE_WEBHOOK_SECRET` está correto no `.env`
2. Teste o webhook em https://dashboard.stripe.com/webhooks
3. Veja logs: `pm2 logs imep-escola | grep Stripe`

### Página em branco após deploy

**Causa:** Arquivos estáticos não carregando

**Solução:**
1. Verifique se `dist/public/` existe
2. Verifique permissões: `chmod -R 755 dist/`
3. Limpe cache do navegador (Ctrl+Shift+R)

---

## 📊 Monitoramento

### Verificar Status da Aplicação

```bash
# Via PM2
pm2 status

# Via curl
curl https://seudominio.com

# Ver uso de recursos
pm2 monit
```

### Configurar Alertas

```bash
# Instalar PM2 Plus (opcional)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔒 Segurança

### Checklist de Segurança

- [ ] Arquivo `.env` protegido (não acessível via web)
- [ ] SSL/HTTPS ativado e forçado
- [ ] Senhas fortes no banco de dados
- [ ] `JWT_SECRET` aleatório e forte (min 32 caracteres)
- [ ] Stripe em modo produção (chaves `sk_live_` e `pk_live_`)
- [ ] Webhook do Stripe validando assinaturas
- [ ] Firewall configurado (apenas portas 80, 443, 22)
- [ ] Backups automáticos configurados
- [ ] Logs sendo monitorados

### Configurar Firewall

```bash
# Permitir apenas portas necessárias
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

---

## 💾 Backup

### Backup Manual

```bash
# Backup do banco de dados
mysqldump -u u123456789_imep_user -p u123456789_imep > backup-$(date +%Y%m%d).sql

# Backup dos arquivos
tar -czf imep-backup-$(date +%Y%m%d).tar.gz imep-escola/
```

### Backup Automático (Cron)

```bash
# Editar crontab
crontab -e

# Adicionar linha (backup diário às 3h da manhã)
0 3 * * * /home/u123456789/scripts/backup-imep.sh
```

Criar script `/home/u123456789/scripts/backup-imep.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="/home/u123456789/backups"

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Backup banco de dados
mysqldump -u u123456789_imep_user -pSUA_SENHA u123456789_imep > $BACKUP_DIR/db-$DATE.sql

# Backup arquivos
tar -czf $BACKUP_DIR/files-$DATE.tar.gz /home/u123456789/domains/seudominio.com/public_html/imep-escola

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup concluído: $DATE"
```

Dar permissão de execução:
```bash
chmod +x /home/u123456789/scripts/backup-imep.sh
```

---

## 📞 Suporte

### Recursos Úteis

- **Hostinger Support:** https://www.hostinger.com.br/suporte
- **Documentação Node.js Hostinger:** https://support.hostinger.com/en/articles/5617864-how-to-deploy-a-node-js-application
- **Stripe Docs:** https://stripe.com/docs
- **PM2 Docs:** https://pm2.keymetrics.io/docs/usage/quick-start/

### Logs Importantes

- **Node.js:** `/home/u123456789/logs/nodejs.log`
- **Nginx:** `/var/log/nginx/error.log`
- **MySQL:** `/var/log/mysql/error.log`
- **PM2:** `~/.pm2/logs/`

---

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Banco de dados criado e schema importado
- [ ] Arquivo `.env` configurado com todas as variáveis
- [ ] Dependências instaladas (`npm install --production`)
- [ ] Aplicação iniciada e rodando (PM2 ou Cloud Panel)
- [ ] SSL/HTTPS ativado
- [ ] Webhook do Stripe configurado e testado
- [ ] Página inicial carregando corretamente
- [ ] Login funcionando (se OAuth configurado)
- [ ] Teste de matrícula realizado com sucesso
- [ ] Backups configurados
- [ ] Monitoramento ativo

---

## 🎉 Conclusão

Seu site IMEP agora está rodando na Hostinger! 

**Próximos passos:**
1. Adicione conteúdo real (cursos, categorias, depoimentos)
2. Configure e-mails transacionais
3. Monitore logs e performance
4. Faça backups regulares

Para dúvidas ou problemas, consulte a documentação ou entre em contato com o suporte da Hostinger.

**Bom trabalho! 🚀**
