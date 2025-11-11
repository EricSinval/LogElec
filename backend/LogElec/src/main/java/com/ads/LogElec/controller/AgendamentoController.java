package com.ads.LogElec.controller;

import com.ads.LogElec.dto.AgendamentoDTO;
import com.ads.LogElec.entity.Agendamento;
import com.ads.LogElec.service.AgendamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    // ✅ GET - AGENDAMENTOS POR POSTAGEM
    @GetMapping("/postagem/{postagemId}")
    public List<Agendamento> getAgendamentosByPostagem(@PathVariable Long postagemId) {
        return agendamentoService.findByPostagem(postagemId);
    }

    // ✅ POST - CRIAR NOVO AGENDAMENTO
    @PostMapping
    public ResponseEntity<?> criarAgendamento(@RequestBody Map<String, Object> body) {
        try {
            // Log/inspeciona o payload recebido para ajudar debug
            System.out.println("[DEBUG] criarAgendamento - body: " + body);

            // Fazer binding defensivo: aceitar strings e converter para os tipos esperados
            Long empresaSolicitanteId = body.get("empresaSolicitanteId") == null ? null : Long.valueOf(String.valueOf(body.get("empresaSolicitanteId")));
            Long empresaColetoraId = body.get("empresaColetoraId") == null ? null : Long.valueOf(String.valueOf(body.get("empresaColetoraId")));
            Long postagemId = body.get("postagemId") == null ? null : Long.valueOf(String.valueOf(body.get("postagemId")));

            String dataStr = body.get("dataAgendamento") == null ? null : String.valueOf(body.get("dataAgendamento"));
            String horaStr = body.get("horaAgendamento") == null ? null : String.valueOf(body.get("horaAgendamento"));

            if (empresaSolicitanteId == null || empresaColetoraId == null || postagemId == null || dataStr == null || horaStr == null) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Parâmetros insuficientes para criar agendamento");
                return ResponseEntity.badRequest().body(err);
            }

            LocalDate data = LocalDate.parse(dataStr);
            LocalTime hora = LocalTime.parse(horaStr);

            AgendamentoDTO dto = new AgendamentoDTO();
            dto.setEmpresaSolicitanteId(empresaSolicitanteId);
            dto.setEmpresaColetoraId(empresaColetoraId);
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