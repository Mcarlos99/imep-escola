# Guia de Configuração do Supabase para IMEP Escola

Este documento fornece instruções detalhadas para configurar o banco de dados PostgreSQL no Supabase para o projeto IMEP Escola. O Supabase oferece uma plataforma completa de backend com PostgreSQL gerenciado, autenticação, armazenamento de arquivos e APIs automáticas.

---

## Visão Geral

O projeto IMEP Escola utiliza um banco de dados relacional com as seguintes tabelas principais:

| Tabela | Descrição | Registros Principais |
|--------|-----------|---------------------|
| **users** | Usuários do sistema com controle de acesso por roles (admin/user) | Administradores e estudantes |
| **categories** | Categorias de cursos (Saúde, Tecnologia, Indústria, Gestão) | 4 categorias padrão |
| **courses** | Catálogo completo de cursos técnicos oferecidos | Cursos com imagens, preços e modalidades |
| **testimonials** | Depoimentos de alunos formados | Avaliações e feedbacks |
| **settings** | Configurações gerais do site | Contatos, redes sociais, informações institucionais |
| **favorites** | Lista de desejos dos estudantes | Relacionamento entre usuários e cursos |

O banco de dados implementa **Row Level Security (RLS)** para garantir que apenas usuários autorizados possam acessar ou modificar dados sensíveis. Administradores têm acesso completo ao sistema através do painel administrativo em `/admin`.

---

## Passo 1: Criar Conta no Supabase

Acesse o site oficial do Supabase e crie uma conta gratuita. O plano gratuito oferece recursos suficientes para projetos de pequeno e médio porte, incluindo 500 MB de armazenamento de banco de dados e 1 GB de transferência de dados por mês.

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em **"Start your project"** ou **"Sign Up"**
3. Faça login com sua conta GitHub, Google ou e-mail
4. Confirme seu e-mail se necessário

Após o login, você será direcionado ao dashboard do Supabase onde poderá criar e gerenciar seus projetos.

---

## Passo 2: Criar Novo Projeto

No dashboard do Supabase, você precisará criar um novo projeto que hospedará o banco de dados do IMEP Escola.

1. No dashboard, clique em **"New Project"**
2. Preencha as informações do projeto:
   - **Name**: `imep-escola` (ou nome de sua preferência)
   - **Database Password**: Crie uma senha forte e **anote em local seguro** - você precisará dela para conexões diretas
   - **Region**: Escolha a região mais próxima do Brasil (recomendado: **South America (São Paulo)** se disponível, ou **US East (North Virginia)** como alternativa)
   - **Pricing Plan**: Selecione **"Free"** para começar

3. Clique em **"Create new project"**
4. Aguarde alguns minutos enquanto o Supabase provisiona sua infraestrutura

O processo de criação pode levar de 2 a 5 minutos. Durante esse tempo, o Supabase está configurando seu banco de dados PostgreSQL, APIs automáticas e serviços de autenticação.

---

## Passo 3: Executar o Script SQL

Com o projeto criado, você executará o script SQL que cria todas as tabelas, índices, triggers e políticas de segurança necessárias para o funcionamento completo do sistema IMEP.

### 3.1. Acessar o SQL Editor

1. No menu lateral esquerdo do dashboard do Supabase, clique em **"SQL Editor"**
2. Você verá uma interface de editor de código SQL com exemplos e templates
3. Clique em **"New query"** para criar uma nova consulta em branco

### 3.2. Copiar e Executar o Script

1. Abra o arquivo `supabase-schema.sql` que está na raiz do projeto
2. Copie **todo o conteúdo** do arquivo (aproximadamente 400 linhas de código SQL)
3. Cole o conteúdo no editor SQL do Supabase
4. Clique no botão **"Run"** (ícone de play) no canto superior direito
5. Aguarde a execução - deve levar alguns segundos

### 3.3. Verificar a Execução

Após a execução, você verá uma mensagem de sucesso na parte inferior do editor. O script criará:

- **6 tabelas principais** com todas as colunas e tipos de dados corretos
- **Índices** para otimizar consultas frequentes
- **Triggers** para atualizar automaticamente campos como `updatedAt`
- **Políticas RLS** para controle de acesso granular
- **Views** para consultas complexas pré-configuradas
- **Funções auxiliares** como `generate_slug()` para manipulação de texto
- **Dados iniciais** incluindo 4 categorias padrão e configurações do site

Para confirmar que tudo foi criado corretamente, você pode executar a seguinte query no SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Você deverá ver as seguintes tabelas listadas: `categories`, `courses`, `favorites`, `settings`, `testimonials` e `users`.

---

## Passo 4: Obter Credenciais de Conexão

Para conectar sua aplicação ao banco de dados Supabase, você precisará de duas informações essenciais: a **URL de conexão** e a **chave de API**. Essas credenciais permitem que o backend do IMEP Escola se comunique com o banco de dados de forma segura.

### 4.1. Acessar as Configurações do Projeto

1. No menu lateral, clique em **"Project Settings"** (ícone de engrenagem)
2. No submenu, clique em **"Database"**

### 4.2. Copiar a Connection String

Na seção **"Connection string"**, você encontrará diferentes formatos de string de conexão. Para o projeto IMEP Escola, você precisará da **Connection string** no formato URI.

1. Localize a seção **"Connection string"**
2. Selecione a aba **"URI"**
3. Você verá uma string no formato:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
4. Clique no botão **"Copy"** ou copie manualmente
5. **IMPORTANTE**: Substitua `[YOUR-PASSWORD]` pela senha que você criou no Passo 2

### 4.3. Obter a API Key

1. No menu lateral, clique em **"Project Settings"** novamente
2. Clique em **"API"** no submenu
3. Na seção **"Project API keys"**, você verá duas chaves:
   - **anon public**: Chave pública para uso no frontend (não sensível)
   - **service_role secret**: Chave privada com privilégios administrativos (**mantenha em segredo**)

4. Copie a chave **"anon public"** - essa será usada no frontend
5. Copie também a **"service_role secret"** se você precisar de operações administrativas no backend

### 4.4. Copiar a URL da API

Na mesma página de configurações de API, você encontrará:

- **URL**: A URL base da sua API Supabase (formato: `https://xxxxxxxxxxxxx.supabase.co`)
- Copie essa URL também

---

## Passo 5: Configurar Variáveis de Ambiente

Com as credenciais em mãos, você precisa configurá-las no arquivo de ambiente da aplicação. O projeto IMEP Escola utiliza variáveis de ambiente para armazenar informações sensíveis de forma segura.

### 5.1. Atualizar o Arquivo .env

1. Na raiz do projeto, localize o arquivo `.env` (ou crie um novo se não existir)
2. Adicione ou atualize as seguintes variáveis:

```env
# ============================================
# SUPABASE DATABASE CONFIGURATION
# ============================================
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"

# ============================================
# SUPABASE API CONFIGURATION
# ============================================
SUPABASE_URL="https://xxxxxxxxxxxxx.supabase.co"
SUPABASE_ANON_KEY="sua-chave-anon-public-aqui"
SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role-aqui"

# ============================================
# OUTRAS CONFIGURAÇÕES NECESSÁRIAS
# ============================================
# JWT Secret para autenticação (gere uma string aleatória segura)
JWT_SECRET="sua-chave-secreta-jwt-aqui"

# Informações do proprietário
OWNER_NAME="IMEP Escola"
OWNER_EMAIL="magalhaeseducacao.aedu@gmail.com"

# WhatsApp
WHATSAPP_NUMBER="5594992435333"

# AWS S3 para upload de imagens (se ainda não configurado)
AWS_ACCESS_KEY_ID="sua-access-key"
AWS_SECRET_ACCESS_KEY="sua-secret-key"
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="seu-bucket-name"
```

### 5.2. Substituir os Valores

**IMPORTANTE**: Substitua todos os valores de exemplo pelas suas credenciais reais:

- `[SUA-SENHA]`: A senha do banco de dados que você criou no Passo 2
- `xxxxxxxxxxxxx`: O ID único do seu projeto Supabase
- `sua-chave-anon-public-aqui`: A chave pública copiada no Passo 4.3
- `sua-chave-service-role-aqui`: A chave privada copiada no Passo 4.3
- `sua-chave-secreta-jwt-aqui`: Gere uma string aleatória longa (mínimo 32 caracteres)

### 5.3. Gerar JWT Secret

Para gerar uma chave JWT segura, você pode usar um dos seguintes métodos:

**Método 1: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Método 2: OpenSSL**
```bash
openssl rand -hex 32
```

**Método 3: Online** (use apenas em ambiente de desenvolvimento)
Acesse: https://generate-secret.vercel.app/32

---

## Passo 6: Atualizar o Código para Supabase

O projeto IMEP Escola foi originalmente configurado para MySQL. Para usar o Supabase (PostgreSQL), você precisará fazer algumas adaptações no código, principalmente no arquivo de configuração do Drizzle ORM.

### 6.1. Instalar Dependências do PostgreSQL

Execute o seguinte comando na raiz do projeto:

```bash
pnpm add postgres @neondatabase/serverless
pnpm add -D drizzle-kit
```

### 6.2. Atualizar drizzle.config.ts

Abra o arquivo `drizzle.config.ts` na raiz do projeto e substitua o conteúdo por:

```typescript
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

### 6.3. Atualizar server/db.ts

Abra o arquivo `server/db.ts` e atualize a configuração de conexão:

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle/schema";

// Criar conexão com PostgreSQL
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

// Criar instância do Drizzle
export const db = drizzle(client, { schema });

// Exportar tipos
export type Database = typeof db;
```

### 6.4. Ajustar Schema do Drizzle

O arquivo `drizzle/schema.ts` precisa ser atualizado para usar tipos PostgreSQL em vez de MySQL. As principais mudanças são:

**Antes (MySQL):**
```typescript
import { mysqlTable, int, varchar, text, timestamp, boolean, decimal } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  // ...
});
```

**Depois (PostgreSQL):**
```typescript
import { pgTable, serial, varchar, text, timestamp, boolean, decimal, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  // ...
});
```

**Mudanças principais:**
- `mysqlTable` → `pgTable`
- `int("id").autoincrement()` → `serial("id")`
- `int()` → `integer()`
- Tipos de dados permanecem similares (varchar, text, timestamp, boolean, decimal)

### 6.5. Executar Migrações

Após atualizar o código, execute:

```bash
# Gerar arquivos de migração
pnpm drizzle-kit generate

# Aplicar migrações ao banco de dados
pnpm drizzle-kit migrate
```

**NOTA**: Como você já executou o script SQL completo no Passo 3, as migrações podem reportar que as tabelas já existem. Isso é normal e esperado.

---

## Passo 7: Testar a Conexão

Com tudo configurado, é hora de verificar se a aplicação consegue se conectar ao banco de dados Supabase corretamente.

### 7.1. Iniciar o Servidor de Desenvolvimento

Execute o comando:

```bash
pnpm dev
```

O servidor deve iniciar sem erros. Verifique os logs no terminal - você deve ver mensagens indicando que o servidor está rodando na porta 3000.

### 7.2. Verificar a Aplicação

1. Abra o navegador e acesse: `http://localhost:3000`
2. Navegue até a página de **Cursos** (`/cursos`)
3. Verifique se a página carrega sem erros
4. Se você já tiver cursos cadastrados, eles devem aparecer na listagem

### 7.3. Testar o Painel Administrativo

1. Acesse o painel admin: `http://localhost:3000/admin`
2. Faça login com suas credenciais (se necessário)
3. Tente criar uma nova categoria ou curso
4. Verifique se os dados são salvos corretamente

### 7.4. Verificar Logs de Erro

Se encontrar problemas:

1. Verifique o console do navegador (F12) para erros JavaScript
2. Verifique os logs do servidor no terminal
3. Confirme que todas as variáveis de ambiente estão corretas no arquivo `.env`
4. Verifique se a senha do banco de dados está correta na `DATABASE_URL`

---

## Passo 8: Configurar Row Level Security (RLS)

O script SQL já configurou políticas básicas de RLS, mas você pode precisar ajustá-las de acordo com suas necessidades específicas de segurança.

### 8.1. Entender as Políticas Atuais

As políticas configuradas pelo script são:

| Tabela | Leitura (SELECT) | Escrita (INSERT/UPDATE/DELETE) |
|--------|------------------|-------------------------------|
| **users** | Público | Apenas o próprio usuário |
| **categories** | Público | Apenas admins |
| **courses** | Público (apenas ativos) | Apenas admins |
| **testimonials** | Público (apenas ativos) | Apenas admins |
| **settings** | Público | Apenas admins |
| **favorites** | Apenas próprio usuário | Apenas próprio usuário |

### 8.2. Verificar Políticas no Dashboard

1. No Supabase, vá para **"Authentication"** > **"Policies"**
2. Selecione cada tabela para ver as políticas aplicadas
3. Você pode editar, desabilitar ou criar novas políticas conforme necessário

### 8.3. Criar Primeiro Usuário Admin

Para acessar o painel administrativo, você precisa ter um usuário com role `admin`. Como o RLS está ativo, você precisará criar esse usuário manualmente:

1. No Supabase, vá para **"SQL Editor"**
2. Execute a seguinte query (substitua os valores):

```sql
INSERT INTO users ("openId", name, email, role, "loginMethod")
VALUES (
  'seu-open-id-aqui',  -- ID único do usuário (pode ser qualquer string única)
  'Administrador IMEP',
  'admin@imep.edu.br',
  'admin',
  'email'
);
```

3. Anote o `openId` que você usou - você precisará dele para fazer login

### 8.4. Desabilitar RLS Temporariamente (Desenvolvimento)

Se você estiver em ambiente de desenvolvimento e quiser desabilitar temporariamente o RLS para testes:

```sql
-- Desabilitar RLS em todas as tabelas
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
```

**ATENÇÃO**: Nunca desabilite RLS em produção! Isso expõe todos os dados sem controle de acesso.

---

## Passo 9: Configurar Autenticação (Opcional)

O Supabase oferece um sistema de autenticação completo que pode substituir o sistema atual de OAuth do Manus. Se você quiser usar a autenticação nativa do Supabase:

### 9.1. Habilitar Provedores de Autenticação

1. No dashboard do Supabase, vá para **"Authentication"** > **"Providers"**
2. Habilite os provedores que deseja usar:
   - **Email**: Autenticação por e-mail e senha
   - **Google**: Login com conta Google
   - **GitHub**: Login com conta GitHub
   - Outros provedores disponíveis

### 9.2. Configurar Email Templates

1. Vá para **"Authentication"** > **"Email Templates"**
2. Personalize os templates de:
   - Confirmação de e-mail
   - Redefinição de senha
   - Convite de usuário
   - Mudança de e-mail

### 9.3. Atualizar o Código da Aplicação

Para usar a autenticação do Supabase, você precisará:

1. Instalar o cliente Supabase:
```bash
pnpm add @supabase/supabase-js
```

2. Criar um cliente Supabase no frontend:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

3. Implementar login/logout:
```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@exemplo.com',
  password: 'senha123'
});

// Logout
await supabase.auth.signOut();

// Verificar usuário atual
const { data: { user } } = await supabase.auth.getUser();
```

---

## Passo 10: Backup e Manutenção

Manter backups regulares do seu banco de dados é essencial para proteger os dados do IMEP Escola contra perda acidental ou falhas técnicas.

### 10.1. Backups Automáticos

O Supabase realiza backups automáticos diários do seu banco de dados. No plano gratuito:
- **Retenção**: 7 dias de backups
- **Frequência**: 1 backup por dia
- **Restauração**: Disponível através do dashboard

Para acessar os backups:
1. Vá para **"Database"** > **"Backups"**
2. Você verá a lista de backups disponíveis
3. Clique em **"Restore"** para restaurar um backup específico

### 10.2. Backup Manual

Para criar um backup manual do banco de dados:

**Método 1: Via Dashboard**
1. Vá para **"Database"** > **"Backups"**
2. Clique em **"Create backup"**
3. Aguarde a conclusão do processo

**Método 2: Via pg_dump (linha de comando)**
```bash
# Instale o PostgreSQL client se necessário
# Ubuntu/Debian:
sudo apt-get install postgresql-client

# Criar backup
pg_dump "postgresql://postgres:[SUA-SENHA]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres" > backup-imep-$(date +%Y%m%d).sql
```

### 10.3. Restaurar Backup

Para restaurar um backup:

**Via Dashboard:**
1. Vá para **"Database"** > **"Backups"**
2. Localize o backup desejado
3. Clique em **"Restore"**
4. Confirme a operação

**Via psql (linha de comando):**
```bash
psql "postgresql://postgres:[SUA-SENHA]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres" < backup-imep-20260122.sql
```

### 10.4. Monitoramento

O Supabase oferece ferramentas de monitoramento para acompanhar a saúde do banco de dados:

1. **Database Health**: Vá para **"Database"** > **"Health"**
   - Uso de CPU
   - Uso de memória
   - Conexões ativas
   - Tamanho do banco de dados

2. **Logs**: Vá para **"Logs"**
   - Queries lentas
   - Erros de conexão
   - Atividade de autenticação

3. **API Logs**: Vá para **"API"** > **"Logs"**
   - Requisições à API
   - Erros de API
   - Latência de requisições

---

## Solução de Problemas Comuns

### Problema 1: Erro de Conexão "Connection Refused"

**Sintoma**: A aplicação não consegue conectar ao banco de dados.

**Soluções**:
1. Verifique se a `DATABASE_URL` está correta no arquivo `.env`
2. Confirme que a senha está correta (sem espaços extras)
3. Verifique se o projeto Supabase está ativo (não pausado por inatividade)
4. Teste a conexão usando um cliente PostgreSQL:
   ```bash
   psql "postgresql://postgres:[SUA-SENHA]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"
   ```

### Problema 2: Erro "relation does not exist"

**Sintoma**: Erro indicando que uma tabela não existe.

**Soluções**:
1. Verifique se você executou o script SQL completo no Passo 3
2. Execute novamente o script `supabase-schema.sql`
3. Verifique se as migrações foram aplicadas:
   ```bash
   pnpm drizzle-kit migrate
   ```

### Problema 3: Políticas RLS Bloqueando Acesso

**Sintoma**: Queries retornam vazio mesmo com dados no banco.

**Soluções**:
1. Verifique se você está autenticado corretamente
2. Confirme que o usuário tem a role apropriada (admin para operações administrativas)
3. Temporariamente desabilite RLS para testar (apenas em desenvolvimento):
   ```sql
   ALTER TABLE nome_da_tabela DISABLE ROW LEVEL SECURITY;
   ```
4. Revise as políticas RLS no dashboard: **"Authentication"** > **"Policies"**

### Problema 4: Imagens Não Carregam

**Sintoma**: Imagens de cursos não aparecem no site.

**Soluções**:
1. Verifique se as credenciais AWS S3 estão corretas no `.env`
2. Confirme que o bucket S3 tem permissões públicas de leitura
3. Teste o upload de uma imagem pelo painel admin
4. Verifique os logs do servidor para erros de upload

### Problema 5: Erro "JWT Secret Not Found"

**Sintoma**: Erro de autenticação relacionado ao JWT.

**Soluções**:
1. Verifique se `JWT_SECRET` está definido no arquivo `.env`
2. Gere uma nova chave JWT segura (veja Passo 5.3)
3. Reinicie o servidor após adicionar a variável:
   ```bash
   pnpm dev
   ```

### Problema 6: Projeto Supabase Pausado

**Sintoma**: Mensagem de que o projeto está inativo.

**Soluções**:
1. Projetos gratuitos são pausados após 7 dias de inatividade
2. Acesse o dashboard do Supabase
3. Clique em **"Resume project"**
4. Aguarde alguns minutos para reativação
5. Considere fazer uma requisição semanal automática para manter o projeto ativo

---

## Recursos Adicionais

### Documentação Oficial

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **PostgreSQL Docs**: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)
- **Drizzle ORM**: [https://orm.drizzle.team/docs/overview](https://orm.drizzle.team/docs/overview)

### Ferramentas Úteis

- **Supabase Studio**: Interface web para gerenciar banco de dados (incluída no dashboard)
- **pgAdmin**: Cliente desktop para PostgreSQL [https://www.pgadmin.org/](https://www.pgadmin.org/)
- **DBeaver**: Cliente universal de banco de dados [https://dbeaver.io/](https://dbeaver.io/)
- **Postman**: Para testar APIs [https://www.postman.com/](https://www.postman.com/)

### Comunidade e Suporte

- **Discord do Supabase**: [https://discord.supabase.com/](https://discord.supabase.com/)
- **GitHub Issues**: [https://github.com/supabase/supabase/issues](https://github.com/supabase/supabase/issues)
- **Stack Overflow**: Tag `supabase` para perguntas técnicas

### Tutoriais em Vídeo

- **Supabase YouTube Channel**: [https://www.youtube.com/@Supabase](https://www.youtube.com/@Supabase)
- **Crash Course**: "Supabase in 100 Seconds" - Introdução rápida
- **Full Tutorial**: "Supabase Full Course" - Tutorial completo para iniciantes

---

## Próximos Passos

Após configurar o Supabase com sucesso, considere implementar:

1. **Autenticação Social**: Adicionar login com Google, Facebook ou GitHub
2. **Storage**: Migrar o armazenamento de imagens do S3 para Supabase Storage
3. **Realtime**: Implementar atualizações em tempo real para o painel admin
4. **Edge Functions**: Criar funções serverless para lógica de negócio complexa
5. **Webhooks**: Configurar notificações automáticas para eventos importantes
6. **Analytics**: Integrar ferramentas de análise para monitorar uso do site
7. **CDN**: Configurar CDN para melhorar performance global
8. **Testes**: Implementar testes automatizados para garantir qualidade

---

## Conclusão

Este guia cobriu todo o processo de configuração do Supabase para o projeto IMEP Escola, desde a criação da conta até a configuração de segurança avançada com Row Level Security. O Supabase oferece uma plataforma robusta e escalável que simplifica significativamente o gerenciamento de banco de dados, permitindo que você foque no desenvolvimento de funcionalidades para o site da escola.

Com o banco de dados configurado corretamente, o sistema IMEP Escola está pronto para gerenciar cursos, alunos, depoimentos e todas as funcionalidades administrativas necessárias para uma instituição de ensino profissional moderna.

Se você encontrar problemas não cobertos neste guia, consulte a seção de **Solução de Problemas Comuns** ou acesse os recursos da comunidade Supabase para obter ajuda adicional.

---

**Documento criado por**: Manus AI  
**Data**: 22 de Janeiro de 2026  
**Versão**: 1.0  
**Projeto**: IMEP - Instituto Magalhães de Educação Profissional
