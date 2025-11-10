package com.ads.LogElec.service;

import com.ads.LogElec.entity.Mensagem;
import com.ads.LogElec.repository.MensagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MensagemService {

    @Autowired
    private MensagemRepository mensagemRepository;

    public List<Mensagem> findAll() {
        return mensagemRepository.findAll();
    }

    public Optional<Mensagem> findById(Long id) {
        return mensagemRepository.findById(id);
    }

    public List<Mensagem> findByAgendamentoId(Long agendamentoId) {
        return mensagemRepository.findByAgendamentoId(agendamentoId);
    }

    public List<Mensagem> findByEmpresaId(Long empresaId) {
        return mensagemRepository.findByEmpresaRemetenteIdOrEmpresaDestinatarioId(empresaId, empresaId);
    }

    public List<Mensagem> findMensagensNaoLidas(Long empresaDestinatarioId) {
        return mensagemRepository.findByEmpresaDestinatarioIdAndLidoFalse(empresaDestinatarioId);
    }

    public Mensagem save(Mensagem mensagem) {
        return mensagemRepository.save(mensagem);
    }

    public Mensagem marcarComoLida(Long id) {
        Mensagem mensagem = mensagemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mensagem não encontrada com id: " + id));
        mensagem.setLido(true);
        return mensagemRepository.save(mensagem);
    }

    public void deleteById(Long id) {
        if (!mensagemRepository.existsById(id)) {
            throw new RuntimeException("Mensagem não encontrada com id: " + id);
        }
        mensagemRepository.deleteById(id);
    }
}