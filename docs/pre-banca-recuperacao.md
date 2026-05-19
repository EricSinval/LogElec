# Guia Rápido de Recuperação Pré-Banca

Roteiro curto para baixar o projeto em outro computador, subir o sistema e validar os testes principais sem depender de memória.

## Objetivo

- clonar ou baixar o repositório em outra máquina.
- subir o ambiente completo para demonstração.
- entrar com a conta administrativa.
- rodar os testes mais úteis para a banca.

## Pré-requisitos mínimos

### Para rodar o sistema com Docker

- Git.
- Docker Desktop.
- WSL2 habilitado no Windows.
- PowerShell aberto na raiz do projeto.

### Para rodar testes no host

- Java 21 para os testes Maven do backend.
- Node.js 18 ou superior e npm para os testes E2E com Playwright.

## Etapa 1. Baixar o projeto

Se for via Git:

```powershell
git clone <URL_DO_REPOSITORIO>
cd LogElec
```

Se for via ZIP:

1. extrair a pasta do projeto.
2. abrir PowerShell dentro da raiz `LogElec`.

## Etapa 2. Criar o `.env`

Na raiz do projeto:

```powershell
Copy-Item .env.example .env
```

Portas padrão:

- MySQL: `3307`
- backend: `8080`
- frontend: `8081`

## Etapa 3. Subir os containers

```powershell
docker compose up --build -d
```

Critério de aceite:

- `db` saudável.
- `backend` em execução.
- `frontend` em execução.

Comando útil:

```powershell
docker compose ps
```

## Etapa 4. Reaplicar a base seedada

Esse passo é importante para garantir os dados da demo e o estado esperado dos testes.

```powershell
docker cp .\database\seed.sql logelec-db:/tmp/seed.sql
docker exec logelec-db sh -c "mysql -uroot -p74123LogElec logelec < /tmp/seed.sql"
docker compose restart backend
```

## Etapa 5. Validar o acesso rápido

Acessos padrão:

- frontend: `http://localhost:8081`
- login: `http://localhost:8081/index/login.html`
- backend: `http://localhost:8080`

Conta administrativa:

- email: `admin@logelec.com`
- senha: `Admin123`

Se o admin não entrar após importar o seed:

```powershell
docker compose restart backend
```

## Etapa 6. Rodar os testes mais úteis para a banca

### Opção A. Testes unitários centrais do backend

Na pasta do backend:

```powershell
Set-Location .\backend\LogElec
.\mvnw.cmd "-Dtest=AuthServiceTest,AgendamentoServiceTest,PostagemServiceTest" test
```

Resultado esperado:

- `Tests run: 9`
- `Failures: 0`
- `Errors: 0`
- `BUILD SUCCESS`

O que esse recorte cobre:

- autenticação.
- regras de agendamento.
- moderação de postagens.

### Opção B. Suíte completa do backend

Ainda em `backend/LogElec`:

```powershell
.\mvnw.cmd test
```

Resultado esperado da rodada validada antes da banca:

- `Tests run: 29`
- `Failures: 0`
- `Errors: 0`
- `BUILD SUCCESS`

## Etapa 7. Rodar os testes E2E

Voltar para a raiz do projeto:

```powershell
Set-Location ..\..
npm install
npm run test:e2e:install
npm run test:e2e:docker
```

O script `test:e2e:docker`:

- sobe o stack se necessário.
- reaplica o `database/seed.sql`.
- reinicia o backend.
- executa a suíte Playwright.

## Etapa 8. Roteiro mínimo de contingência

Se o objetivo for apenas apresentar e o tempo estiver curto:

1. criar `.env`.
2. rodar `docker compose up --build -d`.
3. reaplicar `database/seed.sql`.
4. reiniciar o backend.
5. entrar com `admin@logelec.com` / `Admin123`.
6. rodar o teste unitário curto do backend.

## Problemas comuns

### Porta ocupada

Editar o `.env` e ajustar:

- `MYSQL_PORT`
- `BACKEND_PORT`
- `FRONTEND_PORT`

Depois subir novamente:

```powershell
docker compose up --build -d
```

### Docker Desktop não abriu

- iniciar o Docker Desktop.
- confirmar `Engine running`.
- repetir a subida do compose.

### Backend subiu, mas o admin não aparece

```powershell
docker compose restart backend
```

### Maven falha no host

Conferir a versão do Java:

```powershell
java -version
```

Esperado: Java 21.

### E2E falha por ambiente fora do ar

Executar novamente:

```powershell
docker compose up --build -d
npm run test:e2e:docker
```