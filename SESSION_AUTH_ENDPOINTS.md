# Session Auth Endpoint Matrix

## Modelo adotado

- Backend: Spring Security com sessao HTTP server-side.
- Frontend: cookie de sessao + cache local apenas para UX; a autorizacao real sai da sessao no backend.
- Regra central: ids de empresa enviados pelo navegador nao sao mais fonte de verdade para rotas sensiveis.

## Legenda

- `PUBLICO`: sem sessao.
- `AUTENTICADO`: exige sessao valida.
- `PROPRIA_EMPRESA`: exige sessao e recurso vinculado a propria empresa autenticada.
- `PARTICIPANTE`: exige sessao e participacao direta no recurso.
- `ADMIN`: exige sessao de administrador.

## AuthController

| Metodo | Endpoint | Escopo | Observacao |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | `PUBLICO` | Cria a sessao HTTP. |
| `GET` | `/api/auth/me` | `AUTENTICADO` | Retorna o usuario sanitizado da sessao. |
| `POST` | `/api/auth/logout` | `AUTENTICADO` | Invalida a sessao atual. |
| `POST` | `/api/auth/recuperar-senha` | `PUBLICO` | Fluxo de recuperacao. |

## AdminController

| Metodo | Endpoint | Escopo | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/admin/resumo` | `ADMIN` | Dashboard consolidado. |
| `GET` | `/api/admin/empresas` | `ADMIN` | Lista operacional de contas. |
| `PUT` | `/api/admin/empresas/{id}` | `ADMIN` | Atualiza dados administrativos de empresa. |
| `PUT` | `/api/admin/empresas/{id}/status` | `ADMIN` | Bloqueio e reativacao de conta. |
| `DELETE` | `/api/admin/empresas/{id}` | `ADMIN` | Remove conta quando nao houver vinculos. |
| `GET` | `/api/admin/postagens` | `ADMIN` | Lista completa para moderacao. |
| `PUT` | `/api/admin/postagens/{id}/moderar` | `ADMIN` | Aprova, rejeita ou bloqueia postagem. |
| `GET` | `/api/admin/agendamentos` | `ADMIN` | Visao consolidada de agendamentos. |

## EmpresaController

| Metodo | Endpoint | Escopo | Observacao |
| --- | --- | --- | --- |
| `POST` | `/api/empresas` | `PUBLICO` | Cadastro inicial de empresa. |
| `GET` | `/api/empresas/email/{email}` | `PUBLICO` | Busca por email. |
| `GET` | `/api/empresas` | `PUBLICO` | Listagem geral atual do cadastro. |
| `GET` | `/api/empresas/coletoras` | `PUBLICO` | Lista empresas de coleta. |
| `GET` | `/api/empresas/{id}` | `PUBLICO` | Consulta direta por id. |
| `GET` | `/api/empresas/me` | `AUTENTICADO` | Perfil da empresa autenticada. |
| `PUT` | `/api/empresas/{id}` | `PROPRIA_EMPRESA` | Compatibilidade legada; valida sessao contra o id. |
| `PUT` | `/api/empresas/me` | `PROPRIA_EMPRESA` | Atualizacao preferencial do perfil. |
| `DELETE` | `/api/empresas/{id}` | `PROPRIA_EMPRESA` | Compatibilidade legada; valida sessao contra o id. |
| `DELETE` | `/api/empresas/me` | `PROPRIA_EMPRESA` | Exclusao preferencial da propria conta. |

## PostagemController

| Metodo | Endpoint | Escopo | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/postagens` | `PUBLICO` | Vitrine publica. |
| `GET` | `/api/postagens/search` | `PUBLICO` | Busca publica. |
| `GET` | `/api/postagens/{id}` | `PUBLICO` | Detalhe publico da postagem. |
| `GET` | `/api/postagens/empresa/me` | `PROPRIA_EMPRESA` | Lista das postagens da sessao. |
| `GET` | `/api/postagens/empresa/{empresaId}` | `PROPRIA_EMPRESA` | Compatibilidade legada; valida sessao contra o id. |
| `GET` | `/api/postagens/status/{status}` | `PUBLICO` | Consulta por status operacional. |
| `POST` | `/api/postagens` | `PROPRIA_EMPRESA` | Empresa dona e derivada da sessao. |
| `PUT` | `/api/postagens/{id}` | `PROPRIA_EMPRESA` | Edicao restrita a dona da postagem ou admin. |
| `DELETE` | `/api/postagens/{id}` | `PROPRIA_EMPRESA` | Exclusao restrita a dona da postagem ou admin. |

## AgendamentoController

| Metodo | Endpoint | Escopo | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/agendamentos` | `ADMIN` | Lista completa de agendamentos. |
| `GET` | `/api/agendamentos/{id}` | `PARTICIPANTE` | Participantes do agendamento ou admin. |
| `GET` | `/api/agendamentos/solicitante/me` | `PROPRIA_EMPRESA` | Agendamentos da sessao como solicitante. |
| `GET` | `/api/agendamentos/solicitante/{empresaId}` | `PROPRIA_EMPRESA` | Compatibilidade legada; valida sessao contra o id. |
| `GET` | `/api/agendamentos/coletora/me` | `PROPRIA_EMPRESA` | Agendamentos da sessao como coletora. |
| `GET` | `/api/agendamentos/coletora/{empresaId}` | `PROPRIA_EMPRESA` | Compatibilidade legada; valida sessao contra o id. |
| `GET` | `/api/agendamentos/coletora/me/pendentes` | `PROPRIA_EMPRESA` | Pendencias da coletora autenticada. |
| `GET` | `/api/agendamentos/coletora/{empresaId}/pendentes` | `PROPRIA_EMPRESA` | Compatibilidade legada; valida sessao contra o id. |
| `GET` | `/api/agendamentos/futuros` | `ADMIN` | Restrito ao administrador. |
| `GET` | `/api/agendamentos/postagem/{postagemId}/horarios-ocupados` | `AUTENTICADO` | Endpoint sanitizado para UI de agenda. |
| `GET` | `/api/agendamentos/postagem/{postagemId}` | `PROPRIA_EMPRESA` | Lista completa restrita a dona da postagem ou admin. |
| `POST` | `/api/agendamentos` | `PROPRIA_EMPRESA` | Solicitante sai da sessao e coletora sai da postagem. |
| `PUT` | `/api/agendamentos/{id}/confirmar` | `PARTICIPANTE` | Restrito a empresa coletora responsavel. |
| `PUT` | `/api/agendamentos/{id}/recusar` | `PARTICIPANTE` | Restrito a empresa coletora responsavel. |
| `PUT` | `/api/agendamentos/{id}/cancelar` | `PARTICIPANTE` | Participantes do agendamento ou admin. |
| `PUT` | `/api/agendamentos/{id}/concluir` | `PARTICIPANTE` | Empresa de coleta vem da sessao; sem `empresaId` em query. |
| `DELETE` | `/api/agendamentos/{id}` | `PARTICIPANTE` | Participantes do agendamento ou admin. |

## MensagemController

| Metodo | Endpoint | Escopo | Observacao |
| --- | --- | --- | --- |
| `GET` | `/api/mensagens` | `ADMIN` | Lista completa de mensagens. |
| `GET` | `/api/mensagens/agendamento/{agendamentoId}` | `PARTICIPANTE` | Participantes do agendamento ou admin. |
| `GET` | `/api/mensagens/empresa/me` | `PROPRIA_EMPRESA` | Caixa da empresa autenticada. |
| `GET` | `/api/mensagens/empresa/{empresaId}` | `PROPRIA_EMPRESA` | Compatibilidade legada; valida sessao contra o id. |
| `GET` | `/api/mensagens/contatos-confirmados/me` | `PROPRIA_EMPRESA` | Contatos habilitados para conversa. |
| `GET` | `/api/mensagens/contatos-confirmados/{empresaId}` | `PROPRIA_EMPRESA` | Compatibilidade legada; valida sessao contra o id. |
| `GET` | `/api/mensagens/conversa/{outraEmpresaId}` | `PROPRIA_EMPRESA` | Endpoint preferencial; a empresa origem sai da sessao. |
| `GET` | `/api/mensagens/conversa?empresaAId=&empresaBId=` | `PARTICIPANTE` | Compatibilidade legada; uma das empresas precisa ser a da sessao. |
| `GET` | `/api/mensagens/nao-lidas/me` | `PROPRIA_EMPRESA` | Mensagens nao lidas da sessao. |
| `GET` | `/api/mensagens/nao-lidas/{empresaId}` | `PROPRIA_EMPRESA` | Compatibilidade legada; valida sessao contra o id. |
| `POST` | `/api/mensagens` | `PROPRIA_EMPRESA` | Remetente deriva da sessao. |
| `POST` | `/api/mensagens/enviar` | `PROPRIA_EMPRESA` | Remetente deriva da sessao; frontend envia apenas destinatario e conteudo. |
| `PUT` | `/api/mensagens/{id}/ler` | `PARTICIPANTE` | Destinatario da mensagem ou admin. |
| `DELETE` | `/api/mensagens/{id}` | `PARTICIPANTE` | Participantes da mensagem ou admin. |

## Frontend ja alinhado

- Login e logout usam `/api/auth/login`, `/api/auth/me` e `/api/auth/logout` com cookie de sessao.
- Telas de admin nao enviam mais `adminId` em query string.
- Perfil usa `/api/empresas/me`.
- Minhas postagens usam `/api/postagens/empresa/me`.
- Agendamentos usam rotas `/me` e conclusao sem `empresaId` em query.
- Mensagens usam `/api/mensagens/contatos-confirmados/me`, `/api/mensagens/conversa/{outraEmpresaId}` e envio sem `remetenteId`.
- UI de agenda consulta somente `/api/agendamentos/postagem/{postagemId}/horarios-ocupados`.