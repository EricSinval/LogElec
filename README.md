# LogElec

LogElec e uma plataforma web para intermediar a relacao entre empresas que precisam descartar residuos eletroeletronicos e empresas responsaveis pela coleta e pela logistica reversa. O sistema foi desenvolvido para apoiar o fluxo de cadastro, autenticacao, publicacao de residuos, moderacao administrativa, agendamento de coletas e troca de mensagens entre empresas.

## Status

Projeto concluido para entrega academica, com manutencao corretiva e evolutiva pontual.

## Funcionalidades Principais

- cadastro de empresas dos tipos `DESCARTE` e `COLETA`
- autenticacao por sessao com login, logout e recuperacao de senha
- criacao, edicao e gerenciamento de postagens
- moderacao administrativa de publicacoes
- agendamento de coletas entre empresas
- troca de mensagens apos confirmacao de agendamento
- painel administrativo para empresas, publicacoes e agendamentos

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | HTML5, CSS3, JavaScript puro, Nginx |
| Backend | Java 21, Spring Boot 4, Spring Security, Spring Data JPA |
| Banco de dados | MySQL 8 |
| Testes | JUnit 5, Maven Surefire, Maven Failsafe, Playwright |
| Infraestrutura | Docker Compose, Caddy, AWS Lightsail |

## Estrutura do Projeto

```text
LogElec/
|-- backend/
|   `-- LogElec/
|       |-- src/main/java/com/ads/LogElec/
|       |-- src/main/resources/
|       |-- src/test/java/com/ads/LogElec/
|       |-- mvnw
|       |-- mvnw.cmd
|       `-- pom.xml
|-- database/
|   `-- seed.sql
|-- docs/
|   |-- aws-lightsail-deploy.md
|   `-- Caddyfile.lightsail.example
|-- e2e/
|   |-- prepare-environment.cjs
|   `-- tests/
|-- frontend/
|   |-- index/
|   |-- nginx/
|   |-- script/
|   `-- style_css/
|-- scripts/
|   `-- run-backend-maven.cjs
|-- docker-compose.yml
|-- docker-compose.prod.yml
|-- DOCKER.md
|-- package.json
|-- playwright.config.js
`-- README.md
```

## Instalacao

### Pre-requisitos

- Docker Desktop
- PowerShell
- Git
- Java 21 e Node.js sao opcionais para execucao fora do Docker e para testes automatizados

### Passo a passo

1. Clone o repositorio e acesse a pasta do projeto.

```powershell
git clone https://github.com/EricSinval/LogElec.git
cd LogElec
```

2. Crie o arquivo de ambiente local.

```powershell
Copy-Item .env.example .env
```

3. Suba os containers da aplicacao.

```powershell
docker compose up --build -d
```

4. Importe a base de demonstracao.

```powershell
docker cp .\database\seed.sql logelec-db:/tmp/seed.sql
docker exec logelec-db sh -c "mysql -uroot -p74123LogElec logelec < /tmp/seed.sql"
docker compose restart backend
```

5. Acesse os servicos locais.

- frontend: `http://localhost:8081/index/home.html`
- tela de login: `http://localhost:8081/index/login.html`
- backend: `http://localhost:8080`
- MySQL: `localhost:3307`

## Como Usar

### Acesso local padrao

No ambiente local, o backend cria automaticamente uma conta administrativa padrao:

- e-mail: `admin@logelec.com`
- senha: `Admin123`

### Fluxo principal de uso

1. Cadastre uma empresa do tipo `DESCARTE` ou `COLETA`.
2. Faça login na plataforma.
3. Crie ou consulte postagens de residuos eletroeletronicos.
4. Aguarde a moderacao administrativa para publicacao da postagem.
5. Realize o agendamento entre empresas interessadas.
6. Utilize o modulo de mensagens apos a confirmacao do agendamento.

### Testes automatizados

Para execucao dos testes a partir da raiz do projeto:

```powershell
npm install
npm run test:unit
npm run test:backend
npm run test:e2e:install
npm run test:e2e
```

Para execucao direta dos testes do backend:

```powershell
cd backend/LogElec
.\mvnw.cmd test
.\mvnw.cmd verify
```

## Implantacao

O projeto possui suporte a execucao em producao com `docker compose`, perfil `prod` no backend e frontend servido por Nginx com proxy para a API.

Arquivos de referencia:

- `.env.prod.example`
- `docker-compose.prod.yml`
- [DOCKER.md](DOCKER.md)
- [docs/aws-lightsail-deploy.md](docs/aws-lightsail-deploy.md)
- [docs/Caddyfile.lightsail.example](docs/Caddyfile.lightsail.example)

## Colaboracao

Contribuicoes devem seguir um fluxo simples e rastreavel:

1. criar uma branch a partir da principal
2. implementar a alteracao de forma isolada
3. executar os testes relacionados
4. revisar a documentacao impactada
5. abrir um pull request com descricao objetiva da mudanca

Boas praticas recomendadas:

- manter consistencia com o padrao atual de frontend e backend
- evitar alteracoes nao relacionadas ao objetivo da entrega
- atualizar README, arquivos de ambiente e documentacao operacional quando houver impacto no fluxo de uso ou deploy

## Licenca

Este projeto adota uma licenca de uso academico restrito. Os termos de utilizacao, modificacao e redistribuicao estao descritos em [LICENSE](LICENSE).
