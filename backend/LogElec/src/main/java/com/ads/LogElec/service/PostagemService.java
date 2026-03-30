package com.ads.LogElec.service;

import com.ads.LogElec.entity.Postagem;
import com.ads.LogElec.entity.StatusPostagem;
import com.ads.LogElec.repository.AgendamentoRepository;
import com.ads.LogElec.repository.PostagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
        return postagemRepository.save(postagem);
    }

    public Postagem update(Long id, Postagem postagemDetails) {
        Postagem postagem = postagemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Postagem não encontrada com id: " + id));

        if (postagemDetails.getTitulo() != null) postagem.setTitulo(postagemDetails.getTitulo());
        if (postagemDetails.getDescricao() != null) postagem.setDescricao(postagemDetails.getDescricao());
        if (postagemDetails.getTipoResiduo() != null) postagem.setTipoResiduo(postagemDetails.getTipoResiduo());
        if (postagemDetails.getPeso() != null) postagem.setPeso(postagemDetails.getPeso());
        if (postagemDetails.getMaxPesoColeta() != null) postagem.setMaxPesoColeta(postagemDetails.getMaxPesoColeta());
        if (postagemDetails.getEnderecoRetirada() != null) postagem.setEnderecoRetirada(postagemDetails.getEnderecoRetirada());
        if (postagemDetails.getFotoEmpresa() != null) postagem.setFotoEmpresa(postagemDetails.getFotoEmpresa());
        if (postagemDetails.getFotoResiduos() != null) postagem.setFotoResiduos(postagemDetails.getFotoResiduos());
        if (postagemDetails.getDiasDisponibilidade() != null) postagem.setDiasDisponibilidade(postagemDetails.getDiasDisponibilidade());
        if (postagemDetails.getHoraInicio() != null) postagem.setHoraInicio(postagemDetails.getHoraInicio());
        if (postagemDetails.getHoraFim() != null) postagem.setHoraFim(postagemDetails.getHoraFim());
        if (postagemDetails.getStatus() != null) postagem.setStatus(postagemDetails.getStatus());

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