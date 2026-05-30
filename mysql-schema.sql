-- =====================================================
-- SCHEMA SQL PARA MYSQL - IMEP ESCOLA
-- =====================================================
-- Este arquivo contém todos os comandos SQL necessários
-- para criar o banco de dados completo do projeto IMEP
-- no MySQL (compatível com phpMyAdmin).
-- =====================================================

-- Criar banco de dados (se não existir)
CREATE DATABASE IF NOT EXISTS imep_escola CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar o banco de dados
USE imep_escola;

-- =====================================================
-- Tabela de Usuários
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    openId VARCHAR(64) NOT NULL UNIQUE,
    name TEXT,
    email VARCHAR(320),
    loginMethod VARCHAR(64),
    role VARCHAR(20) DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'admin')),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    INDEX idx_users_openid (openId),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela de Categorias de Cursos
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    INDEX idx_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela de Cursos
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    categoryId INT,
    duration VARCHAR(100),
    modality VARCHAR(50) CHECK (modality IN ('presencial', 'ead', 'hibrido')),
    price DECIMAL(10, 2),
    image TEXT,
    featured BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    INDEX idx_courses_slug (slug),
    INDEX idx_courses_category (categoryId),
    INDEX idx_courses_featured (featured),
    INDEX idx_courses_active (active),
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela de Depoimentos
-- =====================================================
CREATE TABLE IF NOT EXISTS testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentName VARCHAR(255) NOT NULL,
    course VARCHAR(255),
    content TEXT NOT NULL,
    photo TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    INDEX idx_testimonials_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela de Configurações do Site
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(255) NOT NULL UNIQUE,
    value TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    INDEX idx_settings_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela de Favoritos
-- =====================================================
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    courseId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE KEY unique_user_course (userId, courseId),
    INDEX idx_favorites_user (userId),
    INDEX idx_favorites_course (courseId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Inserir Configurações Padrão
-- =====================================================
INSERT INTO settings (`key`, value) VALUES
    ('site_name', 'IMEP - Instituto Magalhães de Educação Profissional'),
    ('site_description', 'Educação profissional de excelência em Marabá - PA'),
    ('contact_email', 'magalhaeseducacao.aedu@gmail.com'),
    ('contact_phone', '(94) 99243-5333'),
    ('contact_address', 'Marabá - PA'),
    ('whatsapp_number', '5594992435333'),
    ('facebook_url', ''),
    ('instagram_url', ''),
    ('linkedin_url', '')
ON DUPLICATE KEY UPDATE `key` = `key`;

-- =====================================================
-- Inserir Categorias Padrão
-- =====================================================
INSERT INTO categories (name, slug, description) VALUES
    ('Saúde', 'saude', 'Cursos técnicos na área da saúde'),
    ('Tecnologia', 'tecnologia', 'Cursos técnicos em tecnologia da informação'),
    ('Indústria', 'industria', 'Cursos técnicos para o setor industrial'),
    ('Gestão', 'gestao', 'Cursos técnicos em administração e gestão')
ON DUPLICATE KEY UPDATE name = name;

-- =====================================================
-- Inserir Cursos de Exemplo (Opcional)
-- =====================================================
INSERT INTO courses (title, slug, description, categoryId, duration, modality, price, featured, active) VALUES
    (
        'Técnico em Enfermagem',
        'tecnico-em-enfermagem',
        'Curso técnico completo para formação de profissionais de enfermagem, com aulas práticas em laboratórios equipados e estágio supervisionado.',
        (SELECT id FROM categories WHERE slug = 'saude' LIMIT 1),
        '24 meses',
        'presencial',
        349.00,
        TRUE,
        TRUE
    ),
    (
        'Técnico em Segurança do Trabalho',
        'tecnico-em-seguranca-do-trabalho',
        'Formação completa em segurança do trabalho, preparando profissionais para atuar na prevenção de acidentes e promoção da saúde ocupacional.',
        (SELECT id FROM categories WHERE slug = 'industria' LIMIT 1),
        '18 meses',
        'hibrido',
        289.00,
        TRUE,
        TRUE
    ),
    (
        'Técnico em Desenvolvimento de Sistemas',
        'tecnico-em-desenvolvimento-de-sistemas',
        'Aprenda a desenvolver sistemas web e mobile, programação, banco de dados e lógica de programação com as tecnologias mais modernas do mercado.',
        (SELECT id FROM categories WHERE slug = 'tecnologia' LIMIT 1),
        '18 meses',
        'ead',
        249.00,
        TRUE,
        TRUE
    ),
    (
        'Técnico em Administração',
        'tecnico-em-administracao',
        'Curso completo de gestão empresarial, finanças, recursos humanos e empreendedorismo para formar profissionais completos em administração.',
        (SELECT id FROM categories WHERE slug = 'gestao' LIMIT 1),
        '18 meses',
        'presencial',
        279.00,
        FALSE,
        TRUE
    )
ON DUPLICATE KEY UPDATE title = title;

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
    c.categoryId,
    cat.name AS categoryName,
    c.duration,
    c.modality,
    c.price,
    c.image,
    c.featured,
    c.active,
    c.createdAt,
    c.updatedAt
FROM courses c
LEFT JOIN categories cat ON c.categoryId = cat.id;

-- View para estatísticas do dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM courses WHERE active = 1) AS totalCourses,
    (SELECT COUNT(*) FROM categories) AS totalCategories,
    (SELECT COUNT(*) FROM users) AS totalUsers,
    (SELECT COUNT(*) FROM testimonials WHERE active = 1) AS totalTestimonials,
    (SELECT COUNT(*) FROM favorites) AS totalFavorites;

-- =====================================================
-- Criar Usuário Administrador Padrão
-- =====================================================
-- IMPORTANTE: Altere o openId para o ID do seu usuário OAuth
INSERT INTO users (openId, name, email, role, loginMethod) VALUES
    ('admin-default-id', 'Administrador IMEP', 'magalhaeseducacao.aedu@gmail.com', 'admin', 'oauth')
ON DUPLICATE KEY UPDATE name = name;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- Execute este script no phpMyAdmin ou MySQL CLI
-- para criar todas as tabelas e configurações necessárias.
-- =====================================================

-- =====================================================
-- COMANDOS ÚTEIS PARA VERIFICAÇÃO
-- =====================================================

-- Listar todas as tabelas criadas
-- SHOW TABLES;

-- Ver estrutura de uma tabela específica
-- DESCRIBE users;
-- DESCRIBE courses;

-- Verificar dados inseridos
-- SELECT * FROM categories;
-- SELECT * FROM settings;
-- SELECT * FROM courses;

-- Verificar relacionamentos (Foreign Keys)
-- SELECT 
--     TABLE_NAME,
--     COLUMN_NAME,
--     CONSTRAINT_NAME,
--     REFERENCED_TABLE_NAME,
--     REFERENCED_COLUMN_NAME
-- FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
-- WHERE TABLE_SCHEMA = 'imep_escola'
-- AND REFERENCED_TABLE_NAME IS NOT NULL;
