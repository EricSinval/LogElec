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

    // ✅ ATUALIZAR DADOS DA EMPRESA (PERFIL)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmpresa(@PathVariable Long id, @RequestBody java.util.Map<String, Object> dadosAtualizados) {
        try {
            System.out.println("📥 Recebendo atualização de empresa ID: " + id);
            System.out.println("📋 Dados recebidos: " + dadosAtualizados);
            
            Optional<Empresa> empresaOpt = empresaRepository.findById(id);
            if (!empresaOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Empresa empresa = empresaOpt.get();
            
            // Atualizar campos permitidos
            if (dadosAtualizados.containsKey("email")) {
                String novoEmail = (String) dadosAtualizados.get("email");
                // Verificar se o email não está sendo usado por outra empresa
                Optional<Empresa> emailExistente = empresaRepository.findByEmail(novoEmail);
                if (emailExistente.isPresent() && !emailExistente.get().getId().equals(id)) {
                    return ResponseEntity.badRequest().body("Email já está em uso por outra empresa");
                }
                empresa.setEmail(novoEmail);
            }
            
            if (dadosAtualizados.containsKey("telefone")) {
                empresa.setTelefone((String) dadosAtualizados.get("telefone"));
            }
            
            if (dadosAtualizados.containsKey("endereco")) {
                empresa.setEndereco((String) dadosAtualizados.get("endereco"));
            }
            
            // Verificar se há alteração de senha
            if (dadosAtualizados.containsKey("senhaAtual") && dadosAtualizados.containsKey("novaSenha")) {
                String senhaAtual = (String) dadosAtualizados.get("senhaAtual");
                String novaSenha = (String) dadosAtualizados.get("novaSenha");
                
                // Verificar senha atual
                if (!empresaService.verificarSenha(empresa, senhaAtual)) {
                    return ResponseEntity.badRequest().body("Senha atual incorreta");
                }
                
                // Atualizar senha usando o service para hash correto
                empresaService.atualizarSenha(empresa, novaSenha);
            }
            
            // Salvar empresa atualizada
            Empresa empresaAtualizada = empresaRepository.save(empresa);
            System.out.println("✅ Empresa atualizada com sucesso: " + empresaAtualizada.getId());
            
            return ResponseEntity.ok(empresaAtualizada);
            
        } catch (Exception e) {
            System.out.println("💥 Erro ao atualizar empresa: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao atualizar empresa: " + e.getMessage());
        }
    }
}