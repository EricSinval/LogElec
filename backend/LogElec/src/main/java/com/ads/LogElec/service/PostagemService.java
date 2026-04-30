package com.ads.LogElec.service;

import com.ads.LogElec.entity.Postagem;
import com.ads.LogElec.entity.StatusModeracaoPostagem;
import com.ads.LogElec.entity.StatusPostagem;
import com.ads.LogElec.repository.AgendamentoRepository;
import com.ads.LogElec.repository.PostagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PostagemService {

    @Autowired
    private PostagemRepository postagemRepository;

    @Autowired
    private AgendamentoRepository agendamentoRepository;

    public List<Postagem> findAll() {
        return postagemRepository.findAll();
    }

    public Optional<Postagem> findById(Long id) {
        return postagemRepository.findById(id);
    }

    public List<Postagem> findByEmpresaId(Long empresaId) {
        return postagemRepository.findByEmpresaId(empresaId);
    }

    public List<Postagem> findByStatus(String status) {
        try {
            StatusPostagem statusEnum = StatusPostagem.valueOf(status.toUpperCase());
            return postagemRepository.findByStatus(statusEnum);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Status inválido: " + status);
        }
    }

    public Postagem save(Postagem postagem) {
        if (postagem.getStatusModeracao() == null) {
            postagem.setStatusModeracao(StatusModeracaoPostagem.PENDENTE);
        }
        return postagemRepository.save(postagem);
    }

    public Postagem update(Long id, Postagem postagemDetails) {
        Postagem postagem = postagemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Postagem não encontrada com id: " + id));

        boolean conteudoAlterado = false;

        if (postagemDetails.getTitulo() != null) {
            postagem.setTitulo(postagemDetails.getTitulo());
            conteudoAlterado = true;
        }
        if (postagemDetails.getDescricao() != null) {
            postagem.setDescricao(postagemDetails.getDescricao());
            conteudoAlterado = true;
        }
        if (postagemDetails.getTipoResiduo() != null) {
            postagem.setTipoResiduo(postagemDetails.getTipoResiduo());
            conteudoAlterado = true;
        }
        if (postagemDetails.getPeso() != null) {
            postagem.setPeso(postagemDetails.getPeso());
            conteudoAlterado = true;
        }
        if (postagemDetails.getMaxPesoColeta() != null) {
            postagem.setMaxPesoColeta(postagemDetails.getMaxPesoColeta());
            conteudoAlterado = true;
        }
        if (postagemDetails.getEnderecoRetirada() != null) {
            postagem.setEnderecoRetirada(postagemDetails.getEnderecoRetirada());
            conteudoAlterado = true;
        }
        if (postagemDetails.getFotoEmpresa() != null) {
            postagem.setFotoEmpresa(postagemDetails.getFotoEmpresa());
            conteudoAlterado = true;
        }
        if (postagemDetails.getFotoResiduos() != null) {
            postagem.setFotoResiduos(postagemDetails.getFotoResiduos());
            conteudoAlterado = true;
        }
        if (postagemDetails.getDiasDisponibilidade() != null) {
            postagem.setDiasDisponibilidade(postagemDetails.getDiasDisponibilidade());
            conteudoAlterado = true;
        }
        if (postagemDetails.getHoraInicio() != null) {
            postagem.setHoraInicio(postagemDetails.getHoraInicio());
            conteudoAlterado = true;
        }
        if (postagemDetails.getHoraFim() != null) {
            postagem.setHoraFim(postagemDetails.getHoraFim());
            conteudoAlterado = true;
        }
        if (postagemDetails.getStatus() != null) postagem.setStatus(postagemDetails.getStatus());

        if (conteudoAlterado) {
            postagem.setStatusModeracao(StatusModeracaoPostagem.PENDENTE);
            postagem.setMotivoModeracao(null);
            postagem.setModeradoEm(null);
            postagem.setModeradoPor(null);
        }

        return postagemRepository.save(postagem);
    }

    public Postagem moderarPostagem(Long id, StatusModeracaoPostagem statusModeracao, String motivoModeracao, String moderadoPor) {
        Postagem postagem = postagemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Postagem não encontrada com id: " + id));

        postagem.setStatusModeracao(statusModeracao);
        postagem.setMotivoModeracao(motivoModeracao == null || motivoModeracao.isBlank() ? null : motivoModeracao.trim());
        postagem.setModeradoPor(moderadoPor);
        postagem.setModeradoEm(LocalDateTime.now());

        return postagemRepository.save(postagem);
    }

    @Transactional
    public void deleteById(Long id) {
        if (!postagemRepository.existsById(id)) {
            throw new RuntimeException("Postagem não encontrada com id: " + id);
        }

        agendamentoRepository.deleteByPostagemId(id);
        postagemRepository.deleteById(id);
    }

    
    public List<Postagem> buscarPorTermo(String termo) {
        if (termo == null || termo.trim().isEmpty()) {
            return postagemRepository.findAll();
        }
        return postagemRepository.buscarPorTermoFlexivel(termo.trim());
    }
}