# LogElec com Docker (guia simples para o grupo)

Este projeto roda com 3 serviços no Docker:

- `db` (MySQL)
- `backend` (Spring Boot)
- `frontend` (site)

---

## 1) O que cada pessoa precisa instalar

- Docker Desktop (Windows)
- WSL2 habilitado (o próprio Docker costuma pedir isso na instalação)

Quando abrir o Docker Desktop, confirme que está ativo (`Engine running`).

---

## 2) Primeira vez na máquina (passo a passo)

Abra PowerShell na pasta do projeto e rode:

```powershell
Copy-Item .env.example .env
docker compose up --build -d
```

Se subir sem erro, acessar:

- Frontend: `http://localhost:8081`
- Backend: `http://localhost:8080`
- Banco (MySQL): `localhost:3307` (ou a porta definida no `.env`)

---

## 3) Rotina diária (sem complicação)

- **Ligar projeto**

```powershell
docker compose up --build -d
```

- **Ver logs (erros/mensagens)**

```powershell
docker compose logs -f
```

- **Parar projeto**

```powershell
docker compose down
```

---

## 4) Quando preciso rodar comando de novo?

- Mudou código do backend ou frontend: rode `docker compose up --build -d`
- Mudou só dados no banco (insert/update/delete): não precisa rodar nada
- Quer apagar tudo do banco e recomeçar:

```powershell
docker compose down -v
docker compose up --build -d
```

---

## 5) Erros comuns e solução rápida

### Erro de porta ocupada (ex.: 3306, 8080, 8081)

Edite o arquivo `.env` e troque a porta, por exemplo:

- `MYSQL_PORT=3307`

Depois rode de novo:

```powershell
docker compose up --build -d
```

### Docker não responde

- Abra Docker Desktop
- Confirme `Engine running`
- Se preciso: `Troubleshoot` -> `Restart Docker Desktop`

---

## 6) Regras para trabalho em equipe

- Versionar no Git: código + `docker-compose.yml` + `.env.example`
- Não versionar: `.env` (cada colega usa o seu local)
- Todos rodam os mesmos comandos para ter o mesmo ambiente

---

## 7) Replicar dados do banco para a turma

Este repositório inclui um snapshot do banco em `database/seed.sql`.

### Importar o seed na máquina de cada colega

Depois de subir os containers com `docker compose up -d`, rodar:

```powershell
docker exec -i logelec-db mysql -uroot -p74123LogElec < database/seed.sql
```

Depois validar:

```powershell
docker exec logelec-db mysql -uroot -p74123LogElec -e "USE logelec; SELECT COUNT(*) AS total_empresas FROM empresas;"
```

---

## 8) Atualizar o seed antes de publicar mudanças

Se você alterar dados importantes no seu banco Docker e quiser compartilhar para a turma:

```powershell
docker exec logelec-db mysqldump -uroot -p74123LogElec --databases logelec --routines --events --triggers > database/seed.sql
```

Depois faça commit do arquivo `database/seed.sql` junto com o código.