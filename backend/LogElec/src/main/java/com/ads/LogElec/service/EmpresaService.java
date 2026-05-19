
package com.ads.LogElec.service;

import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.PerfilAcesso;
import com.ads.LogElec.entity.StatusAgendamento;
import com.ads.LogElec.entity.StatusConta;
import com.ads.LogElec.entity.TipoEmpresa;
import com.ads.LogElec.repository.AgendamentoRepository;
import com.ads.LogElec.repository.EmpresaRepository;
import com.ads.LogElec.repository.MensagemRepository;
import com.ads.LogElec.repository.PostagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@Service
@Validated
public class EmpresaService {

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private PostagemRepository postagemRepository;

    @Autowired
    private AgendamentoRepository agendamentoRepository;

    @Autowired
    private MensagemRepository mensagemRepository;

    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public List<Empresa> findAll() {
        return empresaRepository.findAll();
    }

    public Optional<Empresa> findById(Long id) {
        return empresaRepository.findById(id);
    }

    public Optional<Empresa> findByEmail(String email) {
        return empresaRepository.findByEmail(email);
    }

    public List<Empresa> findByTipo(String tipo) {
        return empresaRepository.findByTipo(TipoEmpresa.valueOf(tipo.toUpperCase()));
    }

    public Empresa createEmpresa(@Valid Empresa empresa) {
        if (empresa.getPerfilAcesso() == null) {
            empresa.setPerfilAcesso(PerfilAcesso.EMPRESA);
        }

        if (empresa.getStatusConta() == null) {
            empresa.setStatusConta(StatusConta.ATIVA);
        }

        
        if (empresaRepository.findByEmail(empresa.getEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }
        
        
        if (empresaRepository.findByCnpj(empresa.getCnpj()).isPresent()) {
            throw new RuntimeException("CNPJ já cadastrado");
        }
        
        
        if (!empresa.isCnpjValido()) {
            throw new RuntimeException("CNPJ inválido");
        }
        
        
        if (empresa.getSenha().length() < 6) {
            throw new RuntimeException("Senha deve ter no mínimo 6 caracteres");
        }
        
        
        String senhaHash = passwordEncoder.encode(empresa.getSenha());
        empresa.setSenha(senhaHash);
        
        return empresaRepository.save(empresa);
    }

    
    public boolean verificarSenha(Empresa empresa, String senhaFornecida) {
        return passwordEncoder.matches(senhaFornecida, empresa.getSenha());
    }

    
    public void atualizarSenha(Empresa empresa, String novaSenha) {
        if (novaSenha.length() < 6) {
            throw new RuntimeException("Senha deve ter no mínimo 6 caracteres");
        }
        String senhaHash = passwordEncoder.encode(novaSenha);
        empresa.setSenha(senhaHash);
    }

    @Transactional
    public void excluirEmpresaSemVinculosAtivos(Empresa empresa) {
        Long empresaId = empresa.getId();

        if (!postagemRepository.findByEmpresaId(empresaId).isEmpty()) {
            throw new RuntimeException("Empresa possui postagens vinculadas e não pode ser removida.");
        }

        if (agendamentoRepository.existsByEmpresaIdAndStatusIn(
                empresaId,
                List.of(StatusAgendamento.AGENDADA, StatusAgendamento.CONFIRMADA))) {
            throw new RuntimeException("Empresa possui agendamentos ativos vinculados e não pode ser removida.");
        }

        mensagemRepository.deleteByEmpresaRemetenteIdOrEmpresaDestinatarioId(empresaId, empresaId);
        agendamentoRepository.deleteByEmpresaSolicitanteIdOrEmpresaColetoraId(empresaId, empresaId);
        empresaRepository.delete(empresa);
    }
}