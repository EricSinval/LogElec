# Matriz de Testes do LogElec

Matriz operacional para homologação por tela, por perfil e por funcionalidade crítica.

## Perfis cobertos

- `PUBLICO`: usuário sem sessão.
- `DESCARTE`: empresa autenticada que publica resíduos.
- `COLETA`: empresa autenticada que oferece coleta.
- `ADMIN`: administrador da plataforma.

## Legenda de cobertura

- `Automatizado`: já existe cobertura em Playwright e/ou integração backend.
- `Manual obrigatório`: precisa entrar na homologação humana.
- `Manual de contingência`: executar se houver ajuste recente naquele fluxo.

## Cobertura automatizada já existente

| Fluxo | Cobertura atual |
| --- | --- |
| Cadastro e entrada na vitrine | Playwright |
| Recuperação de senha e novo login | Playwright |
| Proposta inicial de agendamento | Playwright |
| Persistência do perfil após reload | Playwright + backend integração |
| Leitura atualizada de sessão em `/api/auth/me` | Integração backend |
| Leitura de publicações administrativas com texto seedado | Playwright |

## Matriz por tela

| Tela | Perfil | Pré-condição | Casos obrigatórios | Resultado esperado | Cobertura |
| --- | --- | --- | --- | --- | --- |
| `home.html` | `PUBLICO` | Ambiente no ar | abrir a home, validar carregamento visual, navegar para login e cadastro | landing acessível sem erro 404 e navegação básica funcional | Manual obrigatório |
| `login.html` | `PUBLICO` | conta válida de empresa comum e conta admin disponíveis | login válido de empresa comum, login válido de admin, senha inválida, conta bloqueada, clique repetido no submit | empresa comum redireciona para `postagens.html`, admin redireciona para `admin_dashboard.html`, erro visível em falha e sem envio duplicado | Parcialmente automatizado |
| `esqueci_senha.html` | `PUBLICO` | email + CNPJ conhecidos no seed | redefinir senha com combinação válida, tentar combinação inválida, validar novo login, validar que mensagem de sucesso aparece | senha atualizada e novo login funcional; combinação inválida não redefine conta errada | Automatizado + manual de contingência |
| `cadastro.html` | `PUBLICO` | ambiente limpo ou email/CNPJ inéditos | obrigatoriedade de tipo, validação de email, validação de CNPJ, validação de telefone, cadastro `DESCARTE`, cadastro `COLETA` | sessão criada após cadastro e redirecionamento para vitrine do perfil correto | Parcialmente automatizado |
| `postagens.html` | `DESCARTE` | sessão autenticada `DESCARTE` | listar apenas empresas `COLETA`, busca textual, abrir detalhes, abrir popup de agendamento, enviar proposta | vitrine mostra somente o perfil oposto, textos batem com seed aprovado e proposta é criada | Automatizado + manual obrigatório |
| `postagens.html` | `COLETA` | sessão autenticada `COLETA` | listar apenas empresas `DESCARTE`, busca textual, abrir detalhes, abrir popup de agendamento | vitrine mostra somente resíduos de descarte e título da tela muda para "Resíduos para Coleta" | Manual obrigatório |
| `perfil.html` | `DESCARTE` e `COLETA` | sessão autenticada | editar email, telefone e endereço; alterar senha com senha atual; cancelar edição; recarregar página; excluir conta sem vínculos ativos; tentar excluir conta com agendamento `AGENDADA` ou `CONFIRMADA` | dados persistem em `/api/empresas/me` e `/api/auth/me`; exclusão remove histórico encerrado da conta e bloqueia apenas vínculos ativos de agendamento ou postagens próprias | Parcialmente automatizado |
| `cadastro_postagens.html` | `DESCARTE` | sessão `DESCARTE` | cadastrar postagem com endereço de retirada, dias e horários, foto do resíduo e descrição | postagem salva, entra em moderação e fica pendente até ação do admin | Manual obrigatório |
| `cadastro_postagens.html` | `COLETA` | sessão `COLETA` | cadastrar postagem sem campo de endereço, com foto/logo da empresa, tipos coletados e peso máximo | formulário adapta labels por perfil e envia `fotoEmpresa` em vez de `fotoResiduos` | Manual obrigatório |
| `editar_postagens.html` | `DESCARTE` e `COLETA` | sessão autenticada com postagem própria já criada | listar somente postagens próprias, editar descrição/peso/status/agenda, reenviar imagem, excluir postagem | update só afeta a própria empresa e edição devolve a postagem para moderação | Manual obrigatório |
| `agendamento.html` | `DESCARTE` | sessão com proposta criada | ver proposta em aberto, cancelar proposta `AGENDADA`, validar contadores e painel de detalhes | proposta aparece em "Minhas propostas" e cancelamento muda status corretamente | Parcialmente automatizado |
| `agendamento.html` | `COLETA` | sessão com proposta recebida | aceitar proposta, recusar proposta, concluir coleta quando `CONFIRMADA`, validar liberação de mensagens | coletora altera status e somente agendamentos válidos liberam conversa | Manual obrigatório |
| `mensagens.html` | `DESCARTE` e `COLETA` | ao menos um agendamento `CONFIRMADA` entre as empresas | carregar contatos confirmados, abrir conversa, enviar mensagem, validar polling, validar ausência de contatos sem agendamento confirmado | conversa só abre para contatos permitidos e mensagens novas aparecem sem quebrar sessão | Manual obrigatório |
| `admin_dashboard.html` | `ADMIN` | sessão admin | validar cards de resumo, pendências de moderação e lista de agendamentos recentes | dados consolidados carregam sem erro e acesso é bloqueado para não-admin | Manual obrigatório |
| `admin_empresas.html` | `ADMIN` | sessão admin e base seedada | buscar por nome/email/CNPJ/endereço, editar conta, bloquear conta, reativar conta, excluir conta sem vínculos ativos, tentar excluir com agendamento `AGENDADA` ou `CONFIRMADA` | operações administrativas persistem; histórico encerrado não bloqueia exclusão e conflitos aparecem apenas para vínculos ativos ou postagens próprias | Manual obrigatório |
| `admin_publicacoes.html` | `ADMIN` | sessão admin e publicações existentes | filtrar por moderação, buscar textos seedados, aprovar, rejeitar com motivo, bloquear com motivo | motivo é obrigatório para rejeição/bloqueio e publicação aprovada volta à vitrine | Parcialmente automatizado |
| `admin_agendamentos.html` | `ADMIN` | sessão admin e agendamentos existentes | filtrar por status, conferir empresas envolvidas, conferir observações e data/hora | painel mostra situação consolidada sem edição direta indevida | Manual obrigatório |

## Sequência sugerida de execução da homologação manual

1. Fluxos públicos: `home`, `cadastro`, `login`, `esqueci_senha`.
2. Fluxos de empresa `DESCARTE`: `postagens`, `perfil`, `cadastro_postagens`, `editar_postagens`, `agendamento`.
3. Fluxos de empresa `COLETA`: `postagens`, `perfil`, `cadastro_postagens`, `editar_postagens`, `agendamento`, `mensagens`.
4. Fluxos administrativos: `admin_dashboard`, `admin_empresas`, `admin_publicacoes`, `admin_agendamentos`.
5. Regressão final automatizada com Playwright.

## Evidências mínimas por rodada

- screenshot ou gravação curta dos fluxos públicos.
- screenshot do perfil após reload com dados persistidos.
- screenshot de proposta criada em `agendamento.html`.
- screenshot do chat liberado após `CONFIRMADA`.
- screenshot das ações admin de bloqueio e moderação.
- resultado textual de `npm run test:e2e` ou `npm run test:e2e:docker`.