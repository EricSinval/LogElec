package com.ads.LogElec.controller;

import com.ads.LogElec.dto.AgendamentoDTO;
import com.ads.LogElec.entity.Agendamento;
import com.ads.LogElec.service.AgendamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {

    @Autowired
    private AgendamentoService agendamentoService;

    // ✅ GET - LISTAR TODOS OS AGENDAMENTOS
    @GetMapping
    public List<Agendamento> getAllAgendamentos() {
        return agendamentoService.findAll();
    }

    // ✅ GET - BUSCAR AGENDAMENTO POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Agendamento> getAgendamentoById(@PathVariable Long id) {
        try {
            Agendamento agendamento = agendamentoService.findById(id);
            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ GET - AGENDAMENTOS POR EMPRESA SOLICITANTE
    @GetMapping("/solicitante/{empresaId}")
    public List<Agendamento> getAgendamentosBySolicitante(@PathVariable Long empresaId) {
        return agendamentoService.findByEmpresaSolicitante(empresaId);
    }

    // ✅ GET - AGENDAMENTOS POR EMPRESA COLETORA
    @GetMapping("/coletora/{empresaId}")
    public List<Agendamento> getAgendamentosByColetora(@PathVariable Long empresaId) {
        return agendamentoService.findByEmpresaColetora(empresaId);
    }

    // ✅ GET - AGENDAMENTOS PENDENTES PARA UMA EMPRESA COLETORA
    @GetMapping("/coletora/{empresaId}/pendentes")
    public List<Agendamento> getAgendamentosPendentesByColetora(@PathVariable Long empresaId) {
        return agendamentoService.findPendentesByEmpresaColetora(empresaId);
    }

    // ✅ GET - AGENDAMENTOS FUTUROS
    @GetMapping("/futuros")
    public List<Agendamento> getAgendamentosFuturos() {
        return agendamentoService.findAgendamentosFuturos();
    }

    // ✅ POST - CRIAR NOVO AGENDAMENTO
    @PostMapping
    public ResponseEntity<?> criarAgendamento(@RequestBody AgendamentoDTO agendamentoDTO) {
        try {
            Agendamento agendamento = agendamentoService.criarAgendamento(agendamentoDTO);
            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro interno do servidor");
        }
    }

    // ✅ PUT - CONFIRMAR AGENDAMENTO
    @PutMapping("/{id}/confirmar")
    public ResponseEntity<?> confirmarAgendamento(@PathVariable Long id) {
        try {
            Agendamento agendamento = agendamentoService.confirmarAgendamento(id);
            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro interno do servidor");
        }
    }

    // ✅ PUT - CANCELAR AGENDAMENTO
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelarAgendamento(@PathVariable Long id) {
        try {
            Agendamento agendamento = agendamentoService.cancelarAgendamento(id);
            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro interno do servidor");
        }
    }


    // ✅ PUT - CONCLUIR AGENDAMENTO
    @PutMapping("/{id}/concluir")
    public ResponseEntity<?> concluirAgendamento(@PathVariable Long id) {
        try {
            Agendamento agendamento = agendamentoService.concluirAgendamento(id);
            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro interno do servidor");
        }
    }

    // ✅ DELETE - EXCLUIR AGENDAMENTO
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAgendamento(@PathVariable Long id) {
        try {
            agendamentoService.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro ao excluir agendamento");
        }
    }
}