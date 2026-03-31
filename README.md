# LogElec

Sistema web para intermediação de descarte e coleta de resíduos eletroeletrônicos entre empresas.

## Escopo desta entrega

Esta versão foi organizada para atender a primeira entrega da disciplina, com foco nos seguintes itens:

- README do projeto
- interface de Login
- interface Esqueci a Senha
- CRUD do cadastro de usuário
- publicação do código no GitHub

O repositório já contém módulos adicionais, como postagens, agendamentos e mensagens, mas a apresentação desta etapa deve priorizar o fluxo de autenticação e gerenciamento do usuário.

## Funcionalidades da primeira entrega

- Cadastro de empresa usuária
- Login por email e senha
- Recuperação de senha por email e CNPJ
- Visualização dos dados do usuário
- Atualização de email, telefone, endereço e senha
- Exclusão da conta, respeitando as regras de vínculo do sistema

## Tipos de empresa

| Tipo | Descrição |
|------|-----------|
| `DESCARTE` | Empresa que deseja descartar resíduos eletroeletrônicos |
| `COLETA` | Empresa que realiza coleta de resíduos eletroeletrônicos |

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Backend | Java 25 + Spring Boot 4.0.0-SNAPSHOT |
| Build | Maven Wrapper (`mvnw`) |
| Banco | MySQL 8 |
| Segurança | BCrypt (`spring-security-crypto`) |
| Frontend | HTML5 + CSS3 + JavaScript puro |
| Servidor web | Nginx no ambiente Docker |
| Containerização | Docker + Docker Compose |

## Estrutura principal

```text
LogElec/
├── backend/LogElec/
│   ├── src/main/java/com/ads/LogElec/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   └── dto/
│   └── src/main/resources/
├── frontend/
│   ├── index/
│   ├── script/
│   ├── style_css/
│   └── img/
├── database/
│   └── seed.sql
├── docker-compose.yml
└── README.md
```

## Como executar

### Opção recomendada: Docker Compose

Na raiz do projeto:

```powershell
Copy-Item .env.example .env
docker compose up --build -d
```

Acessos padrão:

- Frontend: `http://localhost:8081/index/login.html`
- Backend: `http://localhost:8080`
- Banco MySQL: `localhost:3307`

Se quiser carregar os dados iniciais do banco:

```powershell
docker exec -i logelec-db mysql -uroot -p74123LogElec logelec < database/seed.sql
```

### Opção local

Backend:

```powershell
cd backend/LogElec
mvnw.cmd spring-boot:run
```

Frontend estático:

```powershell
python -m http.server 5500 --directory frontend
```

Depois acesse:

- `http://localhost:5500/index/login.html`

## Telas principais desta entrega

- `frontend/index/login.html`
- `frontend/index/esqueci_senha.html`
- `frontend/index/cadastro.html`
- `frontend/index/perfil.html`

## CRUD de usuário

O CRUD do usuário está distribuído entre cadastro inicial, autenticação e tela de perfil:

| Operação | Implementação |
|----------|---------------|
| Create | cadastro da empresa em `frontend/index/cadastro.html` + `POST /api/empresas` |
| Read | leitura dos dados no perfil em `frontend/index/perfil.html` + `GET /api/empresas/{id}` |
| Update | edição de dados no perfil + `PUT /api/empresas/{id}` |
| Delete | exclusão de conta no perfil + `DELETE /api/empresas/{id}` |

## Endpoints principais desta entrega

### Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Realiza login com email e senha |
| POST | `/api/auth/recuperar-senha` | Redefine a senha com email, CNPJ e nova senha |

### Empresas

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/empresas` | Cadastra uma empresa |
| GET | `/api/empresas/{id}` | Busca empresa por ID |
| GET | `/api/empresas/email/{email}` | Busca empresa por email |
| PUT | `/api/empresas/{id}` | Atualiza dados cadastrais e senha |
| DELETE | `/api/empresas/{id}` | Exclui a conta se não houver vínculos bloqueantes |

## Regras importantes para demonstração

- o login retorna os dados da empresa autenticada
- a recuperação de senha depende da combinação correta de email e CNPJ
- a exclusão da conta pode retornar bloqueio se a empresa tiver vínculos com postagens, agendamentos ou mensagens
- o sistema usa `DESCARTE` e `COLETA` como tipos finais de empresa

## GitHub

O projeto deve ser entregue como código-fonte publicado no GitHub. Antes da apresentação, confirme:

- que a branch de entrega contém o estado final do projeto
- que o commit final foi enviado ao remoto
- que o README está alinhado ao escopo da primeira entrega

## Observação final

Apesar de esta etapa exigir foco em autenticação e cadastro de usuário, o repositório já contém evolução funcional além do escopo mínimo. Para a apresentação em sala, a recomendação é demonstrar nesta ordem:

1. Cadastro de usuário
2. Login
3. Perfil como leitura, edição e exclusão
4. Esqueci a senha
