# School Central - Sistema de Gerenciamento de Censo Escolar

Bem-vindo ao School Central, uma plataforma robusta e flexível para gerenciamento de censos escolares, construída com Next.js, Firebase e Shadcn/UI.

Este projeto foi desenvolvido para simplificar a coleta, o gerenciamento e a análise de dados de múltiplas unidades escolares, oferecendo um painel administrativo poderoso para gestores e um formulário dinâmico para as equipes de campo.

## Funcionalidades Principais

O sistema conta com um conjunto de funcionalidades pensadas para otimizar o processo do censo escolar:

*   **Dashboard Analítico:** Visualize métricas chave em tempo real, como o número de escolas cadastradas, salas de aula, status de preenchimento e gráficos interativos sobre recursos tecnológicos e modalidades de ensino.
*   **Editor de Formulário Dinâmico:** O administrador pode criar, editar e remover seções e campos do formulário do censo diretamente pela interface, sem precisar alterar o código. Suporta campos como texto, número, checkbox (Sim/Não), data e listas de opções.
*   **Gerenciamento de Usuários e Perfis:** Crie usuários e defina perfis de acesso (ex: "Equipe de TI", "Infraestrutura"). Associe cada perfil a seções específicas do formulário, garantindo que cada equipe preencha apenas os dados de sua responsabilidade.
*   **Gestão de Escolas via JSON:** Atualize a lista de escolas participantes de forma simples, colando um arquivo JSON no painel de configurações.
*   **Acompanhamento de Submissões:** Monitore o progresso do preenchimento do censo para cada escola. Um modal de status detalha quais seções já foram completadas e quais estão pendentes.
*   **Personalização da Página Inicial:** Altere o título, a descrição, o logo e os links de redes sociais da página inicial diretamente pelo painel do administrador.

## Tecnologias Utilizadas

A aplicação foi construída utilizando um stack moderno e escalável:

*   **Framework:** Next.js (com App Router)
*   **Linguagem:** TypeScript
*   **UI/Componentes:** React, Shadcn/UI, Tailwind CSS
*   **Gerenciamento de Formulários:** React Hook Form
*   **Validação de Esquemas:** Zod
*   **Gráficos e Visualização de Dados:** Recharts
*   **Gerenciamento de Estado:** React Context, Zustand e Immer
*   **Ícones:** Lucide React
*   **Armazenamento de Dados (Atual):** `localStorage` (para fins de prototipação e teste)

## Como Rodar o Projeto Localmente

Para executar a aplicação em seu ambiente de desenvolvimento, siga os passos abaixo:

1.  **Instalar as Dependências:**
    ```bash
    npm install
    ```

2.  **Executar o Servidor de Desenvolvimento:**
    ```bash
    npm run dev
    ```

3.  **Acessar a Aplicação:**
    Abra seu navegador e acesse `http://localhost:9002`.

O login de administrador padrão para o ambiente de teste é:
*   **Email:** `admin@escola.com`
*   **Senha:** `password`

## Hospedagem e Banco de Dados

Atualmente, a aplicação está configurada para usar o `localStorage` do navegador para armazenar todas as informações (configurações do formulário, lista de escolas, submissões, etc.). Isso é ideal para desenvolvimento e prototipação rápidos, pois não requer configuração de backend.

### Próximos Passos: Integrando com um Banco de Dados Real (Firestore)

Para um ambiente de produção, é essencial substituir o `localStorage` por um banco de dados seguro e escalável como o **Cloud Firestore**.

O código já possui a estrutura básica para a integração com o Firebase no arquivo `src/lib/firebase.ts`. Para ativar a integração, você precisará:

1.  **Criar um Projeto no Firebase:** Acesse o [console do Firebase](https://console.firebase.google.com/) e crie um novo projeto.
2.  **Ativar o Cloud Firestore:** No seu projeto Firebase, navegue até a seção Firestore Database e ative-o.
3.  **Configurar a Autenticação:** Ative os provedores de login desejados (ex: Email/Senha) na seção de Autenticação.
4.  **Obter as Credenciais:** Copie as credenciais do seu projeto Firebase (apiKey, authDomain, etc.) e cole-as no arquivo `src/lib/firebase.ts`, substituindo os valores de exemplo.
5.  **Ajustar o Código:** Substitua as chamadas que hoje usam `localStorage` por funções que leem e escrevem dados no Firestore. Será necessário ajustar os hooks e componentes que atualmente buscam dados de exemplo (mock data).
6.  **Habilitar Regras de Segurança:** Configure as regras de segurança do Firestore para garantir que apenas usuários autenticados e com as permissões corretas possam ler e escrever dados.
