package com.ads.LogElec.controller;

import com.ads.LogElec.entity.Agendamento;
import com.ads.LogElec.entity.Mensagem;
import com.ads.LogElec.security.EmpresaSessionPrincipal;
import com.ads.LogElec.service.AgendamentoService;
import com.ads.LogElec.service.MensagemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mensagens")
public class MensagemController {

    @Autowired
    private MensagemService mensagemService;

    @Autowired
    private AgendamentoService agendamentoService;

    @GetMapping
    public ResponseEntity<?> getAllMensagens(@AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        if (!principal.isAdministrador()) {
            return acessoNegado("Acesso restrito ao administrador.");
        }

        return ResponseEntity.ok(mensagemService.findAll());
    }

    @GetMapping("/agendamento/{agendamentoId}")
    public ResponseEntity<?> getMensagensByAgendamento(@PathVariable Long agendamentoId, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        try {
            Agendamento agendamento = agendamentoService.findById(agendamentoId);
            if (!participaDoAgendamentoOuAdmin(principal, agendamento)) {
                return principal == null
                    ? naoAutenticado()
                    : acessoNegado("Acesso restrito aos participantes do agendamento.");
            }

            return ResponseEntity.ok(mensagemService.findByAgendamentoId(agendamentoId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/empresa/me")
    public ResponseEntity<?> getMensagensDaSessao(@AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        return ResponseEntity.ok(mensagemService.findByEmpresaId(principal.getId()));
    }

    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<?> getMensagensByEmpresa(@PathVariable Long empresaId, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (!podeAcessarEmpresa(principal, empresaId)) {
            return principal == null
                ? naoAutenticado()
                : acessoNegado("Acesso restrito às mensagens da sua própria empresa.");
        }

        return ResponseEntity.ok(mensagemService.findByEmpresaId(empresaId));
    }

    @GetMapping("/contatos-confirmados/me")
    public ResponseEntity<?> getMeusContatosConfirmados(@AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        try {
            return ResponseEntity.ok(mensagemService.listarContatosConfirmados(principal.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/contatos-confirmados/{empresaId}")
    public ResponseEntity<?> getContatosConfirmados(@PathVariable Long empresaId, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (!podeAcessarEmpresa(principal, empresaId)) {
            return principal == null
                ? naoAutenticado()
                : acessoNegado("Acesso restrito aos contatos da sua própria empresa.");
        }

        try {
            return ResponseEntity.ok(mensagemService.listarContatosConfirmados(empresaId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/conversa/{outraEmpresaId}")
    public ResponseEntity<?> getConversaDaSessao(@PathVariable Long outraEmpresaId, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        return buscarConversa(principal, principal.getId(), outraEmpresaId);
    }

    @GetMapping("/conversa")
    public ResponseEntity<?> getConversaEntreEmpresas(@RequestParam Long empresaAId, @RequestParam Long empresaBId, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        return buscarConversa(principal, empresaAId, empresaBId);
    }

    private ResponseEntity<?> buscarConversa(EmpresaSessionPrincipal principal, Long empresaAId, Long empresaBId) {
        try {
            if (principal == null) {
                return naoAutenticado();
            }

            if (!principal.isAdministrador() && !principal.getId().equals(empresaAId) && !principal.getId().equals(empresaBId)) {
                return acessoNegado("Você só pode acessar conversas da sua própria empresa.");
            }

            List<Mensagem> conversa = mensagemService.findConversaEntreEmpresas(empresaAId, empresaBId);
            return ResponseEntity.ok(conversa);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @GetMapping("/nao-lidas/me")
    public ResponseEntity<?> getMinhasMensagensNaoLidas(@AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        return ResponseEntity.ok(mensagemService.findMensagensNaoLidas(principal.getId()));
    }

    @GetMapping("/nao-lidas/{empresaId}")
    public ResponseEntity<?> getMensagensNaoLidas(@PathVariable Long empresaId, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (!podeAcessarEmpresa(principal, empresaId)) {
            return principal == null
                ? naoAutenticado()
                : acessoNegado("Acesso restrito às mensagens da sua própria empresa.");
        }

        return ResponseEntity.ok(mensagemService.findMensagensNaoLidas(empresaId));
    }

    @PostMapping
    public ResponseEntity<?> createMensagem(@RequestBody Mensagem mensagem, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        try {
            if (principal == null) {
                return naoAutenticado();
            }

            Long remetenteId = principal.getId();
            Long destinatarioId = mensagem.getEmpresaDestinatario() != null ? mensagem.getEmpresaDestinatario().getId() : null;

            if (remetenteId == null || destinatarioId == null) {
                return ResponseEntity.badRequest().body("Remetente e destinatário são obrigatórios");
            }

            Mensagem enviada = mensagemService.enviarMensagem(remetenteId, destinatarioId, mensagem.getConteudo());
            return ResponseEntity.ok(enviada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/enviar")
    public ResponseEntity<?> enviarMensagem(@RequestBody Map<String, Object> body, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        try {
            if (principal == null) {
                return naoAutenticado();
            }

            Long remetenteId = principal.getId();
            Long destinatarioId = Long.valueOf(String.valueOf(body.get("destinatarioId")));
            String conteudo = body.get("conteudo") == null ? "" : String.valueOf(body.get("conteudo"));

            Mensagem mensagem = mensagemService.enviarMensagem(remetenteId, destinatarioId, conteudo);
            return ResponseEntity.ok(mensagem);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro interno ao enviar mensagem");
        }
    }

    @PutMapping("/{id}/ler")
    public ResponseEntity<?> marcarComoLida(@PathVariable Long id, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        try {
            if (principal == null) {
                return naoAutenticado();
            }

            Mensagem mensagemAtual = mensagemService.findById(id).orElseThrow(() -> new RuntimeException("Mensagem não encontrada"));
            if (!podeMarcarComoLida(principal, mensagemAtual)) {
                return acessoNegado("Apenas o destinatário pode marcar a mensagem como lida.");
            }

            Mensagem mensagem = mensagemService.marcarComoLida(id);
            return ResponseEntity.ok(mensagem);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMensagem(@PathVariable Long id, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        try {
            if (principal == null) {
                return naoAutenticado();
            }

            Mensagem mensagemAtual = mensagemService.findById(id).orElseThrow(() -> new RuntimeException("Mensagem não encontrada"));
            if (!participaDaMensagemOuAdmin(principal, mensagemAtual)) {
                return acessoNegado("Apenas participantes da mensagem podem excluí-la.");
            }

            mensagemService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private boolean podeAcessarEmpresa(EmpresaSessionPrincipal principal, Long empresaId) {
        return principal != null
            && principal.getId() != null
            && (principal.isAdministrador() || principal.getId().equals(empresaId));
    }

    private boolean participaDoAgendamentoOuAdmin(EmpresaSessionPrincipal principal, Agendamento agendamento) {
        if (principal == null) {
            return false;
        }

        return principal.isAdministrador()
            || ((agendamento.getEmpresaSolicitante() != null && principal.getId().equals(agendamento.getEmpresaSolicitante().getId()))
                || (agendamento.getEmpresaColetora() != null && principal.getId().equals(agendamento.getEmpresaColetora().getId())));
    }

    private boolean participaDaMensagemOuAdmin(EmpresaSessionPrincipal principal, Mensagem mensagem) {
        if (principal == null) {
            return false;
        }

        return principal.isAdministrador()
            || ((mensagem.getEmpresaRemetente() != null && principal.getId().equals(mensagem.getEmpresaRemetente().getId()))
                || (mensagem.getEmpresaDestinatario() != null && principal.getId().equals(mensagem.getEmpresaDestinatario().getId())));
    }

    private boolean podeMarcarComoLida(EmpresaSessionPrincipal principal, Mensagem mensagem) {
        return principal != null
            && (principal.isAdministrador()
                || (mensagem.getEmpresaDestinatario() != null && principal.getId().equals(mensagem.getEmpresaDestinatario().getId())));
    }

    private ResponseEntity<String> naoAutenticado() {
        return ResponseEntity.status(401).body("Não autenticado.");
    }

    private ResponseEntity<String> acessoNegado(String mensagem) {
        return ResponseEntity.status(403).body(mensagem);
    }
}