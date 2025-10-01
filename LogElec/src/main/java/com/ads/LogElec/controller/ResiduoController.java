package com.ads.LogElec.controller;

import com.ads.LogElec.dto.CadastroResiduoDTO;
import com.ads.LogElec.entity.Residuo;
import com.ads.LogElec.service.ResiduoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/residuos")
public class ResiduoController {

    @Autowired
    private ResiduoService residuoService;

    @GetMapping
    public List<Residuo> getAllResiduos() {
        return residuoService.findAll();
    }
    
    @GetMapping("/empresa/{empresaId}")
    public List<Residuo> getResiduosByEmpresa(@PathVariable Long empresaId) {
        return residuoService.findByEmpresa(empresaId);
    }
    
    @GetMapping("/pendentes")
    public List<Residuo> getResiduosPendentes() {
        return residuoService.findPendentes();
    }

    @GetMapping("/disponiveis")
    public List<Residuo> getResiduosDisponiveis() {
        return residuoService.findPendentes();
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> cadastrarResiduo(@ModelAttribute CadastroResiduoDTO cadastroDTO) {
        try {
            Residuo residuo = residuoService.cadastrarResiduo(cadastroDTO);
            return ResponseEntity.ok(residuo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno do servidor");
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Residuo> getResiduoById(@PathVariable Long id) {
        try {
            Residuo residuo = residuoService.findById(id);
            return ResponseEntity.ok(residuo);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResiduo(@PathVariable Long id) {
        try {
            residuoService.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao excluir resíduo");
        }
    }
}