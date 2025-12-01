# EmpowerUp

EmpowerUp é uma plataforma web composta por um frontend moderno em JavaScript (React + Vite, estilizado com Tailwind CSS e usando componentes acessíveis do Radix UI) e um backend em PHP (ou outra implementação em servidor, dependendo do que estiver presente na pasta `backend` do repositório). O frontend utiliza Axios para comunicação com APIs e inclui uma suíte de testes baseada em Vitest e Testing Library.



Sumário
- Funcionalidades
- Tecnologias
- Requisitos
- Instalação (frontend)
- Executando em desenvolvimento
- Build para produção
- Backend (PHP) — instruções gerais
- Variáveis de ambiente sugeridas
- Como testar
  - Testes unitários e de componentes
  - Testes de integração / E2E
  - Testes manuais (fluxos principais)
- Depuração comum
- Contribuindo
- Licença

Funcionalidades (visão geral)
- Interface SPA construída com React e Vite, carregamento rápido para desenvolvimento e produção.
- Componentes acessíveis utilizando Radix UI e ícones via Lucide.
- Estilização com Tailwind CSS e PostCSS.
- Consumo de APIs via Axios (padrão para comunicação com backend).
- Suíte de testes configurada com Vitest e Testing Library para testes de unidade e de componentes.
- Scripts de build e preview via Vite.

Observação: os nomes de páginas/fluxos exatos (ex.: autenticação, dashboard, cursos, pagamentos) dependem do código presente no repositório. Este README descreve a base técnica e como testar a plataforma; adicione seções específicas de funcionalidades conforme o código (por exemplo: "Cadastro de usuário", "Painel do administrador", "Gerenciamento de conteúdo", etc.).

Tecnologias
- Frontend
  - React
  - Vite
  - Tailwind CSS
  - Radix UI
  - Axios
  - Lucide (ícones)
  - Vitest + @testing-library/react / jest-dom / user-event
- Backend (observado linguagem PHP no repositório; pode ser Laravel ou outro framework)
  - PHP (versão conforme seu ambiente)
  - Composer (se usar dependências PHP)
- Ferramentas de build/test:
  - Node.js / npm (ou Yarn)
  - Vitest para testes JS

Requisitos
- Node.js (recomendado 16+ ou conforme .nvmrc, se existir)
- npm (ou yarn)
- PHP (se for necessário rodar o backend localmente)
- Composer (se o backend PHP usar dependências)
- Opcional: Docker, XAMPP, Laragon (para isolar ambiente PHP)

Instalação — Frontend
1. Clone o repositório:
   git clone https://github.com/murilobezs/empowerup.git
   cd empowerup

2. Instale dependências do frontend:
   npm install
   (ou yarn install)

Executando em desenvolvimento — Frontend
- Rodar o servidor de desenvolvimento (Vite):
  npm run dev
  - A aplicação normalmente ficará disponível em http://localhost:5173 (ou endereço indicado pelo Vite).
- Outros scripts úteis (conforme package.json):
  - npm run build   -> gera a build de produção
  - npm run preview -> serve a build de produção localmente
  - npm run test    -> executa testes com Vitest (se configurado)

Backend (PHP) — instruções gerais
Como há código PHP no repositório, aqui estão instruções genéricas para preparar um backend PHP. Ajuste conforme o framework real:

1. Vá até a pasta do backend (se existir, por exemplo `backend/`):
   cd backend

2. Instale dependências PHP (se tiver composer.json):
   composer install

3. Configurar variáveis de ambiente
   - Crie um arquivo `.env` baseado em `.env.example` (se houver).
   - Defina as credenciais de banco, URL do frontend, chaves, etc.

4. Rodar servidor PHP (opção simples, sem framework):
   php -S localhost:8000 -t public
   - Se for Laravel: php artisan serve

5. Endpoints de API estarão disponíveis em:
   http://localhost:8000 (ou porta configurada)

Observação: se não houver um backend PHP completo no repo, você pode apontar o frontend para uma API mock (json-server, Mockoon) ou criar uma pequena API em Node/Express para desenvolvimento.

Variáveis de ambiente sugeridas
- VITE_API_URL=http://localhost:8000/api
- VITE_APP_ENV=development
- (No backend PHP, usar DB_HOST, DB_USER, DB_PASS, DB_NAME, APP_KEY, etc.)

Como testar

1) Testes unitários / componentes (frontend)
- Executar a suíte de testes:
  npm run test
- O projeto possui dependências de @testing-library/react, jest-dom e user-event, então teste componentes interativos, formulários, validações e chamadas a API (mockando Axios).
- Exemplos rápidos:
  - Teste de renderização de componente: renderiza o componente e verifica textos/elementos.
  - Teste de interação: simula clique/typing com user-event e verifica mudanças no DOM.

2) Testes de integração / E2E
- Se houver uma suíte E2E (Cypress, Playwright), instale e rode o runner:
  - cypress open / npx playwright test
- Se não houver, você pode:
  - Subir backend local (php) e frontend (vite).
  - Usar Playwright ou Cypress para scriptar fluxos: login, criação/edição de recurso, logout.

3) Testes manuais (fluxos recomendados)
- Fluxo de inicialização:
  - npm run dev
  - Iniciar backend (php) em http://localhost:8000
- Testar autenticação:
  - Registrar novo usuário (se existir)
  - Fazer login e verificar redirecionamento para dashboard
- Testar consumo de API:
  - Verificar que as chamadas Axios retornem dados esperados (inspecione no DevTools -> Network).
- Testar formulários e validações:
  - Submeter formulários com dados válidos e inválidos e conferir mensagens de erro/sucesso.
- Testar responsividade:
  - Abrir em modos mobile/desktop e checar layout e navegabilidade.

4) Testes de API via cURL / Postman
- Exemplo: verificar health check (ajuste rota conforme backend):
  curl -i $VITE_API_URL/health
- Testar endpoints CRUD:
  - GET /resources
  - POST /resources (com JSON)
  - PUT /resources/:id
  - DELETE /resources/:id

Depuração comum
- Erro de CORS: habilitar CORS no backend (especialmente durante dev). Para PHP, habilite cabeçalhos Access-Control-Allow-Origin.
- Problemas de variáveis ambiente: conferir .env e reiniciar servidores.
- Erros de build: verifique versão do Node e dependências instaladas.

Boas práticas para desenvolvimento
- Rode os testes localmente antes de abrir PRs.
- Mantenha commit e mensagens claras.
- Se modificar APIs, documente endpoints e eventuais mudanças em uma seção API.md.
- Para alterações grandes no backend PHP, descreva passos de migração (se houver banco).

Contribuindo
- Abra issues para bugs e novas funcionalidades.
- Crie branches com nomes descritivos: feature/descricao, fix/descricao.
- Inclua testes para novas funcionalidades e correções.
- Faça PRs com descrição clara e checklist de verificação.

Licença
- Adicione a licença do projeto (ex.: MIT) no arquivo LICENSE.

Observações finais
- Se você me fornecer informação sobre qual framework PHP está sendo usado (por exemplo Laravel, Slim, Symfony ou apenas scripts PHP), eu atualizo este README para incluir comandos concretos (php artisan migrate, composer scripts, seeds, exemplos de .env específicos).
- Também posso gerar exemplos de testes (Vitest + Testing Library) específicos para componentes existentes, se você me indicar os caminhos dos arquivos de componentes.
