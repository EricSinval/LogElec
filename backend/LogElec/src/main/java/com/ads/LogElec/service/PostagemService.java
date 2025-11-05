package com.ads.LogElec.service;

import com.ads.LogElec.entity.Postagem;
import com.ads.LogElec.entity.StatusPostagem;
import com.ads.LogElec.repository.PostagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PostagemService {

    @Autowired
    private PostagemRepository postagemRepository;

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
        if (postagemDetails.getEnderecoRetirada() != null) postagem.setEnderecoRetirada(postagemDetails.getEnderecoRetirada());
        if (postagemDetails.getStatus() != null) postagem.setStatus(postagemDetails.getStatus());

        return postagemRepository.save(postagem);
    }

    public void deleteById(Long id) {
        if (!postagemRepository.existsById(id)) {
            throw new RuntimeException("Postagem não encontrada com id: " + id);
        }
        postagemRepository.deleteById(id);
    }
}