package com.ads.LogElec.controller;

import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.TipoEmpresa;
import com.ads.LogElec.repository.EmpresaRepository;
import com.ads.LogElec.service.EmpresaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/empresas")
public class EmpresaController {

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private EmpresaService empresaService;

    // ✅ MÉTODO CADASTRAR EMPRESA COM VALIDAÇÕES
    @PostMapping
    public ResponseEntity<?> createEmpresa(@RequestBody Empresa empresa) {
        try {
            System.out.println("📥 Recebendo cadastro de empresa: " + empresa.getEmail());
            
            // ✅ VALIDAÇÃO 1: Campos obrigatórios
            if (!empresa.isValido()) {
                String mensagensErro = empresa.getMensagensErro();
                System.out.println("❌ Validação falhou: " + mensagensErro);
                return ResponseEntity.badRequest().body(mensagensErro);
            }
            
            // ✅ VALIDAÇÃO 2: Email único
            if (empresaRepository.findByEmail(empresa.getEmail()).isPresent()) {
                System.out.println("❌ Email já cadastrado: " + empresa.getEmail());
                return ResponseEntity.badRequest().body("Email já cadastrado");
            }
            
            // ✅ VALIDAÇÃO 3: CNPJ único  
            if (empresaRepository.findByCnpj(empresa.getCnpj()).isPresent()) {
                System.out.println("❌ CNPJ já cadastrado: " + empresa.getCnpj());
                return ResponseEntity.badRequest().body("CNPJ já cadastrado");
            }
            
            // ✅ VALIDAÇÃO 4: Usar o Service para criar a empresa
            Empresa novaEmpresa = empresaService.createEmpresa(empresa);
            System.out.println("✅ Empresa cadastrada com sucesso: " + novaEmpresa.getId());
            
            return ResponseEntity.ok(novaEmpresa);
            
        } catch (RuntimeException e) {
            System.out.println("❌ Erro no cadastro: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.out.println("💥 Erro interno: " + e.getMessage());
            return ResponseEntity.status(500).body("Erro interno do servidor: " + e.getMessage());
        }
    }

    // ✅ MÉTODOS EXISTENTES (mantenha esses)
    @GetMapping("/email/{email}")
    public ResponseEntity<Empresa> getEmpresaByEmail(@PathVariable String email) {
        Optional<Empresa> empresa = empresaRepository.findByEmail(email);
        return empresa.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<Empresa> getAllEmpresas() {
        return empresaRepository.findAll();
    }

    @GetMapping("/coletoras")
    public List<Empresa> getEmpresasColetoras() {
        return empresaRepository.findByTipo(TipoEmpresa.COLETA);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Empresa> getEmpresaById(@PathVariable Long id) {
        Optional<Empresa> empresa = empresaRepository.findById(id);
        return empresa.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }
}