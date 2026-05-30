# 📦 IMEP - Pacote para Deploy na Hostinger

## ✅ O que está incluído neste pacote

- ✅ Aplicação compilada pronta para produção (`dist/`)
- ✅ Script SQL para criar banco de dados MySQL (`mysql-schema.sql`)
- ✅ Guia completo de instalação na Hostinger (`HOSTINGER-INSTALL.md`)
- ✅ Documentação do sistema de pagamentos (`PAYMENT-SYSTEM.md`)
- ✅ Configuração PM2 para gerenciamento de processos (`ecosystem.config.js`)
- ✅ Arquivos de dependências (`package.json`, `pnpm-lock.yaml`)

---

## 🚀 Início Rápido

### 1. Faça upload do arquivo ZIP

Extraia este arquivo ZIP no seu servidor Hostinger:
- Via **File Manager**: Upload → Extract
- Via **SSH**: `unzip imep-escola-deploy.zip`

### 2. Configure o banco de dados

1. Crie um banco MySQL no **Cloud Panel → Databases**
2. Importe o arquivo `mysql-schema.sql` via **phpMyAdmin**
3. Anote as credenciais (usuário, senha, nome do banco)

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com suas credenciais:

```env
DATABASE_URL=mysql://usuario:senha@localhost:3306/nome_banco
NODE_ENV=production
PORT=3000
JWT_SECRET=sua_chave_secreta_forte_32_caracteres
# ... (veja HOSTINGER-INSTALL.md para lista completa)
```

### 4. Instale as dependências

```bash
cd /caminho/para/imep-escola
npm install --production
```

### 5. Inicie a aplicação

**Via PM2 (recomendado):**
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
```

**Via Cloud Panel:**
- Vá em **Advanced → Node.js Applications**
- Clique em **Create Application**
- Configure conforme o guia

---

## 📚 Documentação Completa

Para instruções detalhadas passo a passo, abra o arquivo:

**`HOSTINGER-INSTALL.md`**

Este guia contém:
- ✅ Configuração completa do servidor
- ✅ Configuração do banco de dados MySQL
- ✅ Configuração de SSL/HTTPS
- ✅ Configuração do Stripe Webhook
- ✅ Solução de problemas comuns
- ✅ Configuração de backups automáticos
- ✅ Checklist de segurança

---

## ⚠️ Importante

### Antes de colocar no ar:

1. ✅ Configure TODAS as variáveis de ambiente no `.env`
2. ✅ Use chaves do Stripe em **modo produção** (`sk_live_`, `pk_live_`)
3. ✅ Configure o webhook do Stripe com a URL do seu domínio
4. ✅ Ative SSL/HTTPS no seu domínio
5. ✅ Teste o fluxo completo de matrícula
6. ✅ Configure backups automáticos

### Não incluído (você precisa instalar):

- ❌ `node_modules/` - Execute `npm install --production` no servidor
- ❌ Arquivo `.env` - Crie manualmente com suas credenciais
- ❌ Certificado SSL - Configure via Hostinger Cloud Panel

---

## 📞 Suporte

- **Guia Completo:** `HOSTINGER-INSTALL.md`
- **Sistema de Pagamentos:** `PAYMENT-SYSTEM.md`
- **Suporte Hostinger:** https://www.hostinger.com.br/suporte

---

## 🎯 Estrutura do Projeto

```
imep-escola/
├── dist/                          # Aplicação compilada
│   ├── public/                    # Frontend (HTML, CSS, JS)
│   │   ├── index.html
│   │   └── assets/
│   └── index.js                   # Backend Node.js
├── mysql-schema.sql               # Script do banco de dados
├── package.json                   # Dependências
├── ecosystem.config.js            # Configuração PM2
├── HOSTINGER-INSTALL.md           # Guia de instalação
├── PAYMENT-SYSTEM.md              # Documentação de pagamentos
└── .env (você cria)               # Variáveis de ambiente
```

---

## ✅ Checklist de Deploy

- [ ] Arquivo ZIP extraído no servidor
- [ ] Banco de dados MySQL criado
- [ ] Schema SQL importado (6 tabelas criadas)
- [ ] Arquivo `.env` criado e configurado
- [ ] Dependências instaladas (`npm install --production`)
- [ ] Aplicação iniciada (PM2 ou Cloud Panel)
- [ ] SSL/HTTPS ativado
- [ ] Webhook do Stripe configurado
- [ ] Teste de matrícula realizado com sucesso
- [ ] Backups configurados

---

**Boa sorte com o deploy! 🚀**

Se tiver dúvidas, consulte o `HOSTINGER-INSTALL.md` para instruções detalhadas.
