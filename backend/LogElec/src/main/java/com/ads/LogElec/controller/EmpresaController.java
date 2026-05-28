package com.ads.LogElec.controller;

import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.TipoEmpresa;
import com.ads.LogElec.repository.EmpresaRepository;
import com.ads.LogElec.security.EmpresaSessionPrincipal;
import com.ads.LogElec.service.EmpresaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    
    @PostMapping
    public ResponseEntity<?> createEmpresa(@RequestBody Empresa empresa) {
        try {
            System.out.println("📥 Recebendo cadastro de empresa: " + empresa.getEmail());
            
            
            if (!empresa.isValido()) {
                String mensagensErro = empresa.getMensagensErro();
                System.out.println("❌ Validação falhou: " + mensagensErro);
                return ResponseEntity.badRequest().body(mensagensErro);
            }
            
            
            if (empresaRepository.findByEmail(empresa.getEmail()).isPresent()) {
                System.out.println("❌ Email já cadastrado: " + empresa.getEmail());
                return ResponseEntity.badRequest().body("Email já cadastrado");
            }
            
            
            if (empresaRepository.findByCnpj(empresa.getCnpj()).isPresent()) {
                System.out.println("❌ CNPJ já cadastrado: " + empresa.getCnpj());
                return ResponseEntity.badRequest().body("CNPJ já cadastrado");
            }
            
            
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

    @GetMapping("/me")
    public ResponseEntity<?> getEmpresaLogada(@AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        return empresaRepository.findById(principal.getId())
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmpresa(@PathVariable Long id, @AuthenticationPrincipal EmpresaSessionPrincipal principal, @RequestBody java.util.Map<String, Object> dadosAtualizados) {
        try {
            if (principal == null) {
                return naoAutenticado();
            }

            if (!podeGerenciarEmpresa(principal, id)) {
                return acessoNegado("Você só pode atualizar a sua própria conta.");
            }

            System.out.println("📥 Recebendo atualização de empresa ID: " + id);
            System.out.println("📋 Dados recebidos: " + dadosAtualizados);
            
            Optional<Empresa> empresaOpt = empresaRepository.findById(id);
            if (!empresaOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Empresa empresa = empresaOpt.get();
            
            
            if (dadosAtualizados.containsKey("email")) {
                String novoEmail = (String) dadosAtualizados.get("email");
                
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
            
            
            if (dadosAtualizados.containsKey("senhaAtual") && dadosAtualizados.containsKey("novaSenha")) {
                String senhaAtual = (String) dadosAtualizados.get("senhaAtual");
                String novaSenha = (String) dadosAtualizados.get("novaSenha");
                
                
                if (!empresaService.verificarSenha(empresa, senhaAtual)) {
                    return ResponseEntity.badRequest().body("Senha atual incorreta");
                }
                
                
                empresaService.atualizarSenha(empresa, novaSenha);
            }
            
            
            Empresa empresaAtualizada = empresaRepository.save(empresa);
            System.out.println("✅ Empresa atualizada com sucesso: " + empresaAtualizada.getId());
            
            return ResponseEntity.ok(empresaAtualizada);
            
        } catch (Exception e) {
            System.out.println("💥 Erro ao atualizar empresa: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao atualizar empresa: " + e.getMessage());
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMinhaEmpresa(@AuthenticationPrincipal EmpresaSessionPrincipal principal, @RequestBody java.util.Map<String, Object> dadosAtualizados) {
        if (principal == null) {
            return naoAutenticado();
        }

        return updateEmpresa(principal.getId(), principal, dadosAtualizados);
    }

    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmpresa(@PathVariable Long id, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        if (!podeGerenciarEmpresa(principal, id)) {
            return acessoNegado("Você só pode excluir a sua própria conta.");
        }

        Optional<Empresa> empresaOpt = empresaRepository.findById(id);
        if (!empresaOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Empresa empresa = empresaOpt.get();

        try {
            empresaService.excluirEmpresaSemVinculosAtivos(empresa);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMinhaEmpresa(@AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        return deleteEmpresa(principal.getId(), principal);
    }

    private boolean podeGerenciarEmpresa(EmpresaSessionPrincipal principal, Long empresaId) {
        return principal != null
            && principal.getId() != null
            && (principal.isAdministrador() || principal.getId().equals(empresaId));
    }

    private ResponseEntity<String> naoAutenticado() {
        return ResponseEntity.status(401).body("Não autenticado.");
    }

    private ResponseEntity<String> acessoNegado(String mensagem) {
        return ResponseEntity.status(403).body(mensagem);
    }
}