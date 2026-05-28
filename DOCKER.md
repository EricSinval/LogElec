# LogElec com Docker

Guia operacional do ambiente Docker usado pelo grupo.

## Serviços do compose

- `db`: MySQL 8
- `backend`: API Spring Boot
- `frontend`: Nginx servindo o frontend estático

## Pré-requisitos

- Docker Desktop instalado
- WSL2 habilitado no Windows
- PowerShell aberto na raiz do projeto

## Primeira execução

### 1. Criar `.env`

```powershell
Copy-Item .env.example .env
```

### 2. Subir o ambiente

```powershell
docker compose up --build -d
```

### 3. Importar a base compartilhada

Use este fluxo em vez de redirecionamento com `<` ou `>` no PowerShell:

```powershell
docker cp .\database\seed.sql logelec-db:/tmp/seed.sql
docker exec logelec-db sh -c "mysql -uroot -p74123LogElec logelec < /tmp/seed.sql"
docker compose restart backend
```

Por que esse passo existe:

- o seed recria as tabelas do banco
- o restart do backend recria a conta admin e reaplica normalizações de domínio
- esse fluxo evita problema de redirecionamento e encoding no PowerShell

### 4. Validar acesso

- frontend: `http://localhost:8081`
- login: `http://localhost:8081/index/login.html`
- backend: `http://localhost:8080`
- MySQL: `localhost:3307`

## Rotina diária

### Subir ou reconstruir

```powershell
docker compose up --build -d
```

### Ver logs

```powershell
docker compose logs -f
```

### Parar containers

```powershell
docker compose down
```

### Apagar volumes e recomeçar do zero

```powershell
docker compose down -v
docker compose up --build -d
docker cp .\database\seed.sql logelec-db:/tmp/seed.sql
docker exec logelec-db sh -c "mysql -uroot -p74123LogElec logelec < /tmp/seed.sql"
docker compose restart backend
```

## Conta administrativa

A aplicação recria automaticamente a conta administrativa no boot do backend:

- email: `admin@logelec.com`
- senha: `Admin123`

Se você acabou de importar o seed e não consegue entrar como admin, execute:

```powershell
docker compose restart backend
```

## Atualizar o seed compartilhado

Se você ajustou dados importantes e quer publicar uma nova base para o grupo:

```powershell
docker exec logelec-db sh -c "mysqldump -uroot -p74123LogElec --databases logelec --routines --events --triggers > /tmp/logelec-seed.sql"
docker cp logelec-db:/tmp/logelec-seed.sql .\database\seed.sql
```

Antes de commitar, confira se o seed:

- importa sem erro em uma base vazia
- não remove colunas atuais do domínio
- não deixou texto corrompido por encoding
- continua compatível com o fluxo de bootstrap do backend

## Problemas comuns

### Porta ocupada

Edite `.env` e ajuste uma ou mais portas:

- `MYSQL_PORT`
- `BACKEND_PORT`
- `FRONTEND_PORT`

Depois:

```powershell
docker compose up --build -d
```

### Docker Desktop não iniciou

- abrir o Docker Desktop
- confirmar `Engine running`
- se necessário, reiniciar o Docker Desktop

### Importei o seed e o admin sumiu

Isso é esperado enquanto o backend não reinicia. Rode:

```powershell
docker compose restart backend
```

## Convenções do grupo

- versionar `docker-compose.yml`, `.env.example`, `README.md`, `DOCKER.md` e `database/seed.sql`
- não versionar `.env`
- quando mudar fluxo de setup, atualizar a documentação no mesmo commit

## Produção em AWS

Para o fluxo recomendado de publicação em Amazon Lightsail com HTTPS e `docker-compose.prod.yml`, consulte:

- `docs/aws-lightsail-deploy.md`