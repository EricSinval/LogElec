# LogElec

Sistema web acadêmico para intermediação entre empresas que desejam descartar resíduos eletroeletrônicos e empresas especializadas em coleta desses materiais.

## Visão geral

O LogElec conecta empresas do tipo `DESCARTE`, que possuem resíduos para retirada, com empresas do tipo `COLETA`, que oferecem o serviço. O sistema cobre o fluxo completo de cadastro, autenticação, publicação de oportunidades, negociação de agendamentos, troca de mensagens e apoio administrativo.

## Funcionalidades principais

- cadastro de empresas com perfil `DESCARTE` ou `COLETA`
- login e recuperação de senha por email + CNPJ
- edição de perfil e exclusão de conta com validações de vínculo
- criação, edição, busca e filtragem de postagens
- gestão de propostas e confirmações de agendamento
- chat liberado apenas após agendamento confirmado
- painel administrativo para visão geral, gestão de contas, moderação de publicações e acompanhamento de agendamentos

## Arquitetura

- frontend estático em HTML, CSS e JavaScript puro
- backend REST em Spring Boot
- banco de dados MySQL 8
- execução conteinerizada com Docker Compose
- frontend servido por Nginx no ambiente Docker

## Stack atual

| Camada | Tecnologia |
|--------|------------|
| Backend | Java 25 |
| Framework backend | Spring Boot 4.0.0-SNAPSHOT |
| Persistência | Spring Data JPA |
| Banco de dados | MySQL 8 |
| Criptografia de senha | BCrypt |
| Frontend | HTML5, CSS3 e JavaScript puro |
| Build | Maven Wrapper (`mvnw`) |
| Containerização | Docker e Docker Compose |

## Estrutura do projeto

```text
LogElec/
├── backend/LogElec/        # API Spring Boot
├── database/seed.sql       # base SQL compartilhada do projeto
├── frontend/               # telas estáticas e scripts do cliente
├── docker-compose.yml      # orquestração local
├── DOCKER.md               # guia operacional do ambiente Docker
├── README.md               # visão geral do projeto
└── .env.example            # portas e credenciais padrão do ambiente local
```

## Requisitos

### Fluxo recomendado

- Docker Desktop
- WSL2 habilitado no Windows

### Fluxo local sem containerizar o backend/frontend

- Java 25 instalado
- Python 3 para servir o frontend estático, ou outro servidor HTTP equivalente
- MySQL 8 local ou em container

## Subida rápida com Docker

### 1. Criar o arquivo `.env`

Na raiz do projeto:

```powershell
Copy-Item .env.example .env
```

Valores padrão do `.env.example`:

- MySQL: `3307`
- backend: `8080`
- frontend: `8081`

### 2. Subir os containers

```powershell
docker compose up --build -d
```

### 3. Importar a base compartilhada

O arquivo `database/seed.sql` é um snapshot com empresas, postagens, agendamentos e mensagens iniciais. Para evitar problemas de redirecionamento no PowerShell, use cópia para dentro do container:

```powershell
docker cp .\database\seed.sql logelec-db:/tmp/seed.sql
docker exec logelec-db sh -c "mysql -uroot -p74123LogElec logelec < /tmp/seed.sql"
docker compose restart backend
```

Observações importantes:

- o `seed.sql` recria as tabelas, então o restart do backend é intencional
- a conta administrativa não é persistida no seed; ela é recriada automaticamente no boot do backend
- a reinicialização também normaliza colunas novas do domínio administrativo quando necessário

### 4. Acessos padrão

- frontend: `http://localhost:8081`
- login: `http://localhost:8081/index/login.html`
- backend: `http://localhost:8080`
- banco MySQL: `localhost:3307`

## Acessos e dados base

### Conta administrativa

A conta administrativa é criada automaticamente pelo backend em toda subida limpa ou após o restart do serviço:

- email: `admin@logelec.com`
- senha: `Admin123`

### Empresas do seed

O seed foi pensado para povoar a aplicação com dados de navegação e teste manual. Como a base pode ter sido regenerada várias vezes ao longo do projeto, o caminho mais seguro para entrar com uma empresa sem conhecer a senha atual é usar a tela `Esqueci a senha` com email + CNPJ.

Exemplos úteis do seed:

- empresa de coleta: `biocolet@coleta.logelec.com` / CNPJ `12345678000195`
- empresa de descarte: `codebase@descarte.logelec.com` / CNPJ `12345678003534`

## Execução local

### Banco de dados

O backend está configurado por padrão para usar:

- URL: `jdbc:mysql://localhost:3307/logelec?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`
- usuário: `root`
- senha: `74123LogElec`

Se quiser usar o MySQL em container e rodar apenas backend/frontend fora do Docker:

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

- `http://localhost:5500/index/login.html`

## Módulos e rotas principais

### Frontend

- autenticação: `frontend/index/login.html`
- recuperação de senha: `frontend/index/esqueci_senha.html`
- cadastro: `frontend/index/cadastro.html`
- home: `frontend/index/home.html`
- perfil: `frontend/index/perfil.html`
- postagens: `frontend/index/postagens.html`
- cadastro de postagens: `frontend/index/cadastro_postagens.html`
- edição de postagens: `frontend/index/editar_postagens.html`
- agendamentos: `frontend/index/agendamento.html`
- mensagens: `frontend/index/mensagens.html`
- admin dashboard: `frontend/index/admin_dashboard.html`
- admin empresas: `frontend/index/admin_empresas.html`
- admin publicações: `frontend/index/admin_publicacoes.html`
- admin agendamentos: `frontend/index/admin_agendamentos.html`

### API

- autenticação: `/api/auth/*`
- empresas: `/api/empresas/*`
- postagens: `/api/postagens/*`
- agendamentos: `/api/agendamentos/*`
- mensagens: `/api/mensagens/*`
- administração: `/api/admin/*`

## Regras de negócio importantes

- o chat entre empresas só é liberado quando existe agendamento `CONFIRMADA`
- contas bloqueadas não devem autenticar no sistema
- postagens novas entram em fluxo de moderação; o seed marca o conteúdo compartilhado como aprovado
- os status canônicos de postagem são `ABERTA`, `PAUSADA`, `ENCERRADA` e `CANCELADA`
- os status de agendamento usados no fluxo atual são `AGENDADA`, `CONFIRMADA`, `RECUSADO`, `CANCELADA` e `REALIZADA`

## Arquivos-base para a equipe

- `README.md`: visão geral, execução e acessos
- `DOCKER.md`: rotina operacional com containers
- `database/seed.sql`: snapshot compartilhado do banco para demonstração e testes manuais
- `.env.example`: portas e credenciais padrão do ambiente local

## Situação atual

O LogElec está pronto para uso acadêmico e demonstração, com backend, frontend, banco e painel administrativo integrados. Para manter o ambiente da equipe consistente, atualize `database/seed.sql`, `README.md`, `DOCKER.md` e `.env.example` sempre que houver mudança de fluxo operacional, credenciais padrão, portas ou dados base relevantes.
