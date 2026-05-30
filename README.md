# LogElec

LogElec é uma plataforma web para intermediar a relação entre empresas que precisam descartar resíduos eletroeletrônicos e empresas responsáveis pela coleta e pela logística reversa. O sistema foi desenvolvido para apoiar o fluxo de cadastro, autenticação, publicação de resíduos, moderação administrativa, agendamento de coletas e troca de mensagens entre empresas.

## Status

Projeto concluído para entrega acadêmica, com manutenção corretiva e evolutiva pontual.

## Funcionalidades Principais

- cadastro de empresas dos tipos `DESCARTE` e `COLETA`
- autenticação por sessão com login, logout e recuperação de senha
- criação, edição e gerenciamento de postagens
- moderação administrativa de publicações
- agendamento de coletas entre empresas
- troca de mensagens após confirmação de agendamento
- painel administrativo para empresas, publicações e agendamentos

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

## Instalação

### Pre-requisitos

- Docker Desktop
- PowerShell
- Git
- Java 21 e Node.js são opcionais para execução fora do Docker e para testes automatizados

### Passo a passo

1. Clone o repositório e acesse a pasta do projeto.

```powershell
git clone https://github.com/EricSinval/LogElec.git
cd LogElec
```

2. Crie o arquivo de ambiente local.

```powershell
Copy-Item .env.example .env
```

3. Suba os containers da aplicação.

```powershell
docker compose up --build -d
```

4. Importe a base de demonstração.

```powershell
docker cp .\database\seed.sql logelec-db:/tmp/seed.sql
docker exec logelec-db sh -c "mysql -uroot -p74123LogElec logelec < /tmp/seed.sql"
docker compose restart backend
```

5. Acesse os serviços locais.

- frontend: `http://localhost:8081/index/home.html`
- tela de login: `http://localhost:8081/index/login.html`
- backend: `http://localhost:8080`
- MySQL: `localhost:3307`

## Como Usar

### Acesso local padrão

No ambiente local, o backend cria automaticamente uma conta administrativa padrão:

- e-mail: `admin@logelec.com`
- senha: `Admin123`

### Fluxo principal de uso

1. Cadastre uma empresa do tipo `DESCARTE` ou `COLETA`.
2. Faça login na plataforma.
3. Crie ou consulte postagens de resíduos eletroeletrônicos.
4. Aguarde a moderação administrativa para publicação da postagem.
5. Realize o agendamento entre empresas interessadas.
6. Utilize o módulo de mensagens após a confirmação do agendamento.

### Testes automatizados

Para execução dos testes a partir da raiz do projeto:

```powershell
npm install
npm run test:unit
npm run test:backend
npm run test:e2e:install
npm run test:e2e
```

Para execução direta dos testes do backend:

```powershell
cd backend/LogElec
.\mvnw.cmd test
.\mvnw.cmd verify
```

## Implantação

O projeto possui suporte à execução em produção com `docker compose`, perfil `prod` no backend e frontend servido por Nginx com proxy para a API.

Arquivos de referência:

- `.env.prod.example`
- `docker-compose.prod.yml`
- [DOCKER.md](DOCKER.md)
- [docs/aws-lightsail-deploy.md](docs/aws-lightsail-deploy.md)
- [docs/Caddyfile.lightsail.example](docs/Caddyfile.lightsail.example)

## Colaboração

Contribuições devem seguir um fluxo simples e rastreável:

1. criar uma branch a partir da principal
2. implementar a alteração de forma isolada
3. executar os testes relacionados
4. revisar a documentação impactada
5. abrir um pull request com descrição objetiva da mudança

Boas práticas recomendadas:

- manter consistência com o padrão atual de frontend e backend
- evitar alterações não relacionadas ao objetivo da entrega
- atualizar README, arquivos de ambiente e documentação operacional quando houver impacto no fluxo de uso ou deploy

## Licença

Este projeto adota uma licença de uso acadêmico restrito. Os termos de utilização, modificação e redistribuição estão descritos em [LICENSE](LICENSE).
