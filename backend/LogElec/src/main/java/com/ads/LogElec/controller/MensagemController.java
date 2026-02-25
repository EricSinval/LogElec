package com.ads.LogElec.controller;

import com.ads.LogElec.entity.Mensagem;
import com.ads.LogElec.service.MensagemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mensagens")
public class MensagemController {

    @Autowired
    private MensagemService mensagemService;

    @GetMapping
    public List<Mensagem> getAllMensagens() {
        return mensagemService.findAll();
    }

    @GetMapping("/agendamento/{agendamentoId}")
    public List<Mensagem> getMensagensByAgendamento(@PathVariable Long agendamentoId) {
        return mensagemService.findByAgendamentoId(agendamentoId);
    }

    @GetMapping("/empresa/{empresaId}")
    public List<Mensagem> getMensagensByEmpresa(@PathVariable Long empresaId) {
        return mensagemService.findByEmpresaId(empresaId);
    }

    @GetMapping("/contatos-confirmados/{empresaId}")
    public ResponseEntity<?> getContatosConfirmados(@PathVariable Long empresaId) {
        try {
            return ResponseEntity.ok(mensagemService.listarContatosConfirmados(empresaId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/conversa")
    public ResponseEntity<?> getConversaEntreEmpresas(@RequestParam Long empresaAId, @RequestParam Long empresaBId) {
        try {
            List<Mensagem> conversa = mensagemService.findConversaEntreEmpresas(empresaAId, empresaBId);
            return ResponseEntity.ok(conversa);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @GetMapping("/nao-lidas/{empresaId}")
    public List<Mensagem> getMensagensNaoLidas(@PathVariable Long empresaId) {
        return mensagemService.findMensagensNaoLidas(empresaId);
    }

    @PostMapping
    public ResponseEntity<?> createMensagem(@RequestBody Mensagem mensagem) {
        try {
            Long remetenteId = mensagem.getEmpresaRemetente() != null ? mensagem.getEmpresaRemetente().getId() : null;
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
    public ResponseEntity<?> enviarMensagem(@RequestBody Map<String, Object> body) {
        try {
            Long remetenteId = Long.valueOf(String.valueOf(body.get("remetenteId")));
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
    public ResponseEntity<Mensagem> marcarComoLida(@PathVariable Long id) {
        try {
            Mensagem mensagem = mensagemService.marcarComoLida(id);
            return ResponseEntity.ok(mensagem);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMensagem(@PathVariable Long id) {
        try {
            mensagemService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}