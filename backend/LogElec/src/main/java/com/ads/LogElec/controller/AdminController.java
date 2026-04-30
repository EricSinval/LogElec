package com.ads.LogElec.controller;

import com.ads.LogElec.entity.Agendamento;
import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.PerfilAcesso;
import com.ads.LogElec.entity.Postagem;
import com.ads.LogElec.entity.StatusConta;
import com.ads.LogElec.entity.StatusModeracaoPostagem;
import com.ads.LogElec.security.EmpresaSessionPrincipal;
import com.ads.LogElec.repository.AgendamentoRepository;
import com.ads.LogElec.repository.EmpresaRepository;
import com.ads.LogElec.repository.MensagemRepository;
import com.ads.LogElec.repository.PostagemRepository;
import com.ads.LogElec.service.PostagemService;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final EmpresaRepository empresaRepository;
    private final PostagemRepository postagemRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final MensagemRepository mensagemRepository;
    private final PostagemService postagemService;

    public AdminController(
        EmpresaRepository empresaRepository,
        PostagemRepository postagemRepository,
        AgendamentoRepository agendamentoRepository,
        MensagemRepository mensagemRepository,
        PostagemService postagemService
    ) {
        this.empresaRepository = empresaRepository;
        this.postagemRepository = postagemRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.mensagemRepository = mensagemRepository;
        this.postagemService = postagemService;
    }

    @GetMapping("/resumo")
    public ResponseEntity<?> getResumo(@AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        Optional<Empresa> admin = validarAdministrador(principal);
        if (admin.isEmpty()) {
            return acessoNegado();
        }

        List<Empresa> empresas = empresaRepository.findAll();
        List<Postagem> postagens = postagemRepository.findAll();
        List<Agendamento> agendamentos = agendamentoRepository.findAll();

        long totalEmpresas = empresas.stream().filter(empresa -> empresa.getPerfilAcesso() != PerfilAcesso.ADMIN).count();
        long contasBloqueadas = empresas.stream().filter(empresa -> empresa.getStatusConta() == StatusConta.BLOQUEADA).count();
        long publicacoesPendentes = postagens.stream().filter(postagem -> postagem.getStatusModeracao() == StatusModeracaoPostagem.PENDENTE).count();
        long publicacoesBloqueadas = postagens.stream().filter(postagem -> postagem.getStatusModeracao() == StatusModeracaoPostagem.BLOQUEADA).count();

        Map<String, Object> resumo = new HashMap<>();
        resumo.put("totalEmpresas", totalEmpresas);
        resumo.put("contasBloqueadas", contasBloqueadas);
        resumo.put("totalPostagens", postagens.size());
        resumo.put("publicacoesPendentes", publicacoesPendentes);
        resumo.put("publicacoesBloqueadas", publicacoesBloqueadas);
        resumo.put("totalAgendamentos", agendamentos.size());

        return ResponseEntity.ok(resumo);
    }

    @GetMapping("/empresas")
    public ResponseEntity<?> getEmpresas(@AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        Optional<Empresa> admin = validarAdministrador(principal);
        if (admin.isEmpty()) {
            return acessoNegado();
        }

        List<Empresa> empresas = empresaRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
            .stream()
            .filter(empresa -> empresa.getPerfilAcesso() != PerfilAcesso.ADMIN)
            .toList();

        return ResponseEntity.ok(empresas);
    }

    @PutMapping("/empresas/{id}")
    public ResponseEntity<?> atualizarEmpresa(@PathVariable Long id, @AuthenticationPrincipal EmpresaSessionPrincipal principal, @RequestBody Map<String, Object> body) {
        if (principal == null) {
            return naoAutenticado();
        }

        Optional<Empresa> admin = validarAdministrador(principal);
        if (admin.isEmpty()) {
            return acessoNegado();
        }

        Optional<Empresa> empresaOpt = empresaRepository.findById(id);
        if (empresaOpt.isEmpty() || empresaOpt.get().getPerfilAcesso() == PerfilAcesso.ADMIN) {
            return ResponseEntity.notFound().build();
        }

        Empresa empresa = empresaOpt.get();

        if (body.containsKey("nome") && body.get("nome") != null) {
            empresa.setNome(body.get("nome").toString().trim());
        }
        if (body.containsKey("email") && body.get("email") != null) {
            String email = body.get("email").toString().trim();
            Optional<Empresa> existente = empresaRepository.findByEmail(email);
            if (existente.isPresent() && !existente.get().getId().equals(empresa.getId())) {
                return ResponseEntity.badRequest().body("Email já está em uso por outra conta.");
            }
            empresa.setEmail(email);
        }
        if (body.containsKey("telefone") && body.get("telefone") != null) {
            empresa.setTelefone(body.get("telefone").toString().trim());
        }
        if (body.containsKey("endereco") && body.get("endereco") != null) {
            empresa.setEndereco(body.get("endereco").toString().trim());
        }

        empresaRepository.save(empresa);
        return ResponseEntity.ok(empresa);
    }

    @PutMapping("/empresas/{id}/status")
    public ResponseEntity<?> atualizarStatusConta(@PathVariable Long id, @AuthenticationPrincipal EmpresaSessionPrincipal principal, @RequestBody Map<String, Object> body) {
        if (principal == null) {
            return naoAutenticado();
        }

        Optional<Empresa> admin = validarAdministrador(principal);
        if (admin.isEmpty()) {
            return acessoNegado();
        }

        Optional<Empresa> empresaOpt = empresaRepository.findById(id);
        if (empresaOpt.isEmpty() || empresaOpt.get().getPerfilAcesso() == PerfilAcesso.ADMIN) {
            return ResponseEntity.notFound().build();
        }

        if (!body.containsKey("statusConta") || body.get("statusConta") == null) {
            return ResponseEntity.badRequest().body("Informe o status da conta.");
        }

        Empresa empresa = empresaOpt.get();
        StatusConta novoStatus = StatusConta.valueOf(body.get("statusConta").toString().trim().toUpperCase());
        empresa.setStatusConta(novoStatus);
        empresaRepository.save(empresa);

        return ResponseEntity.ok(empresa);
    }

    @DeleteMapping("/empresas/{id}")
    public ResponseEntity<?> excluirEmpresa(@PathVariable Long id, @AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        Optional<Empresa> admin = validarAdministrador(principal);
        if (admin.isEmpty()) {
            return acessoNegado();
        }

        Optional<Empresa> empresaOpt = empresaRepository.findById(id);
        if (empresaOpt.isEmpty() || empresaOpt.get().getPerfilAcesso() == PerfilAcesso.ADMIN) {
            return ResponseEntity.notFound().build();
        }

        Empresa empresa = empresaOpt.get();

        if (!postagemRepository.findByEmpresaId(id).isEmpty()) {
            return ResponseEntity.status(409).body("Empresa possui postagens vinculadas e não pode ser removida.");
        }
        if (!agendamentoRepository.findByEmpresaSolicitante(empresa).isEmpty() || !agendamentoRepository.findByEmpresaColetora(empresa).isEmpty()) {
            return ResponseEntity.status(409).body("Empresa possui agendamentos vinculados e não pode ser removida.");
        }
        if (!mensagemRepository.findByEmpresaRemetenteIdOrEmpresaDestinatarioId(id, id).isEmpty()) {
            return ResponseEntity.status(409).body("Empresa possui mensagens vinculadas e não pode ser removida.");
        }

        empresaRepository.delete(empresa);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/postagens")
    public ResponseEntity<?> getPostagens(@AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        Optional<Empresa> admin = validarAdministrador(principal);
        if (admin.isEmpty()) {
            return acessoNegado();
        }

        List<Postagem> postagens = postagemRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(postagens);
    }

    @PutMapping("/postagens/{id}/moderar")
    public ResponseEntity<?> moderarPostagem(@PathVariable Long id, @AuthenticationPrincipal EmpresaSessionPrincipal principal, @RequestBody Map<String, Object> body) {
        if (principal == null) {
            return naoAutenticado();
        }

        Optional<Empresa> admin = validarAdministrador(principal);
        if (admin.isEmpty()) {
            return acessoNegado();
        }

        if (!body.containsKey("statusModeracao") || body.get("statusModeracao") == null) {
            return ResponseEntity.badRequest().body("Informe o status de moderação.");
        }

        StatusModeracaoPostagem statusModeracao = StatusModeracaoPostagem.valueOf(body.get("statusModeracao").toString().trim().toUpperCase());
        String motivo = body.get("motivoModeracao") == null ? null : body.get("motivoModeracao").toString().trim();

        try {
            Postagem postagem = postagemService.moderarPostagem(id, statusModeracao, motivo, admin.get().getNome());
            return ResponseEntity.ok(postagem);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/agendamentos")
    public ResponseEntity<?> getAgendamentos(@AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return naoAutenticado();
        }

        Optional<Empresa> admin = validarAdministrador(principal);
        if (admin.isEmpty()) {
            return acessoNegado();
        }

        List<Agendamento> agendamentos = agendamentoRepository.findAll(Sort.by(Sort.Direction.DESC, "dataHora"));
        return ResponseEntity.ok(agendamentos);
    }

    private Optional<Empresa> validarAdministrador(EmpresaSessionPrincipal principal) {
        return empresaRepository.findById(principal.getId())
            .filter(Empresa::isAdministrador)
            .filter(Empresa::isContaAtiva);
    }

    private ResponseEntity<String> naoAutenticado() {
        return ResponseEntity.status(401).body("Não autenticado.");
    }

    private ResponseEntity<String> acessoNegado() {
        return ResponseEntity.status(403).body("Acesso restrito ao administrador.");
    }
}