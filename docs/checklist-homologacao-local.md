# Checklist Técnico de Homologação Local

Checklist para validar o LogElec localmente no ambiente correto antes de qualquer publicação.

## Objetivo

- subir o ambiente com a base seedada.
- validar backend no alvo Java 21.
- rodar a regressão E2E e a checagem manual mínima.
- registrar evidências da rodada.

## Pré-requisitos obrigatórios

- Docker Desktop em execução.
- WSL2 habilitado no Windows.
- Java 21 instalado no host.
- Node.js 18 ou superior.
- npm funcional.
- portas `3307`, `8080` e `8081` livres, ou `.env` ajustado.
- PowerShell aberto na raiz do projeto.

## Restrições conhecidas deste repositório

- o backend foi padronizado em Java 21 para coincidir com o alvo LTS e com o ambiente local.
- a validação do backend pode ser feita direto no host com Java 21 ou, se preferir isolamento, em container com Temurin 21.
- o seed recria tabelas e exige restart do backend para restaurar bootstrap administrativo.

## Etapa 1. Preparar variáveis do ambiente

```powershell
Copy-Item .env.example .env
```

Conferir no `.env`:

- `MYSQL_PORT=3307`
- `BACKEND_PORT=8080`
- `FRONTEND_PORT=8081`

Se alguma porta estiver ocupada, ajustar antes de seguir.

## Etapa 2. Subir o stack local

```powershell
docker compose up --build -d
```

Critério de aceite:

- `logelec-db` saudável.
- `logelec-backend` em execução.
- `logelec-frontend` em execução.

Comando útil:

```powershell
docker compose ps
```

## Etapa 3. Reaplicar o seed compartilhado

```powershell
docker cp .\database\seed.sql logelec-db:/tmp/seed.sql
docker exec logelec-db sh -c "mysql -uroot -p74123LogElec logelec < /tmp/seed.sql"
docker compose restart backend
```

Critério de aceite:

- seed importado sem erro.
- backend reiniciado após o seed.
- conta `admin@logelec.com` recriada no boot.

## Etapa 4. Smoke técnico do ambiente

Validar manualmente:

- frontend responde em `http://localhost:8081/index/login.html`.
- backend responde em `http://localhost:8080/api/auth/me` com `401` quando não autenticado.
- login admin funciona com `admin@logelec.com` / `Admin123`.

Se o admin não entrar logo após o seed:

```powershell
docker compose restart backend
```

## Etapa 5. Validar regressões automatizadas do frontend

Instalação inicial do Playwright, se ainda não foi feita:

```powershell
npm install
npm run test:e2e:install
```

Rodada completa com rebuild e reset da base:

```powershell
npm run test:e2e:docker
```

Rodada rápida contra ambiente já ativo:

```powershell
npm run test:e2e
```

Critério de aceite:

- suíte Playwright finaliza sem falhas.
- os fluxos cobertos incluem cadastro, recuperação de senha, proposta de agendamento, persistência de perfil e smoke administrativo.

## Etapa 6. Validar backend no alvo Java 21

Rodar a regressão focada da sessão/perfil no host, usando o Java 21 padronizado:

```powershell
Set-Location .\backend\LogElec
.\mvnw.cmd -Dtest=SessionOwnershipIntegrationTest test
```

Se quiser validar em ambiente isolado, rodar o mesmo recorte em container Maven com Temurin 21:

```powershell
docker run --rm --mount type=bind,source="${PWD}",target=/workspace -w /workspace/backend/LogElec maven:3.9.11-eclipse-temurin-21 ./mvnw -Dtest=SessionOwnershipIntegrationTest test
```

Se a rodada de homologação pedir cobertura maior, rodar a suíte backend completa no mesmo alvo:

```powershell
Set-Location .\backend\LogElec
.\mvnw.cmd test
```

Ou, de forma isolada no container Java 21:

```powershell
docker run --rm --mount type=bind,source="${PWD}",target=/workspace -w /workspace/backend/LogElec maven:3.9.11-eclipse-temurin-21 ./mvnw test
```

Critério de aceite:

- o teste focado que cobre `/api/auth/me` após atualização de perfil passa em Java 21.
- qualquer falha nova no host ou no container deve bloquear a publicação.

## Etapa 7. Homologação manual mínima por perfil

Executar ao menos os seguintes roteiros:

1. `PUBLICO`: cadastro, login e recuperação de senha.
2. `DESCARTE`: editar perfil, criar postagem, enviar proposta e ver proposta em `agendamento.html`.
3. `COLETA`: receber proposta, confirmar proposta, concluir coleta e validar liberação do chat.
4. `ADMIN`: abrir dashboard, bloquear conta, reativar conta, aprovar e rejeitar publicação.

Referência detalhada: `docs/matriz-testes.md`.

## Etapa 8. Evidências a salvar na rodada

- data/hora da execução.
- hash ou branch testada.
- resultado do `npm run test:e2e:docker`.
- resultado do teste backend em Java 21.
- screenshots dos fluxos admin, perfil pós-reload e agendamento confirmado.
- observações sobre qualquer desvio manual detectado.

## Critério de aprovação para seguir para publicação

- stack sobe do zero com `.env.example`.
- seed importa sem intervenção manual fora do roteiro.
- admin bootstrapa corretamente.
- Playwright passa sem falhas.
- regressão backend em Java 21 passa.
- nenhuma tela crítica do roteiro manual apresenta erro funcional bloqueante.

## Problemas comuns e resposta rápida

| Sintoma | Causa provável | Ação |
| --- | --- | --- |
| admin sumiu depois do seed | backend ainda não reiniciou | `docker compose restart backend` |
| backend falha em máquina local | Java do host diferente de 21 ou ambiente inconsistente | confirmar `java -version`, usar Java 21 ou rodar validação via container Maven/Temurin 21 |
| Playwright falha por ambiente fora do ar | frontend/backend ainda não subiram | repetir `docker compose up --build -d` e só então rodar os testes |
| dados estranhos na base | seed não reaplicado corretamente | repetir a importação do `database/seed.sql` |
| porta ocupada | conflito local | ajustar `.env` e refazer a subida |