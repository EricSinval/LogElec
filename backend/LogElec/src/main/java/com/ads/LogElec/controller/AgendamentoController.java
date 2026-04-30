package com.ads.LogElec.controller;

import com.ads.LogElec.dto.AgendamentoDTO;
import com.ads.LogElec.entity.Agendamento;
import com.ads.LogElec.entity.Postagem;
import com.ads.LogElec.security.EmpresaSessionPrincipal;
import com.ads.LogElec.service.AgendamentoService;
import com.ads.LogElec.service.PostagemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;

@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {

    @Autowired
    private AgendamentoService agendamentoService;

    @Autowired
    private PostagemService postagemService;

    
    @GetMapping
    public ResponseEntity<?> getAllAgendamentos(@AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        if (!principal.isAdministrador()) {
            return acessoNegado("Acesso restrito ao administrador.");
        }

        return ResponseEntity.ok(agendamentoService.findAll());
    }

    
    @GetMapping("/{id}")
    public ResponseEntity<?> getAgendamentoById(@PathVariable Long id, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        try {
            Agendamento agendamento = agendamentoService.findById(id);

            if (!participaDoAgendamentoOuAdmin(principal, agendamento)) {
                return principal == null
                    ? naoAutenticado()
                    : acessoNegado("Acesso restrito aos participantes do agendamento.");
            }

            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/solicitante/me")
    public ResponseEntity<?> getMeusAgendamentosComoSolicitante(@AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        return ResponseEntity.ok(agendamentoService.findByEmpresaSolicitante(principal.getId()));
    }

    
    @GetMapping("/solicitante/{empresaId}")
    public ResponseEntity<?> getAgendamentosBySolicitante(@PathVariable Long empresaId, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (!podeAcessarEmpresa(principal, empresaId)) {
            return principal == null
                ? naoAutenticado()
                : acessoNegado("Acesso restrito aos seus próprios agendamentos.");
        }

        return ResponseEntity.ok(agendamentoService.findByEmpresaSolicitante(empresaId));
    }

    @GetMapping("/coletora/me")
    public ResponseEntity<?> getMeusAgendamentosComoColetora(@AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        return ResponseEntity.ok(agendamentoService.findByEmpresaColetora(principal.getId()));
    }

    
    @GetMapping("/coletora/{empresaId}")
    public ResponseEntity<?> getAgendamentosByColetora(@PathVariable Long empresaId, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (!podeAcessarEmpresa(principal, empresaId)) {
            return principal == null
                ? naoAutenticado()
                : acessoNegado("Acesso restrito aos seus próprios agendamentos.");
        }

        return ResponseEntity.ok(agendamentoService.findByEmpresaColetora(empresaId));
    }

    @GetMapping("/coletora/me/pendentes")
    public ResponseEntity<?> getMeusAgendamentosPendentesComoColetora(@AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        return ResponseEntity.ok(agendamentoService.findPendentesByEmpresaColetora(principal.getId()));
    }

    
    @GetMapping("/coletora/{empresaId}/pendentes")
    public ResponseEntity<?> getAgendamentosPendentesByColetora(@PathVariable Long empresaId, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (!podeAcessarEmpresa(principal, empresaId)) {
            return principal == null
                ? naoAutenticado()
                : acessoNegado("Acesso restrito aos seus próprios agendamentos.");
        }

        return ResponseEntity.ok(agendamentoService.findPendentesByEmpresaColetora(empresaId));
    }

    
    @GetMapping("/futuros")
    public ResponseEntity<?> getAgendamentosFuturos(@AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        if (!principal.isAdministrador()) {
            return acessoNegado("Acesso restrito ao administrador.");
        }

        return ResponseEntity.ok(agendamentoService.findAgendamentosFuturos());
    }

    @GetMapping("/postagem/{postagemId}/horarios-ocupados")
    public ResponseEntity<?> getHorariosOcupadosByPostagem(@PathVariable Long postagemId, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        try {
            List<Map<String, Object>> horariosOcupados = agendamentoService.findByPostagem(postagemId)
                .stream()
                .map(agendamento -> {
                    Map<String, Object> slot = new HashMap<>();
                    slot.put("id", agendamento.getId());
                    slot.put("dataHora", agendamento.getDataHora());
                    slot.put("status", agendamento.getStatus());
                    return slot;
                })
                .toList();

            return ResponseEntity.ok(horariosOcupados);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    
    @GetMapping("/postagem/{postagemId}")
    public ResponseEntity<?> getAgendamentosByPostagem(@PathVariable Long postagemId, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        try {
            Postagem postagem = postagemService.findById(postagemId)
                .orElseThrow(() -> new RuntimeException("Postagem não encontrada"));

            if (!podeAcessarPostagem(principal, postagem)) {
                return acessoNegado("Acesso restrito à empresa dona da postagem.");
            }

            return ResponseEntity.ok(agendamentoService.findByPostagem(postagemId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    
    @PostMapping
    public ResponseEntity<?> criarAgendamento(@RequestBody Map<String, Object> body, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        try {
            if (principal == null) {
                return naoAutenticado();
            }

            
            System.out.println("[DEBUG] criarAgendamento - body: " + body);

            
            Long postagemId = body.get("postagemId") == null ? null : Long.valueOf(String.valueOf(body.get("postagemId")));

            String dataStr = body.get("dataAgendamento") == null ? null : String.valueOf(body.get("dataAgendamento"));
            String horaStr = body.get("horaAgendamento") == null ? null : String.valueOf(body.get("horaAgendamento"));

            if (postagemId == null || dataStr == null || horaStr == null) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Parâmetros insuficientes para criar agendamento");
                return ResponseEntity.badRequest().body(err);
            }

            Postagem postagem = postagemService.findById(postagemId)
                .orElseThrow(() -> new RuntimeException("Postagem não encontrada"));

            if (postagem.getEmpresa() == null || postagem.getEmpresa().getId() == null) {
                throw new RuntimeException("A postagem informada não possui empresa responsável");
            }

            LocalDate data = LocalDate.parse(dataStr);
            LocalTime hora = LocalTime.parse(horaStr);

            AgendamentoDTO dto = new AgendamentoDTO();
            dto.setEmpresaSolicitanteId(principal.getId());
            dto.setEmpresaColetoraId(postagem.getEmpresa().getId());
            dto.setPostagemId(postagemId);
            dto.setDataAgendamento(data);
            dto.setHoraAgendamento(hora);
            dto.setObservacoes(body.get("observacoes") == null ? "" : String.valueOf(body.get("observacoes")));

            Agendamento agendamento = agendamentoService.criarAgendamento(dto);
            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> err = new HashMap<>();
            err.put("error", "Erro interno do servidor");
            return ResponseEntity.internalServerError().body(err);
        }
    }

    
    @PutMapping("/{id}/confirmar")
    public ResponseEntity<?> confirmarAgendamento(@PathVariable Long id, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        try {
            if (principal == null) {
                return naoAutenticado();
            }

            Agendamento agendamentoAtual = agendamentoService.findById(id);
            if (!ehEmpresaColetoraResponsavel(principal, agendamentoAtual)) {
                return acessoNegado("Apenas a empresa responsável pela coleta pode responder à proposta.");
            }

            Agendamento agendamento = agendamentoService.confirmarAgendamento(id);
            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro interno do servidor");
        }
    }

    
    @PutMapping("/{id}/recusar")
    public ResponseEntity<?> recusarAgendamento(@PathVariable Long id, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        try {
            if (principal == null) {
                return naoAutenticado();
            }

            Agendamento agendamentoAtual = agendamentoService.findById(id);
            if (!ehEmpresaColetoraResponsavel(principal, agendamentoAtual)) {
                return acessoNegado("Apenas a empresa responsável pela coleta pode responder à proposta.");
            }

            Agendamento agendamento = agendamentoService.recusarAgendamento(id);
            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro interno do servidor");
        }
    }

    
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelarAgendamento(@PathVariable Long id, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        try {
            if (principal == null) {
                return naoAutenticado();
            }

            Agendamento agendamentoAtual = agendamentoService.findById(id);
            if (!participaDoAgendamentoOuAdmin(principal, agendamentoAtual)) {
                return acessoNegado("Apenas participantes do agendamento podem cancelá-lo.");
            }

            Agendamento agendamento = agendamentoService.cancelarAgendamento(id);
            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro interno do servidor");
        }
    }


    
    @PutMapping("/{id}/concluir")
    public ResponseEntity<?> concluirAgendamento(@PathVariable Long id, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        try {
            if (principal == null) {
                return naoAutenticado();
            }

            Agendamento agendamentoAtual = agendamentoService.findById(id);
            if (!participaDoAgendamento(principal, agendamentoAtual)) {
                return acessoNegado("Apenas participantes do agendamento podem concluir a coleta.");
            }

            Agendamento agendamento = agendamentoService.concluirAgendamento(id, principal.getId());
            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro interno do servidor");
        }
    }

    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAgendamento(@PathVariable Long id, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        try {
            if (principal == null) {
                return naoAutenticado();
            }

            Agendamento agendamentoAtual = agendamentoService.findById(id);
            if (!participaDoAgendamentoOuAdmin(principal, agendamentoAtual)) {
                return acessoNegado("Apenas participantes do agendamento podem excluí-lo.");
            }

            agendamentoService.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro ao excluir agendamento");
        }
    }

    private boolean podeAcessarEmpresa(EmpresaSessionPrincipal principal, Long empresaId) {
        return principal != null
            && principal.getId() != null
            && (principal.isAdministrador() || principal.getId().equals(empresaId));
    }

    private boolean podeAcessarPostagem(EmpresaSessionPrincipal principal, Postagem postagem) {
        return principal != null
            && postagem.getEmpresa() != null
            && postagem.getEmpresa().getId() != null
            && (principal.isAdministrador() || principal.getId().equals(postagem.getEmpresa().getId()));
    }

    private boolean participaDoAgendamento(EmpresaSessionPrincipal principal, Agendamento agendamento) {
        return principal != null
            && principal.getId() != null
            && (
                (agendamento.getEmpresaSolicitante() != null && principal.getId().equals(agendamento.getEmpresaSolicitante().getId()))
                    || (agendamento.getEmpresaColetora() != null && principal.getId().equals(agendamento.getEmpresaColetora().getId()))
            );
    }

    private boolean participaDoAgendamentoOuAdmin(EmpresaSessionPrincipal principal, Agendamento agendamento) {
        return principal != null && (principal.isAdministrador() || participaDoAgendamento(principal, agendamento));
    }

    private boolean ehEmpresaColetoraResponsavel(EmpresaSessionPrincipal principal, Agendamento agendamento) {
        return principal != null
            && principal.getId() != null
            && agendamento.getEmpresaColetora() != null
            && principal.getId().equals(agendamento.getEmpresaColetora().getId());
    }

    private ResponseEntity<String> naoAutenticado() {
        return ResponseEntity.status(401).body("Não autenticado.");
    }

    private ResponseEntity<String> acessoNegado(String mensagem) {
        return ResponseEntity.status(403).body(mensagem);
    }
}