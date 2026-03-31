# LogElec

Sistema web acadêmico para intermediação entre empresas que desejam descartar resíduos eletroeletrônicos e empresas especializadas em coleta desses materiais.

## Resumo

O projeto LogElec foi desenvolvido para organizar o processo de descarte e coleta de resíduos eletroeletrônicos em ambiente corporativo. A proposta do sistema é conectar empresas do tipo `DESCARTE`, que possuem materiais eletrônicos para retirada, com empresas do tipo `COLETA`, que oferecem disponibilidade e capacidade operacional para realizar o serviço.

Além do cadastro e autenticação de usuários, o sistema contempla publicação de postagens, solicitação e gestão de agendamentos, troca de mensagens entre empresas com vínculo confirmado e gerenciamento de perfil.

## Objetivo do projeto

O objetivo do LogElec é oferecer uma solução digital para:

- centralizar o cadastro de empresas envolvidas no fluxo de descarte e coleta
- permitir autenticação e recuperação de acesso de forma simples
- registrar oportunidades de descarte ou disponibilidade de coleta
- organizar propostas de agendamento entre empresas
- liberar comunicação somente quando houver vínculo operacional válido
- manter o controle dos dados cadastrais da conta

## Problema abordado

O descarte de resíduos eletroeletrônicos envolve riscos ambientais, exigências logísticas e necessidade de coordenação entre geradores e coletoras. Em muitos contextos, esse processo ocorre de forma descentralizada, com baixa rastreabilidade e sem padronização das interações entre as partes.

O LogElec busca reduzir esse problema por meio de uma plataforma única, na qual as empresas podem se cadastrar, publicar suas necessidades ou disponibilidades, negociar propostas de coleta e acompanhar o relacionamento de forma estruturada.

## Escopo funcional

O sistema atualmente contempla os seguintes módulos:

- autenticação de usuários com login por email e senha
- recuperação de senha com validação por email e CNPJ
- cadastro de empresa usuária
- leitura, edição e exclusão de conta no módulo de perfil
- vitrine de postagens com filtragem conforme o tipo de empresa logada
- cadastro e edição de postagens
- agendamentos com estados de proposta, confirmação, recusa, cancelamento e conclusão
- mensagens entre empresas com regra de liberação após agendamento confirmado

## Tipos de empresa

| Tipo | Descrição |
|------|-----------|
| `DESCARTE` | Empresa que deseja descartar resíduos eletroeletrônicos |
| `COLETA` | Empresa que realiza coleta de resíduos eletroeletrônicos |

## Regras de negócio principais

### Autenticação e conta

- o login é realizado com email e senha
- a recuperação de senha exige correspondência entre email e CNPJ cadastrados
- a atualização de senha exige confirmação da senha atual no perfil
- a exclusão da conta pode ser bloqueada se existirem vínculos com postagens, agendamentos ou mensagens

### Postagens

- empresas podem publicar informações conforme seu papel no sistema
- o frontend adapta rótulos e campos de postagens de acordo com o tipo de empresa logada
- os estados atualmente suportados para postagens são `ABERTA`, `PAUSADA`, `ENCERRADA`, `CANCELADA` e `FINALIZADA`
- no uso atual da interface, `FINALIZADA` permanece por compatibilidade e é tratada visualmente como encerramento

### Agendamentos

- uma proposta nasce com status `AGENDADA`
- a empresa responsável pode confirmar ou recusar a proposta
- o fluxo atual inclui os estados `AGENDADA`, `CONFIRMADA`, `RECUSADO`, `CANCELADA` e `REALIZADA`
- o painel de agendamentos separa propostas, aguardando resposta, em andamento e histórico

### Mensagens

- o chat não é livre entre quaisquer empresas
- a conversa só é liberada quando existe agendamento `CONFIRMADA` entre as duas partes
- essa regra vale tanto para leitura da conversa quanto para envio de novas mensagens

## Arquitetura da solução

O projeto segue uma arquitetura em três camadas principais:

- frontend estático em HTML, CSS e JavaScript puro
- backend REST em Spring Boot
- banco de dados MySQL

No ambiente conteinerizado, o frontend é servido por Nginx e toda a aplicação pode ser iniciada via Docker Compose.

## Tecnologias utilizadas

| Camada | Tecnologia |
|--------|------------|
| Backend | Java 25 |
| Framework backend | Spring Boot 4.0.0-SNAPSHOT |
| Persistência | Spring Data JPA |
| Banco de dados | MySQL 8 |
| Criptografia de senha | Spring Security Crypto com BCrypt |
| Frontend | HTML5, CSS3 e JavaScript puro |
| Build | Maven Wrapper (`mvnw`) |
| Containerização | Docker e Docker Compose |
| Servidor web do frontend | Nginx |

## Estrutura do projeto

```text
LogElec/
├── backend/LogElec/
│   ├── src/main/java/com/ads/LogElec/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── repository/
│   │   └── service/
│   ├── src/main/resources/
│   └── src/test/
├── database/
│   └── seed.sql
├── frontend/
│   ├── index/
│   ├── img/
│   ├── nginx/
│   ├── script/
│   └── style_css/
├── Logos empresas/
├── docker-compose.yml
├── DOCKER.md
└── README.md
```

## Principais telas do frontend

| Tela | Arquivo |
|------|---------|
| Login | `frontend/index/login.html` |
| Esqueci a senha | `frontend/index/esqueci_senha.html` |
| Cadastro | `frontend/index/cadastro.html` |
| Perfil | `frontend/index/perfil.html` |
| Home | `frontend/index/home.html` |
| Postagens | `frontend/index/postagens.html` |
| Cadastro de postagens | `frontend/index/cadastro_postagens.html` |
| Edição de postagens | `frontend/index/editar_postagens.html` |
| Agendamentos | `frontend/index/agendamento.html` |
| Mensagens | `frontend/index/mensagens.html` |

## CRUD de usuário

O CRUD de usuário está distribuído entre as telas de cadastro e perfil, com suporte no backend pela API de empresas.

| Operação | Implementação funcional |
|----------|-------------------------|
| Create | cadastro da empresa em `frontend/index/cadastro.html` com `POST /api/empresas` |
| Read | leitura dos dados no perfil com `GET /api/empresas/{id}` |
| Update | edição no perfil com `PUT /api/empresas/{id}` |
| Delete | exclusão da conta com `DELETE /api/empresas/{id}` |

## Endpoints principais

### Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Autentica a empresa com email e senha |
| POST | `/api/auth/recuperar-senha` | Redefine a senha com email, CNPJ e nova senha |

### Empresas

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/empresas` | Cadastra uma empresa |
| GET | `/api/empresas` | Lista empresas |
| GET | `/api/empresas/coletoras` | Lista empresas do tipo coleta |
| GET | `/api/empresas/{id}` | Busca empresa por ID |
| GET | `/api/empresas/email/{email}` | Busca empresa por email |
| PUT | `/api/empresas/{id}` | Atualiza dados e senha |
| DELETE | `/api/empresas/{id}` | Exclui a conta se não houver vínculos bloqueantes |

### Postagens

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/postagens` | Lista todas as postagens |
| GET | `/api/postagens/{id}` | Busca postagem por ID |
| GET | `/api/postagens/search?q=...` | Busca por termo |
| GET | `/api/postagens/empresa/{id}` | Lista postagens por empresa |
| GET | `/api/postagens/status/{status}` | Filtra por status |
| POST | `/api/postagens` | Cria postagem |
| PUT | `/api/postagens/{id}` | Atualiza postagem |
| DELETE | `/api/postagens/{id}` | Exclui postagem |

### Agendamentos

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/agendamentos` | Lista agendamentos |
| GET | `/api/agendamentos/{id}` | Busca agendamento por ID |
| GET | `/api/agendamentos/solicitante/{empresaId}` | Lista agendamentos do solicitante |
| GET | `/api/agendamentos/coletora/{empresaId}` | Lista agendamentos da coletora |
| GET | `/api/agendamentos/coletora/{empresaId}/pendentes` | Lista propostas pendentes |
| GET | `/api/agendamentos/futuros` | Lista agendamentos futuros |
| GET | `/api/agendamentos/postagem/{postagemId}` | Lista agendamentos de uma postagem |
| POST | `/api/agendamentos` | Cria agendamento |
| PUT | `/api/agendamentos/{id}/confirmar` | Confirma agendamento |
| PUT | `/api/agendamentos/{id}/recusar` | Recusa agendamento |
| PUT | `/api/agendamentos/{id}/cancelar` | Cancela agendamento |
| PUT | `/api/agendamentos/{id}/concluir` | Conclui a coleta |
| DELETE | `/api/agendamentos/{id}` | Exclui agendamento |

### Mensagens

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/mensagens` | Lista mensagens |
| GET | `/api/mensagens/agendamento/{id}` | Lista mensagens de um agendamento |
| GET | `/api/mensagens/empresa/{empresaId}` | Lista mensagens vinculadas à empresa |
| GET | `/api/mensagens/contatos-confirmados/{empresaId}` | Lista contatos liberados para conversa |
| GET | `/api/mensagens/conversa?empresaAId=...&empresaBId=...` | Recupera conversa entre duas empresas |
| GET | `/api/mensagens/nao-lidas/{empresaId}` | Lista mensagens não lidas |
| POST | `/api/mensagens` | Cria mensagem a partir do objeto completo |
| POST | `/api/mensagens/enviar` | Envia mensagem com remetente, destinatário e conteúdo |
| PUT | `/api/mensagens/{id}/ler` | Marca mensagem como lida |
| DELETE | `/api/mensagens/{id}` | Exclui mensagem |

## Como executar com Docker

### 1. Preparar variáveis de ambiente

Na raiz do projeto:

```powershell
Copy-Item .env.example .env
```

O arquivo `.env.example` define, por padrão:

- MySQL em `3307`
- backend em `8080`
- frontend em `8081`

### 2. Subir os containers

```powershell
docker compose up --build -d
```

### 3. Acessos padrão

- Frontend: `http://localhost:8081`
- Login: `http://localhost:8081/index/login.html`
- Backend: `http://localhost:8080`
- Banco MySQL: `localhost:3307`

### 4. Popular o banco com dados iniciais

```powershell
docker exec -i logelec-db mysql -uroot -p74123LogElec logelec < database/seed.sql
```

## Como executar localmente

### Backend

```powershell
cd backend/LogElec
mvnw.cmd spring-boot:run
```

### Frontend

```powershell
python -m http.server 5500 --directory frontend
```

Depois acesse:

- `http://localhost:5500/index/login.html`

## Configuração de banco de dados

No ambiente local sem Docker para o backend, o projeto utiliza por padrão:

- URL: `jdbc:mysql://localhost:3307/logelec?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`
- usuário: `root`
- senha: `74123LogElec`

No ambiente Docker, o backend se conecta ao serviço `db` via rede interna do Compose.

## Situação do projeto

O LogElec está em reta final de implementação e já contém um conjunto funcional acima do escopo mínimo inicial da disciplina. O foco acadêmico do sistema está em demonstrar uma solução aplicada para organização do fluxo de descarte e coleta de resíduos eletroeletrônicos, com regras de negócio, persistência, autenticação e integração entre frontend e backend.

## Repositório

O projeto deve ser disponibilizado no GitHub como entrega de código-fonte, mantendo o histórico de evolução e a organização do trabalho em branches e commits.
