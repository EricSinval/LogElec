# Preparar projeto para a equipe

Use este checklist antes de avisar a turma para clonar.

## 1) Conferir containers

```powershell
docker compose up -d
docker compose ps
```

Verifique se `db`, `backend` e `frontend` estao `Up`.

## 2) Atualizar snapshot do banco

Isso gera o arquivo com dados reais para os colegas importarem:

```powershell
docker exec logelec-db mysqldump -uroot -p74123LogElec --databases logelec --routines --events --triggers > database/seed.sql
```

## 3) Conferir se o seed foi gerado

```powershell
Get-Item database/seed.sql | Select-Object FullName,Length
```

## 4) Revisar alteracoes locais

```powershell
git status --short
```

Confirme que os arquivos esperados estao na lista.

## 5) Commitar e publicar

```powershell
git add .
git commit -m "chore: docker setup e seed inicial para equipe"
git push
```

## 6) Mensagem para a turma (resumo)

Enviar para os colegas:

1. `git clone <URL_DO_REPO>`
2. `Copy-Item .env.example .env`
3. `docker compose up --build -d`
4. `docker exec -i logelec-db mysql -uroot -p74123LogElec < database/seed.sql`
5. Abrir `http://localhost:8081/index/home.html`

## 7) Se algum colega tiver porta ocupada

Pedir para alterar no `.env` local:

- `MYSQL_PORT=3307` ou `3308`
- `BACKEND_PORT=8080` ou `8082`
- `FRONTEND_PORT=8081` ou `8083`

Depois rodar de novo:

```powershell
docker compose up --build -d
```
