package com.ads.LogElec.service;

import com.ads.LogElec.dto.PostagemEmpresaDTO;
import com.ads.LogElec.dto.PostagemModeracaoHistoricoDTO;
import com.ads.LogElec.entity.Postagem;
import com.ads.LogElec.entity.PostagemModeracaoHistorico;
import com.ads.LogElec.entity.StatusModeracaoPostagem;
import com.ads.LogElec.entity.StatusPostagem;
import com.ads.LogElec.repository.AgendamentoRepository;
import com.ads.LogElec.repository.PostagemModeracaoHistoricoRepository;
import com.ads.LogElec.repository.PostagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PostagemService {
    private static final String TIPO_RESIDUO_LENGTH_ERROR =
        "Tipos de resíduos podem ter no máximo " + Postagem.MAX_TIPO_RESIDUO_LENGTH + " caracteres.";

    @Autowired
    private PostagemRepository postagemRepository;

    @Autowired
    private PostagemModeracaoHistoricoRepository postagemModeracaoHistoricoRepository;

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

    public List<PostagemEmpresaDTO> findResumoByEmpresaId(Long empresaId) {
        return postagemRepository.findByEmpresaId(empresaId).stream()
            .map(postagem -> PostagemEmpresaDTO.fromEntity(postagem, listarHistoricoModeracao(postagem.getId())))
            .collect(Collectors.toList());
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
        postagem.setTipoResiduo(normalizarTipoResiduo(postagem.getTipoResiduo()));

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
            postagem.setTipoResiduo(normalizarTipoResiduo(postagemDetails.getTipoResiduo()));
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

        LocalDateTime momentoModeracao = LocalDateTime.now();
        postagem.setStatusModeracao(statusModeracao);
        postagem.setMotivoModeracao(motivoModeracao == null || motivoModeracao.isBlank() ? null : motivoModeracao.trim());
        postagem.setModeradoPor(moderadoPor);
        postagem.setModeradoEm(momentoModeracao);

        PostagemModeracaoHistorico historico = new PostagemModeracaoHistorico();
        historico.setPostagem(postagem);
        historico.setStatusModeracao(statusModeracao);
        historico.setMotivoModeracao(postagem.getMotivoModeracao());
        historico.setModeradoPor(moderadoPor);
        historico.setModeradoEm(momentoModeracao);

        postagemModeracaoHistoricoRepository.save(historico);

        return postagemRepository.save(postagem);
    }

    @Transactional
    public void deleteById(Long id) {
        if (!postagemRepository.existsById(id)) {
            throw new RuntimeException("Postagem não encontrada com id: " + id);
        }

        postagemModeracaoHistoricoRepository.deleteByPostagemId(id);
        agendamentoRepository.deleteByPostagemId(id);
        postagemRepository.deleteById(id);
    }

    
    public List<Postagem> buscarPorTermo(String termo) {
        if (termo == null || termo.trim().isEmpty()) {
            return postagemRepository.findAll();
        }
        return postagemRepository.buscarPorTermoFlexivel(termo.trim());
    }

    private List<PostagemModeracaoHistoricoDTO> listarHistoricoModeracao(Long postagemId) {
        return postagemModeracaoHistoricoRepository.findByPostagemIdOrderByModeradoEmDescIdDesc(postagemId).stream()
            .map(PostagemModeracaoHistoricoDTO::fromEntity)
            .collect(Collectors.toList());
    }

    private String normalizarTipoResiduo(String tipoResiduo) {
        if (tipoResiduo == null) {
            return null;
        }

        String tipoResiduoNormalizado = tipoResiduo.trim();
        if (tipoResiduoNormalizado.length() > Postagem.MAX_TIPO_RESIDUO_LENGTH) {
            throw new IllegalArgumentException(TIPO_RESIDUO_LENGTH_ERROR);
        }

        return tipoResiduoNormalizado;
    }
}