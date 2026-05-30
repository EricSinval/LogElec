# LogElec com Docker

Este documento apresenta o procedimento padrao para executar o projeto LogElec com Docker em ambiente local e para apoiar rotinas operacionais de desenvolvimento.

## Servicos

O arquivo `docker-compose.yml` define os seguintes servicos:

- `db`: banco de dados MySQL 8
- `backend`: aplicacao Spring Boot
- `frontend`: servidor Nginx responsavel pelo frontend estatico

## Pre-requisitos

- Docker Desktop
- PowerShell
- Git

## Instalacao do Ambiente Local

### 1. Criar o arquivo de ambiente

```powershell
Copy-Item .env.example .env
```

### 2. Subir os containers

```powershell
docker compose up --build -d
```

### 3. Importar a base de demonstracao

```powershell
docker cp .\database\seed.sql logelec-db:/tmp/seed.sql
docker exec logelec-db sh -c "mysql -uroot -p74123LogElec logelec < /tmp/seed.sql"
docker compose restart backend
```

Esse fluxo evita problemas de redirecionamento com PowerShell e garante a reaplicacao das inicializacoes do backend apos a carga da base.

### 4. Validar os acessos

- frontend: `http://localhost:8081/index/home.html`
- login: `http://localhost:8081/index/login.html`
- backend: `http://localhost:8080`
- MySQL: `localhost:3307`

## Operacao do Ambiente

### Subir ou reconstruir o ambiente

```powershell
docker compose up --build -d
```

### Consultar logs

```powershell
docker compose logs -f
```

### Parar os containers

```powershell
docker compose down
```

### Recriar o ambiente do zero

```powershell
docker compose down -v
docker compose up --build -d
docker cp .\database\seed.sql logelec-db:/tmp/seed.sql
docker exec logelec-db sh -c "mysql -uroot -p74123LogElec logelec < /tmp/seed.sql"
docker compose restart backend
```

## Conta Administrativa Local

No ambiente local, o backend recria automaticamente uma conta administrativa padrao:

- e-mail: `admin@logelec.com`
- senha: `Admin123`

Caso a autenticacao administrativa nao funcione logo apos a importacao do `seed.sql`, execute:

```powershell
docker compose restart backend
```

## Atualizacao do Seed Compartilhado

Para gerar uma nova versao do arquivo `database/seed.sql` a partir do banco local:

```powershell
docker exec logelec-db sh -c "mysqldump -uroot -p74123LogElec --databases logelec --routines --events --triggers > /tmp/logelec-seed.sql"
docker cp logelec-db:/tmp/logelec-seed.sql .\database\seed.sql
```

Antes de versionar a nova base, recomenda-se verificar:

- importacao sem erros em uma base vazia
- compatibilidade com o modelo atual do dominio
- integridade de textos e caracteres
- compatibilidade com o bootstrap administrativo do backend

## Solucao de Problemas

### Portas ocupadas

Se houver conflito de portas, ajuste no arquivo `.env`:

- `MYSQL_PORT`
- `BACKEND_PORT`
- `FRONTEND_PORT`

Em seguida, reconstrua o ambiente:

```powershell
docker compose up --build -d
```

### Docker Desktop indisponivel

Verifique se o Docker Desktop esta em execucao e se o mecanismo de containers foi iniciado corretamente.

### Base importada sem acesso administrativo

Esse comportamento pode ocorrer antes do reinicio do backend apos a importacao do `seed.sql`. Execute:

```powershell
docker compose restart backend
```

## Convencoes de Versionamento

- versionar `docker-compose.yml`, `.env.example`, `README.md`, `DOCKER.md` e `database/seed.sql`
- nao versionar `.env`
- atualizar a documentacao no mesmo commit sempre que houver mudanca no fluxo operacional

## Producao

Para o fluxo de publicacao em AWS Lightsail com `docker-compose.prod.yml`, HTTPS e proxy reverso, consulte:

- [docs/aws-lightsail-deploy.md](docs/aws-lightsail-deploy.md)
- [docs/Caddyfile.lightsail.example](docs/Caddyfile.lightsail.example)