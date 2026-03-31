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

    
    @GetMapping
    public List<Agendamento> getAllAgendamentos() {
        return agendamentoService.findAll();
    }

    
    @GetMapping("/{id}")
    public ResponseEntity<Agendamento> getAgendamentoById(@PathVariable Long id) {
        try {
            Agendamento agendamento = agendamentoService.findById(id);
            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    
    @GetMapping("/solicitante/{empresaId}")
    public List<Agendamento> getAgendamentosBySolicitante(@PathVariable Long empresaId) {
        return agendamentoService.findByEmpresaSolicitante(empresaId);
    }

    
    @GetMapping("/coletora/{empresaId}")
    public List<Agendamento> getAgendamentosByColetora(@PathVariable Long empresaId) {
        return agendamentoService.findByEmpresaColetora(empresaId);
    }

    
    @GetMapping("/coletora/{empresaId}/pendentes")
    public List<Agendamento> getAgendamentosPendentesByColetora(@PathVariable Long empresaId) {
        return agendamentoService.findPendentesByEmpresaColetora(empresaId);
    }

    
    @GetMapping("/futuros")
    public List<Agendamento> getAgendamentosFuturos() {
        return agendamentoService.findAgendamentosFuturos();
    }

    
    @GetMapping("/postagem/{postagemId}")
    public List<Agendamento> getAgendamentosByPostagem(@PathVariable Long postagemId) {
        return agendamentoService.findByPostagem(postagemId);
    }

    
    @PostMapping
    public ResponseEntity<?> criarAgendamento(@RequestBody Map<String, Object> body) {
        try {
            
            System.out.println("[DEBUG] criarAgendamento - body: " + body);

            
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

    
    @PutMapping("/{id}/recusar")
    public ResponseEntity<?> recusarAgendamento(@PathVariable Long id) {
        try {
            Agendamento agendamento = agendamentoService.recusarAgendamento(id);
            return ResponseEntity.ok(agendamento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro interno do servidor");
        }
    }

    
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