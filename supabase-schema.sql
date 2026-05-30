-- =====================================================
-- SCHEMA SQL PARA SUPABASE - IMEP ESCOLA
-- =====================================================
-- Este arquivo contém todos os comandos SQL necessários
-- para criar o banco de dados completo do projeto IMEP
-- no Supabase (PostgreSQL).
-- =====================================================

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    "openId" VARCHAR(64) NOT NULL UNIQUE,
    name TEXT,
    email VARCHAR(320),
    "loginMethod" VARCHAR(64),
    role VARCHAR(20) DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'admin')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastSignedIn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Índice para busca rápida por openId
CREATE INDEX IF NOT EXISTS idx_users_openid ON users("openId");

-- Índice para busca por email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Trigger para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Tabela de Categorias de Cursos
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Índice para busca por slug
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Trigger para atualizar updatedAt
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Tabela de Cursos
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    "categoryId" INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    duration VARCHAR(100),
    modality VARCHAR(50) CHECK (modality IN ('presencial', 'ead', 'hibrido')),
    price DECIMAL(10, 2),
    image TEXT,
    featured BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Índices para busca e performance
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses("categoryId");
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(active) WHERE active = TRUE;

-- Trigger para atualizar updatedAt
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Tabela de Depoimentos
-- =====================================================
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    "studentName" VARCHAR(255) NOT NULL,
    course VARCHAR(255),
    content TEXT NOT NULL,
    photo TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    active BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Índice para busca por depoimentos ativos
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(active) WHERE active = TRUE;

-- Trigger para atualizar updatedAt
CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Tabela de Configurações do Site
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL UNIQUE,
    value TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Índice para busca rápida por chave
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Trigger para atualizar updatedAt
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Tabela de Favoritos
-- =====================================================
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "courseId" INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE("userId", "courseId")
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites("userId");
CREATE INDEX IF NOT EXISTS idx_favorites_course ON favorites("courseId");
CREATE INDEX IF NOT EXISTS idx_favorites_user_course ON favorites("userId", "courseId");

-- =====================================================
-- Inserir Configurações Padrão
-- =====================================================
INSERT INTO settings (key, value) VALUES
    ('site_name', 'IMEP - Instituto Magalhães de Educação Profissional'),
    ('site_description', 'Educação profissional de excelência em Marabá - PA'),
    ('contact_email', 'contato@imep.edu.br'),
    ('contact_phone', '(94) 99243-5333'),
    ('contact_address', 'Marabá - PA'),
    ('whatsapp_number', '5594992435333'),
    ('facebook_url', ''),
    ('instagram_url', ''),
    ('linkedin_url', '')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- Inserir Categorias Padrão
-- =====================================================
INSERT INTO categories (name, slug, description) VALUES
    ('Saúde', 'saude', 'Cursos técnicos na área da saúde'),
    ('Tecnologia', 'tecnologia', 'Cursos técnicos em tecnologia da informação'),
    ('Indústria', 'industria', 'Cursos técnicos para o setor industrial'),
    ('Gestão', 'gestao', 'Cursos técnicos em administração e gestão')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- Habilitar Row Level Security (RLS)
-- =====================================================
-- IMPORTANTE: O Supabase recomenda habilitar RLS para segurança

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Políticas de Acesso (RLS Policies)
-- =====================================================

-- Políticas para USERS
-- Qualquer um pode ler usuários (necessário para exibir nomes)
CREATE POLICY "Users são públicos para leitura"
    ON users FOR SELECT
    USING (true);

-- Apenas o próprio usuário pode atualizar seus dados
CREATE POLICY "Usuários podem atualizar seus próprios dados"
    ON users FOR UPDATE
    USING (auth.uid()::text = "openId");

-- Políticas para CATEGORIES
-- Qualquer um pode ler categorias
CREATE POLICY "Categorias são públicas"
    ON categories FOR SELECT
    USING (true);

-- Apenas admins podem modificar categorias (você precisará implementar a lógica de admin)
CREATE POLICY "Apenas admins podem modificar categorias"
    ON categories FOR ALL
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE "openId" = auth.uid()::text 
        AND role = 'admin'
    ));

-- Políticas para COURSES
-- Qualquer um pode ler cursos ativos
CREATE POLICY "Cursos ativos são públicos"
    ON courses FOR SELECT
    USING (active = true OR EXISTS (
        SELECT 1 FROM users 
        WHERE "openId" = auth.uid()::text 
        AND role = 'admin'
    ));

-- Apenas admins podem modificar cursos
CREATE POLICY "Apenas admins podem modificar cursos"
    ON courses FOR ALL
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE "openId" = auth.uid()::text 
        AND role = 'admin'
    ));

-- Políticas para TESTIMONIALS
-- Qualquer um pode ler depoimentos ativos
CREATE POLICY "Depoimentos ativos são públicos"
    ON testimonials FOR SELECT
    USING (active = true OR EXISTS (
        SELECT 1 FROM users 
        WHERE "openId" = auth.uid()::text 
        AND role = 'admin'
    ));

-- Apenas admins podem modificar depoimentos
CREATE POLICY "Apenas admins podem modificar depoimentos"
    ON testimonials FOR ALL
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE "openId" = auth.uid()::text 
        AND role = 'admin'
    ));

-- Políticas para SETTINGS
-- Qualquer um pode ler configurações
CREATE POLICY "Configurações são públicas"
    ON settings FOR SELECT
    USING (true);

-- Apenas admins podem modificar configurações
CREATE POLICY "Apenas admins podem modificar configurações"
    ON settings FOR ALL
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE "openId" = auth.uid()::text 
        AND role = 'admin'
    ));

-- Políticas para FAVORITES
-- Usuários podem ver apenas seus próprios favoritos
CREATE POLICY "Usuários podem ver seus favoritos"
    ON favorites FOR SELECT
    USING (auth.uid()::text = (
        SELECT "openId" FROM users WHERE id = "userId"
    ));

-- Usuários podem adicionar favoritos
CREATE POLICY "Usuários podem adicionar favoritos"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid()::text = (
        SELECT "openId" FROM users WHERE id = "userId"
    ));

-- Usuários podem remover seus favoritos
CREATE POLICY "Usuários podem remover favoritos"
    ON favorites FOR DELETE
    USING (auth.uid()::text = (
        SELECT "openId" FROM users WHERE id = "userId"
    ));

-- =====================================================
-- Views Úteis
-- =====================================================

-- View para cursos com nome da categoria
CREATE OR REPLACE VIEW courses_with_category AS
SELECT 
    c.id,
    c.title,
    c.slug,
    c.description,
    c."categoryId",
    cat.name AS "categoryName",
    c.duration,
    c.modality,
    c.price,
    c.image,
    c.featured,
    c.active,
    c."createdAt",
    c."updatedAt"
FROM courses c
LEFT JOIN categories cat ON c."categoryId" = cat.id;

-- View para estatísticas do dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM courses WHERE active = true) AS "totalCourses",
    (SELECT COUNT(*) FROM categories) AS "totalCategories",
    (SELECT COUNT(*) FROM users) AS "totalUsers",
    (SELECT COUNT(*) FROM testimonials WHERE active = true) AS "totalTestimonials",
    (SELECT COUNT(*) FROM favorites) AS "totalFavorites";

-- =====================================================
-- Funções Úteis
-- =====================================================

-- Função para gerar slug a partir de texto
CREATE OR REPLACE FUNCTION generate_slug(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
    slug TEXT;
BEGIN
    slug := lower(text_input);
    slug := regexp_replace(slug, '[áàâãäå]', 'a', 'g');
    slug := regexp_replace(slug, '[éèêë]', 'e', 'g');
    slug := regexp_replace(slug, '[íìîï]', 'i', 'g');
    slug := regexp_replace(slug, '[óòôõö]', 'o', 'g');
    slug := regexp_replace(slug, '[úùûü]', 'u', 'g');
    slug := regexp_replace(slug, '[ç]', 'c', 'g');
    slug := regexp_replace(slug, '[^a-z0-9]+', '-', 'g');
    slug := regexp_replace(slug, '^-+|-+$', '', 'g');
    RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- para criar todas as tabelas e configurações necessárias.
-- =====================================================
