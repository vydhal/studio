School Central - Sistema de Gerenciamento de Censo Escolar

Bem-vindo ao School Central, uma plataforma robusta e flexível para gerenciamento de censos escolares, construída com Next.js e Firebase.

Este projeto foi desenvolvido para simplificar a coleta, o gerenciamento e a análise de dados de múltiplas unidades escolares, oferecendo um painel administrativo poderoso para gestores e um formulário dinâmico para as equipes de campo.

## Funcionalidades Principais

O sistema conta com um conjunto de funcionalidades pensadas para otimizar o processo do censo escolar:

*   **Dashboard Analítico:** Visualize métricas chave em tempo real, como o número de escolas cadastradas, salas de aula, status de preenchimento e gráficos interativos sobre recursos tecnológicos e modalidades de ensino.
*   **Editor de Formulário Dinâmico:** O administrador pode criar, editar e remover seções e campos do formulário do censo diretamente pela interface, sem precisar alterar o código. Suporta campos como texto, número, checkbox (Sim/Não) e data.
*   **Gerenciamento de Usuários e Perfis:** Crie usuários e defina perfis de acesso (ex: "Equipe de TI", "Infraestrutura"). Associe cada perfil a seções específicas do formulário, garantindo que cada equipe preencha apenas os dados de sua responsabilidade.
*   **Gestão de Escolas via JSON:** Atualize a lista de escolas participantes de forma simples, colando um arquivo JSON no painel de configurações. O sistema usa o INEP como identificador único.
*   **Acompanhamento de Submissões:** Monitore o progresso do preenchimento do censo para cada escola com uma barra de progresso visual e um modal de status detalhado.
*   **Personalização da Página Inicial:** Altere o título, a descrição, o logo e os links de redes sociais da página inicial diretamente pelo painel do administrador.

## Tecnologias Utilizadas

A aplicação foi construída utilizando um stack moderno e escalável:

*   **Framework:** Next.js (com App Router)
*   **Linguagem:** TypeScript
*   **Banco de Dados:** Cloud Firestore (para dados da aplicação)
*   **Autenticação:** Firebase Authentication (para gerenciamento de usuários)
*   **UI/Componentes:** React, Shadcn/UI, Tailwind CSS
*   **Gerenciamento de Formulários:** React Hook Form
*   **Validação de Esquemas:** Zod
*   **Gráficos e Visualização de Dados:** Recharts
*   **Gerenciamento de Estado:** React Context API
*   **Ícones:** Lucide React

## Schema do Banco de Dados (PostgreSQL)

Abaixo está a estrutura de tabelas sugerida para uma implementação com um banco de dados relacional como o PostgreSQL, baseada nos dados utilizados na aplicação.

```sql
-- Tabela para armazenar as escolas
CREATE TABLE schools (
    inep VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    "number" VARCHAR(50),
    neighborhood VARCHAR(100)
);

-- Tabela para perfis de acesso (roles)
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    permissions TEXT[] -- Array de strings com as permissões (ex: ['users', 'general', 'infrastructure'])
);

-- Tabela para usuários
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY, -- Firebase Auth UID
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role_id VARCHAR(50) REFERENCES roles(id) ON DELETE SET NULL
);

-- Tabela principal para as submissões do censo
CREATE TABLE submissions (
    school_inep VARCHAR(20) PRIMARY KEY REFERENCES schools(inep) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_by VARCHAR(255) REFERENCES users(id),
    status_general VARCHAR(20) DEFAULT 'pending',
    status_infrastructure VARCHAR(20) DEFAULT 'pending',
    status_technology VARCHAR(20) DEFAULT 'pending',
    status_cultural VARCHAR(20) DEFAULT 'pending',
    status_maintenance VARCHAR(20) DEFAULT 'pending',
    dynamic_data JSONB -- Armazena dados de seções dinâmicas
);

-- Tabela para as salas de aula de cada submissão
CREATE TABLE classrooms (
    id SERIAL PRIMARY KEY,
    submission_school_inep VARCHAR(20) REFERENCES submissions(school_inep) ON DELETE CASCADE,
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

-- Tabela para configurações da aplicação (armazenamento chave-valor)
CREATE TABLE settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB
);

-- Exemplo de inserção para as configurações da página inicial
-- INSERT INTO settings (key, value) VALUES ('homePage', '{"appName": "School Central", ...}');

-- Exemplo de inserção para as configurações do formulário
-- INSERT INTO settings (key, value) VALUES ('formConfig', '{"sections": [...]}');
```

## Como Rodar o Projeto Localmente

Para executar a aplicação em seu ambiente de desenvolvimento, siga os passos abaixo:

1.  **Configurar o Firebase:**
    *   Crie um projeto no [console do Firebase](https://console.firebase.google.com/).
    *   Ative os serviços **Authentication** (com o provedor "Email/Senha") e **Cloud Firestore**.
    *   Nas configurações do seu projeto, crie um aplicativo da Web e copie as credenciais do Firebase SDK.
    *   Renomeie o arquivo `.env.example` para `.env.local` na raiz do projeto e cole suas credenciais lá.

2.  **Instalar as Dependências:**
    ```bash
    npm install
    ```

3.  **Executar o Servidor de Desenvolvimento:**
    ```bash
    npm run dev
    ```

4.  **Acessar a Aplicação:**
    Abra seu navegador e acesse `http://localhost:9002`.

O login de administrador padrão para o ambiente de teste (criado automaticamente no primeiro login) é:
*   **Email:** `admin@escola.com`
*   **Senha:** `password`
