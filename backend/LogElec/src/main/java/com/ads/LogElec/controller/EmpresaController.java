package com.ads.LogElec.controller;

import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.TipoEmpresa;
import com.ads.LogElec.repository.AgendamentoRepository;
import com.ads.LogElec.repository.EmpresaRepository;
import com.ads.LogElec.repository.MensagemRepository;
import com.ads.LogElec.repository.PostagemRepository;
import com.ads.LogElec.service.EmpresaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/empresas")
@CrossOrigin(
    origins = {
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    },
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowCredentials = "true"
)
public class EmpresaController {

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private EmpresaService empresaService;

    @Autowired
    private PostagemRepository postagemRepository;

    @Autowired
    private AgendamentoRepository agendamentoRepository;

    @Autowired
    private MensagemRepository mensagemRepository;

    
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

    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmpresa(@PathVariable Long id) {
        Optional<Empresa> empresaOpt = empresaRepository.findById(id);
        if (!empresaOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Empresa empresa = empresaOpt.get();

        if (!postagemRepository.findByEmpresaId(id).isEmpty()) {
            return ResponseEntity.status(409).body("Empresa possui postagens vinculadas e não pode ser removida.");
        }
        if (!agendamentoRepository.findByEmpresaSolicitante(empresa).isEmpty() ||
                !agendamentoRepository.findByEmpresaColetora(empresa).isEmpty()) {
            return ResponseEntity.status(409).body("Empresa possui agendamentos vinculados e não pode ser removida.");
        }
        if (!mensagemRepository.findByEmpresaRemetenteIdOrEmpresaDestinatarioId(id, id).isEmpty()) {
            return ResponseEntity.status(409).body("Empresa possui mensagens vinculadas e não pode ser removida.");
        }

        empresaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}