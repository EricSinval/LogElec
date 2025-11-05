package com.ads.LogElec.controller;

import com.ads.LogElec.entity.Agendamento;
import com.ads.LogElec.service.AgendamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {

    @Autowired
    private AgendamentoService agendamentoService;

    @GetMapping
    public List<Agendamento> getAllAgendamentos() {
        return agendamentoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Agendamento> getAgendamentoById(@PathVariable Long id) {
        Optional<Agendamento> agendamento = agendamentoService.findById(id);
        return agendamento.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/solicitante/{empresaId}")
    public List<Agendamento> getAgendamentosBySolicitante(@PathVariable Long empresaId) {
        return agendamentoService.findByEmpresaSolicitanteId(empresaId);
    }

    @GetMapping("/coletor/{empresaId}")
    public List<Agendamento> getAgendamentosByColetor(@PathVariable Long empresaId) {
        return agendamentoService.findByEmpresaColetoraId(empresaId);
    }

    @GetMapping("/status/{status}")
    public List<Agendamento> getAgendamentosByStatus(@PathVariable String status) {
        return agendamentoService.findByStatus(status);
    }

    @GetMapping("/postagem/{postagemId}")
    public List<Agendamento> getAgendamentosByPostagem(@PathVariable Long postagemId) {
        return agendamentoService.findByPostagemId(postagemId);
    }

    @PostMapping
    public Agendamento createAgendamento(@RequestBody Agendamento agendamento) {
        return agendamentoService.save(agendamento);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Agendamento> updateAgendamento(@PathVariable Long id, @RequestBody Agendamento agendamentoDetails) {
        try {
            Agendamento updatedAgendamento = agendamentoService.update(id, agendamentoDetails);
            return ResponseEntity.ok(updatedAgendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAgendamento(@PathVariable Long id) {
        try {
            agendamentoService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}