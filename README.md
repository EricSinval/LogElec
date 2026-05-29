# LogElec

Sistema web acadêmico para intermediar a relação entre empresas que precisam descartar resíduos eletroeletrônicos e empresas especializadas em coleta e logística reversa.
## Status do projeto

O projeto está na fase final de entrega acadêmica, com os principais fluxos integrados:
- frontend estático funcional
- backend Spring Boot com autenticação por sessão
- banco MySQL com seed de demonstração
- painel administrativo para moderação e gestão
- testes automatizados de backend e E2E
- documentação de execução local e publicação em produção
## Objetivo da aplicação

O LogElec conecta empresas do tipo `DESCARTE`, que precisam disponibilizar resíduos para retirada, com empresas do tipo `COLETA`, que prestam o serviço de coleta. O sistema cobre o fluxo de cadastro, autenticação, publicação de postagens, moderação administrativa, negociação de agendamentos, troca de mensagens e acompanhamento operacional.
## Funcionalidades principais

- cadastro de empresas com perfil `DESCARTE` ou `COLETA`
- login, logout e recuperação de senha por e-mail + CNPJ
- edição de perfil e exclusão de conta com validações de integridade
- criação, edição, busca e filtragem de postagens
- moderação administrativa de publicações
- agendamentos entre empresas interessadas
- troca de mensagens vinculada ao fluxo de agendamento
- painel administrativo com visão geral, gestão de empresas, publicações e agendamentos
## Regras de negócio relevantes

- postagens novas passam por moderação antes de entrarem na vitrine
- o chat entre empresas só é liberado após um agendamento confirmado
- os status canônicos de postagem são `ABERTA`, `PAUSADA`, `ENCERRADA` e `CANCELADA`
- o frontend foi ajustado para consumir a API por rotas relativas `/api`, o que simplifica o uso com proxy reverso no mesmo domínio
- em produção, o backend roda com perfil `prod`, cookies seguros e configuração de CORS por variável de ambiente
## Arquitetura atual

| Camada | Tecnologia | Observação |
| --- | --- | --- |
| Frontend | HTML5, CSS3 e JavaScript puro | páginas estáticas servidas por Nginx |
| Backend | Java 21 + Spring Boot 4.0.0 | API REST com autenticação por sessão |
| Persistência | Spring Data JPA + MySQL 8 | schema atualizado via `ddl-auto=update` |
| Segurança | Spring Security + BCrypt | bootstrap administrativo configurável |
| Testes backend | Maven Wrapper | unitários com Surefire, integração com Failsafe |
| Testes E2E | Playwright | fluxos executados contra o stack local |
| Infra local | Docker Compose | serviços `db`, `backend` e `frontend` |
| Infra de produção | Docker Compose + Caddy | fluxo recomendado para AWS Lightsail |
## Estrutura principal do repositório

```text
LogElec/
├── backend/
│   └── LogElec/
│       ├── src/main/java/com/ads/LogElec/
│       │   ├── config/
│       │   ├── controller/
│       │   ├── dto/
│       │   ├── entity/
│       │   ├── repository/
│       │   ├── security/
│       │   └── service/
│       ├── src/main/resources/
│       ├── src/test/java/com/ads/LogElec/
│       ├── mvnw
│       ├── mvnw.cmd
│       └── pom.xml
├── database/
│   └── seed.sql
├── docs/
│   ├── aws-lightsail-deploy.md
│   └── Caddyfile.lightsail.example
├── e2e/
│   ├── global-setup.cjs
│   ├── prepare-environment.cjs
│   └── tests/
├── frontend/
│   ├── img/
│   ├── index/
│   ├── nginx/
│   ├── script/
│   └── style_css/
├── scripts/
│   └── run-backend-maven.cjs
├── docs/demo-assets/
│   └── logos-empresas/
├── docker-compose.yml
├── docker-compose.prod.yml
├── DOCKER.md
├── package.json
├── playwright.config.js
└── README.md
```

## Pré-requisitos

### Fluxo local recomendado

- Docker Desktop instalado
- WSL2 habilitado no Windows
- PowerShell aberto na raiz do projeto

### Fluxos opcionais

- Java 21, caso queira rodar o backend fora do Docker
- Node.js + npm, para usar os scripts da raiz e a suíte Playwright
- Python 3 ou outro servidor estático, caso queira servir o frontend sem Nginx

## Execução local recomendada com Docker

### 1. Criar o arquivo de ambiente

Na raiz do projeto:

```powershell
Copy-Item .env.example .env
```

Portas padrão do ambiente local:

- MySQL: `3307`
- backend: `8080`
- frontend: `8081`

### 2. Subir os serviços

```powershell
docker compose up --build -d
```

### 3. Importar a base compartilhada

Use o fluxo abaixo para evitar problemas de redirecionamento no PowerShell:

```powershell
docker cp .\database\seed.sql logelec-db:/tmp/seed.sql
docker exec logelec-db sh -c "mysql -uroot -p74123LogElec logelec < /tmp/seed.sql"
docker compose restart backend
```

Esse passo é importante porque:

- o `seed.sql` recria tabelas e dados de demonstração
- o restart do backend reaplica o bootstrap administrativo e normalizações necessárias
- esse fluxo evita quebra com `<` e `>` diretamente no PowerShell

### 4. Validar os acessos locais

- home: `http://localhost:8081/index/home.html`
- login: `http://localhost:8081/index/login.html`
- backend: `http://localhost:8080`
- MySQL: `localhost:3307`

Para a rotina diária com containers, consulte também [DOCKER.md](DOCKER.md).

## Conta administrativa e dados de demonstração

### Conta administrativa local

No ambiente local padrão, a conta administrativa é criada automaticamente pelo backend:

- e-mail: `admin@logelec.com`
- senha: `Admin123`

Em produção, esses valores devem ser sobrescritos com `APP_ADMIN_EMAIL` e `APP_ADMIN_PASSWORD`.

### Empresas do seed

O seed foi preparado para navegação, demonstração e teste manual. Como as senhas das empresas podem variar conforme a base foi recriada ao longo do projeto, o caminho mais seguro para acessar uma conta do seed é usar a tela `Esqueci a senha` com e-mail + CNPJ.

Exemplos úteis:

- coleta: `biocolet@coleta.logelec.com` / CNPJ `12345678000195`
- descarte: `codebase@descarte.logelec.com` / CNPJ `12345678003534`

## Execução local sem Docker completo

Esse fluxo é útil quando você quer subir apenas o banco em container e rodar backend e frontend separadamente.

### Banco de dados

```powershell
docker compose up -d db
docker cp .\database\seed.sql logelec-db:/tmp/seed.sql
docker exec logelec-db sh -c "mysql -uroot -p74123LogElec logelec < /tmp/seed.sql"
```

### Backend

```powershell
cd backend/LogElec
.\mvnw.cmd spring-boot:run
```

### Frontend

Na raiz do projeto:

```powershell
python -m http.server 5500 --directory frontend
```

Depois acesse:

- `http://localhost:5500/index/home.html`
- `http://localhost:5500/index/login.html`

## Testes automatizados

O `package.json` da raiz existe para orquestrar testes. Ele não é um pipeline de build do frontend.

### Instalação das dependências de teste

```powershell
npm install
```

### Comandos disponíveis na raiz

| Comando | Finalidade |
| --- | --- |
| `npm run test:unit` | executa apenas os testes unitários do backend |
| `npm run test:backend` | executa `verify`, cobrindo testes unitários e de integração |
| `npm run test:e2e:install` | instala o navegador usado pelo Playwright |
| `npm run test:e2e` | roda a suíte E2E contra um ambiente já ativo |
| `npm run test:e2e:docker` | reinicia o ambiente local com seed e roda a suíte E2E |
| `npm run test:e2e:docker:headed` | mesmo fluxo anterior, mas com o navegador visível |
| `npm run test:all` | executa backend completo e E2E em sequência |

### Comandos diretos do backend

```powershell
cd backend/LogElec
.\mvnw.cmd test
.\mvnw.cmd verify
```

Observações importantes:

- `test` roda apenas os testes unitários configurados no Surefire
- `verify` roda os testes unitários e, em seguida, os testes de integração pelo Failsafe
- `npm run test:e2e:docker` usa `e2e/prepare-environment.cjs --reset-db`, reaplica `database/seed.sql` e executa a suíte Playwright
- a configuração E2E atual assume `frontend` em `http://localhost:8081`

## Produção

O projeto já possui suporte a produção com backend em perfil `prod`, frontend atrás de proxy reverso e configuração por variáveis de ambiente.

Arquivos principais desse fluxo:

- `.env.prod.example`
- `docker-compose.prod.yml`
- [docs/aws-lightsail-deploy.md](docs/aws-lightsail-deploy.md)
- [docs/Caddyfile.lightsail.example](docs/Caddyfile.lightsail.example)

### Resumo do fluxo recomendado

1. copiar `.env.prod.example` para `.env.prod`
2. ajustar credenciais do banco, domínio, CORS e conta administrativa
3. subir o stack com `docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up --build -d`
4. manter o frontend exposto apenas em `127.0.0.1:8081`
5. publicar `80/443` com Caddy no host, apontando o domínio real para o frontend

### Pontos importantes do ambiente de produção

- o frontend e a API devem permanecer no mesmo domínio
- o frontend usa proxy `/api`, evitando dependência de `localhost`
- o perfil `prod` desliga `debug`, reduz logs verbosos e exige variáveis críticas
- os cookies de sessão são configurados com segurança adequada para HTTPS

## Checklist rápido para apresentação final

Se o objetivo for preparar a demonstração local para a banca, este é o fluxo mais curto:

1. criar `.env` a partir de `.env.example`
2. subir o stack com `docker compose up --build -d`
3. importar `database/seed.sql`
4. reiniciar o backend
5. validar home, login, cadastro, postagens, painel admin, mensagens e agendamentos
6. opcionalmente rodar `npm run test:backend`
7. opcionalmente rodar `npm run test:e2e:docker`

## Organização do repositório e utilidade dos arquivos

### Arquivos e pastas que fazem parte do fluxo atual

- `backend/LogElec/`: aplicação principal do backend
- `frontend/`: telas, scripts e estilos utilizados pela aplicação
- `database/seed.sql`: base compartilhada para demonstração e testes
- `e2e/` e `playwright.config.js`: automação de testes end-to-end
- `scripts/run-backend-maven.cjs`: helper usado pelos scripts npm da raiz
- `docker-compose.yml` e `docker-compose.prod.yml`: orquestração local e produção
- `docs/`: documentação operacional da publicação em AWS

### Material auxiliar

- `docs/demo-assets/logos-empresas/` contém ativos visuais de apoio e referência de identidade para empresas do domínio; não participa diretamente do runtime da aplicação

### Artefatos gerados localmente

Esses diretórios e arquivos podem ser removidos a qualquer momento, pois são recriados quando necessário:

- `backend/LogElec/target/`
- `node_modules/`
- `playwright-report/`
- `test-results/`

## Documentação complementar

- [DOCKER.md](DOCKER.md): rotina operacional com Docker
- [docs/aws-lightsail-deploy.md](docs/aws-lightsail-deploy.md): guia completo de publicação na AWS Lightsail
- [docs/Caddyfile.lightsail.example](docs/Caddyfile.lightsail.example): exemplo de proxy HTTPS com Caddy

## Observação final

O LogElec está pronto para demonstração acadêmica, validação local e publicação temporária em nuvem com custo baixo. Sempre que houver mudança de fluxo operacional, portas, credenciais padrão, seed ou publicação, atualize este README, o [DOCKER.md](DOCKER.md) e os arquivos de ambiente de referência no mesmo ciclo de alteração.
