-- Tabela para armazenar as escolas
-- O INEP é usado como chave primária por ser um identificador único nacional.
CREATE TABLE schools (
    inep VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    "number" VARCHAR(50), -- Usar aspas para evitar conflito com a palavra reservada "number"
    neighborhood VARCHAR(100)
);

-- Tabela para perfis de acesso (roles)
-- Define os diferentes níveis de permissão no sistema.
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY, -- Um ID único, ex: 'admin', 'infra_team'
    name VARCHAR(100) NOT NULL UNIQUE,
    -- Array de strings para armazenar as permissões de forma flexível.
    -- Ex: ['users', 'general', 'infrastructure']
    permissions TEXT[]
);

-- Tabela para usuários da aplicação
-- Vinculada ao Firebase Authentication pelo ID (UID).
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY, -- Corresponde ao Firebase Auth UID
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role_id VARCHAR(50) REFERENCES roles(id) ON DELETE SET NULL -- Se um perfil for deletado, o usuário fica sem perfil.
);

-- Tabela principal para as submissões do censo
-- Cada escola (identificada pelo INEP) tem uma única submissão que é atualizada.
CREATE TABLE submissions (
    school_inep VARCHAR(20) PRIMARY KEY REFERENCES schools(inep) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_by VARCHAR(255) REFERENCES users(id),
    -- Colunas de status para um acesso rápido e para a barra de progresso.
    status_general VARCHAR(20) DEFAULT 'pending' CHECK (status_general IN ('pending', 'completed')),
    status_infrastructure VARCHAR(20) DEFAULT 'pending' CHECK (status_infrastructure IN ('pending', 'completed')),
    status_technology VARCHAR(20) DEFAULT 'pending' CHECK (status_technology IN ('pending', 'completed')),
    status_cultural VARCHAR(20) DEFAULT 'pending' CHECK (status_cultural IN ('pending', 'completed')),
    status_maintenance VARCHAR(20) DEFAULT 'pending' CHECK (status_maintenance IN ('pending', 'completed')),
    -- Campo JSONB para armazenar todos os dados das seções dinâmicas do formulário.
    -- É flexível e ideal para campos que podem mudar.
    dynamic_data JSONB
);

-- Tabela para as salas de aula de cada submissão
-- Relacionada à submissão pelo INEP da escola.
CREATE TABLE classrooms (
    id SERIAL PRIMARY KEY,
    submission_school_inep VARCHAR(20) NOT NULL REFERENCES submissions(school_inep) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    student_capacity INT,
    outlets INT,
    tv_count INT,
    chair_count INT,
    fan_count INT,
    has_internet BOOLEAN,
    has_air_conditioning BOOLEAN,
    grade_morning VARCHAR(100),
    grade_afternoon VARCHAR(100),
    grade_projection_2025_morning VARCHAR(100),
    grade_projection_2025_afternoon VARCHAR(100),
    grade_projection_2026_morning VARCHAR(100),
    grade_projection_2026_afternoon VARCHAR(100)
);

-- Tabela para configurações gerais da aplicação (formato chave-valor)
-- Armazena configurações como as da página inicial e a estrutura do formulário dinâmico.
CREATE TABLE settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL
);

-- Exemplos de como as configurações seriam inseridas:
-- INSERT INTO settings (key, value) VALUES ('homePage', '{"appName": "School Central", "title": "Bem-vindo", ...}');
-- INSERT INTO settings (key, value) VALUES ('formConfig', '{"sections": [{"id": "general", "name": "Dados Gerais", ...}]}');
