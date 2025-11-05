package com.ads.LogElec.controller;

import com.ads.LogElec.entity.Mensagem;
import com.ads.LogElec.service.MensagemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/nao-lidas/{empresaId}")
    public List<Mensagem> getMensagensNaoLidas(@PathVariable Long empresaId) {
        return mensagemService.findMensagensNaoLidas(empresaId);
    }

    @PostMapping
    public Mensagem createMensagem(@RequestBody Mensagem mensagem) {
        return mensagemService.save(mensagem);
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