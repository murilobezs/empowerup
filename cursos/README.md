# EmpowerUp Academy (Cursos)

Frontend dedicado às trilhas de cursos da EmpowerUp, rodando como subaplicação Vite e compartilhando a mesma API e autenticação da plataforma principal.

## Pré-requisitos

- Node.js 18+
- PNPM, NPM ou Yarn instalados

## Instalação

```bash
npm install
```

> Se preferir PNPM ou Yarn, ajuste o comando conforme o gerenciador escolhido.

## Desenvolvimento

```bash
npm run dev
```

A aplicação é servida em `http://localhost:5173` por padrão.

## Configuração de ambiente

- Copie `.env.example` para `.env` e ajuste as URLs conforme seu ambiente (produção, staging ou local).
- O arquivo `.htaccess` incluso replica as regras da plataforma principal para deploy em hospedagens Apache. Ajuste a diretiva `RewriteBase` caso publique dentro de um subdiretório (ex.: `/cursos/`).

## Build de produção

```bash
npm run build
```

Os artefatos gerados ficam em `cursos/dist` prontos para deploy como subdomínio ou subdiretório.

## Integração com a plataforma principal

- Autenticação: reutiliza o token salvo pelo app principal (`empowerup_user`). Caso a usuária não esteja autenticada, ela é redirecionada ao fluxo de login oficial.
- Configurações: todas as chamadas de API usam os mesmos arquivos de configuração (`src/config/config.js`) via alias `@shared`.
- Estilo: compartilhamos a paleta, tipografia e componentes construtivos da aplicação principal para manter consistência visual.

## Migrações e API

A API já conta com os endpoints de cursos. O template de e-mails e a migração `020_seed_intro_course.php` adicionam o curso "Introdução ao Empreendedorismo Feminino" com placeholders de vídeo para preenchimento posterior.
