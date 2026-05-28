# Deploy em AWS Lightsail

Guia operacional para publicar o LogElec em produção por curto prazo, com custo baixo e o mínimo de peças possíveis.

## Arquitetura recomendada

- 1 instância Amazon Lightsail Linux
- Docker Compose executando `db`, `backend` e `frontend`
- frontend publicado apenas em `127.0.0.1:8081`
- Caddy no host expondo `80/443` e fazendo proxy para o frontend
- domínio próprio apontando para o IP estático da instância

Essa arquitetura existe para manter frontend e backend no mesmo domínio, preservar a autenticação por sessão e evitar custo extra com load balancer, ECS ou banco gerenciado.

## Custo estimado

- Lightsail Linux 2 GB: cerca de US$ 12/mês
- domínio: depende de onde ele já estiver hospedado
- snapshot: opcional, custo adicional pequeno se você decidir manter backup na AWS

Para este projeto, não é recomendado usar o plano de 1 GB se você pretende manter Java, MySQL e Nginx na mesma máquina.

## Pré-checklist

- código já atualizado com o perfil `prod`
- `.env.prod` preparado a partir de `.env.prod.example`
- domínio ou subdomínio definido
- portas `80` e `443` liberadas publicamente
- porta `22` restrita ao seu IP sempre que possível
- credenciais fortes para banco e admin

## Passo 1: criar a instância

No Lightsail:

1. crie uma instância Ubuntu LTS
2. escolha o bundle de 2 GB RAM
3. associe um IP estático à instância
4. abra apenas `80`, `443` e `22`
5. aponte o DNS do domínio para o IP estático

## Passo 2: preparar o servidor

Conecte por SSH e execute:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

## Passo 3: subir o projeto no servidor

Escolha uma pasta de trabalho, por exemplo `/opt/logelec`.

Se o projeto estiver em um repositório Git acessível:

```bash
sudo mkdir -p /opt/logelec
sudo chown $USER:$USER /opt/logelec
git clone <url-do-repositorio> /opt/logelec
cd /opt/logelec
```

Se o projeto ainda não estiver em um repositório remoto, copie a pasta para a instância com `scp`, SFTP ou upload manual e então acesse o diretório do projeto.

## Passo 4: criar o ambiente de produção

Na raiz do projeto:

```bash
cp .env.prod.example .env.prod
nano .env.prod
```

Ajuste no mínimo:

- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PASSWORD`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_CORS_ALLOWED_ORIGIN_PATTERNS`
- `APP_ADMIN_EMAIL`
- `APP_ADMIN_PASSWORD`

Valores esperados para domínio:

```env
APP_CORS_ALLOWED_ORIGIN_PATTERNS=https://seu-dominio.com,https://www.seu-dominio.com
FRONTEND_BIND_ADDRESS=127.0.0.1
FRONTEND_PORT=8081
```

## Passo 5: subir o stack de produção

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up --build -d
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod ps
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod logs --tail=100
```

Nesse modo:

- o banco não fica exposto na internet
- o backend não fica exposto na internet
- o frontend responde apenas localmente em `127.0.0.1:8081`

## Passo 6: importar o seed opcionalmente

Se você quiser publicar com os dados atuais de demonstração:

```bash
docker cp ./database/seed.sql logelec-db:/tmp/seed.sql
docker exec logelec-db sh -c "mysql -uroot -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE < /tmp/seed.sql"
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod restart backend
```

Se preferir evitar interpolação do shell na senha, substitua manualmente os valores no comando antes de executar.

## Passo 7: instalar o Caddy para HTTPS

Instale o Caddy no host:

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

Copie o arquivo de exemplo do repositório:

```bash
sudo cp docs/Caddyfile.lightsail.example /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile
sudo systemctl restart caddy
sudo systemctl status caddy
```

Substitua `seu-dominio.com` e `www.seu-dominio.com` pelo domínio real antes de reiniciar.

## Passo 8: smoke test pós-deploy

Valide estes pontos:

- `https://seu-dominio.com` abre a home
- `https://seu-dominio.com/index/login.html` abre a tela de login
- cadastro de empresa funciona
- login funciona
- sessão continua após navegar entre páginas
- criação e edição de postagem funciona
- painel admin funciona com as credenciais configuradas
- agendamento e mensagens funcionam

Comandos úteis:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod logs -f backend
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod logs -f frontend
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod logs -f db
```

## Rollback rápido

Se o deploy falhar depois de alguma alteração de código:

```bash
cd /opt/logelec
git checkout <commit-anterior>
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up --build -d
```

Se o problema for apenas configuração, restaure `.env.prod` e reinicie o stack.

## Encerramento após 1 mês

Antes de derrubar tudo:

1. exporte o banco
2. baixe o dump para sua máquina
3. opcionalmente gere um snapshot da instância
4. remova containers e volumes se não precisar mais do ambiente
5. delete instância, IP estático e snapshot para não continuar cobrando

Dump do banco:

```bash
docker exec logelec-db sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --databases "$MYSQL_DATABASE" --routines --events --triggers' > logelec-prod-backup.sql
```

Desligamento do stack:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod down
```

## Observações finais

- esse fluxo foi pensado para velocidade e custo baixo, não para alta disponibilidade
- para este projeto, a maior parte do risco operacional está em domínio, HTTPS e variáveis de ambiente, não em escala
- se o uso crescer, o próximo passo natural é separar banco e aplicação, não migrar direto para Kubernetes