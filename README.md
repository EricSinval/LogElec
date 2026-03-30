# LogElec

Sistema web de intermediação para descarte e coleta de resíduos eletroeletrônicos. Conecta empresas geradoras de resíduo com empresas coletoras licenciadas, permitindo cadastro, postagem de resíduos disponíveis para coleta, agendamento e comunicação entre as partes.

## Tecnologias

| Camada     | Tecnologia                                    |
|------------|-----------------------------------------------|
| Backend    | Java 25 + Spring Boot 4.0.0-SNAPSHOT          |
| Build      | Maven 3.9.11 (wrapper `mvnw`)                 |
| Banco      | MySQL 8                                       |
| Segurança  | Spring Security Crypto (BCrypt)               |
| Frontend   | HTML5 + CSS3 + JavaScript (vanilla, sem framework) |
| Servidor   | Nginx (apenas no Docker)                      |
| Container  | Docker + Docker Compose                       |

## Pré-requisitos

- **JDK 25** — [Download Temurin 25](https://adoptium.net/)
- **MySQL 8** em execução local na porta `3306`
- **Maven 3.9+** ou use o wrapper `mvnw` incluído no projeto
- Navegador moderno para o frontend

## Configuração do Banco de Dados

```sql
-- Execute como root no MySQL:
CREATE DATABASE logelec;
```

Em seguida aplique os scripts na ordem:

```bash
mysql -u root -p logelec < database/admin_setup.sql
mysql -u root -p logelec < database/seed.sql
```

As credenciais padrão configuradas em `backend/LogElec/src/main/resources/application.properties`:

| Parâmetro | Valor                     |
|-----------|---------------------------|
| URL       | `jdbc:mysql://localhost:3306/logelec` |
| Usuário   | `root`                    |
| Senha     | `74123LogElec`            |

> ⚠️ Para desenvolvimento, copie `application-dev.properties` e ajuste as credenciais locais.

## Como Rodar

### Backend

```bash
cd backend/LogElec
./mvnw spring-boot:run          # Linux/Mac
mvnw.cmd spring-boot:run        # Windows
```

A API ficará disponível em `http://localhost:8080`.

### Frontend

Abra qualquer arquivo `frontend/index/*.html` diretamente no navegador ou sirva com um servidor estático simples:

```bash
# Com Python
python -m http.server 5500 --directory frontend

# Com Node.js (npx)
npx serve frontend -l 5500
```

Acesse `http://localhost:5500/index/login.html`.

### Via Docker Compose

```bash
docker-compose up --build
```

Sobe backend (porta 8080), banco MySQL e frontend via Nginx.

## Estrutura do Projeto

```
LogElec/
├── backend/LogElec/            # API Spring Boot
│   ├── src/main/java/          # Código-fonte Java
│   │   └── com/ads/LogElec/
│   │       ├── controller/     # Endpoints REST
│   │       ├── service/        # Regras de negócio
│   │       ├── repository/     # Acesso ao banco (Spring Data JPA)
│   │       ├── entity/         # Entidades JPA
│   │       ├── dto/            # Objetos de transferência de dados
│   │       └── config/         # Configurações (CORS, etc.)
│   └── src/main/resources/     # application.properties
├── frontend/
│   ├── index/                  # Páginas HTML
│   ├── script/                 # JavaScript por página
│   ├── style_css/              # CSS por página
│   └── img/                    # Imagens e assets
├── database/
│   ├── admin_setup.sql         # DDL e permissões
│   └── seed.sql                # Dados iniciais
└── docker-compose.yml
```

## Endpoints da API

### Autenticação — `/api/auth`

| Método | Rota                    | Descrição                                                   |
|--------|-------------------------|-------------------------------------------------------------|
| POST   | `/api/auth/login`       | Login por email + senha. Retorna objeto `Empresa`.          |
| POST   | `/api/auth/recuperar-senha` | Redefine senha verificando email + CNPJ. Body: `{email, cnpj, novaSenha}` |

### Empresas — `/api/empresas`

| Método | Rota                          | Descrição                                       |
|--------|-------------------------------|-------------------------------------------------|
| POST   | `/api/empresas`               | Cadastrar nova empresa                          |
| GET    | `/api/empresas`               | Listar todas as empresas                        |
| GET    | `/api/empresas/coletoras`     | Listar apenas empresas coletoras                |
| GET    | `/api/empresas/{id}`          | Buscar empresa por ID                           |
| GET    | `/api/empresas/email/{email}` | Buscar empresa por e-mail                       |
| PUT    | `/api/empresas/{id}`          | Atualizar dados/senha da empresa                |
| DELETE | `/api/empresas/{id}`          | Remover empresa (retorna 409 se houver vínculos)|

### Postagens — `/api/postagens`

| Método | Rota                              | Descrição                            |
|--------|-----------------------------------|--------------------------------------|
| GET    | `/api/postagens`                  | Listar todas as postagens            |
| GET    | `/api/postagens/{id}`             | Buscar postagem por ID               |
| GET    | `/api/postagens/search`           | Buscar postagens por termo           |
| GET    | `/api/postagens/empresa/{id}`     | Postagens de uma empresa             |
| GET    | `/api/postagens/status/{status}`  | Filtrar por status                   |
| POST   | `/api/postagens`                  | Criar postagem                       |
| PUT    | `/api/postagens/{id}`             | Atualizar postagem                   |
| DELETE | `/api/postagens/{id}`             | Remover postagem                     |

### Agendamentos — `/api/agendamentos`

| Método | Rota                                          | Descrição                                    |
|--------|-----------------------------------------------|----------------------------------------------|
| GET    | `/api/agendamentos`                           | Listar todos                                 |
| GET    | `/api/agendamentos/{id}`                      | Buscar por ID                                |
| GET    | `/api/agendamentos/solicitante/{empresaId}`   | Agendamentos feitos por uma empresa          |
| GET    | `/api/agendamentos/coletora/{empresaId}`      | Agendamentos recebidos por coletora          |
| GET    | `/api/agendamentos/coletora/{id}/pendentes`   | Agendamentos pendentes da coletora           |
| GET    | `/api/agendamentos/futuros`                   | Agendamentos futuros                         |
| GET    | `/api/agendamentos/postagem/{postagemId}`     | Agendamentos de uma postagem                 |
| POST   | `/api/agendamentos`                           | Criar agendamento                            |
| PUT    | `/api/agendamentos/{id}/confirmar`            | Confirmar agendamento                        |
| PUT    | `/api/agendamentos/{id}/cancelar`             | Cancelar agendamento                         |
| PUT    | `/api/agendamentos/{id}/concluir`             | Concluir agendamento                         |
| DELETE | `/api/agendamentos/{id}`                      | Remover agendamento                          |

### Mensagens — `/api/mensagens`

| Método | Rota                                          | Descrição                              |
|--------|-----------------------------------------------|----------------------------------------|
| GET    | `/api/mensagens`                              | Listar todas                           |
| GET    | `/api/mensagens/agendamento/{id}`             | Mensagens de um agendamento            |
| GET    | `/api/mensagens/empresa/{empresaId}`          | Mensagens de uma empresa               |
| GET    | `/api/mensagens/contatos-confirmados/{id}`    | Contatos com agendamentos confirmados  |
| GET    | `/api/mensagens/conversa`                     | Conversa entre duas empresas           |
| GET    | `/api/mensagens/nao-lidas/{empresaId}`        | Mensagens não lidas                    |
| POST   | `/api/mensagens`                              | Criar mensagem                         |
| POST   | `/api/mensagens/enviar`                       | Enviar mensagem                        |
| PUT    | `/api/mensagens/{id}/ler`                     | Marcar como lida                       |
| DELETE | `/api/mensagens/{id}`                         | Remover mensagem                       |

## Funcionalidades

- **Cadastro e Login** — Registro de empresas geradoras e coletoras com senha criptografada (BCrypt)
- **Recuperação de Senha** — Verificação por e-mail + CNPJ, sem necessidade de servidor de e-mail
- **Postagens de Resíduo** — Empresas publicam resíduos disponíveis para coleta com descrição e status
- **Agendamento de Coleta** — Coletoras solicitam coleta de postagens; fluxo: pendente → confirmado → concluído/cancelado
- **Mensagens** — Chat interno entre empresa geradora e coletora vinculado a agendamentos
- **Perfil** — Atualização de dados cadastrais e troca de senha

## Tipos de Empresa

| Tipo       | Descrição                                    |
|------------|----------------------------------------------|
| `GERADORA` | Empresa que gera resíduo e busca coleta      |
| `COLETA`   | Empresa licenciada para coletar o resíduo    |
