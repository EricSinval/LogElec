package com.ads.LogElec.service;

import com.ads.LogElec.entity.Agendamento;
import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.Mensagem;
import com.ads.LogElec.entity.StatusAgendamento;
import com.ads.LogElec.repository.AgendamentoRepository;
import com.ads.LogElec.repository.EmpresaRepository;
import com.ads.LogElec.repository.MensagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MensagemService {

    @Autowired
    private MensagemRepository mensagemRepository;

    @Autowired
    private AgendamentoRepository agendamentoRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

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

    public boolean podeConversar(Long empresaAId, Long empresaBId) {
        return agendamentoRepository.existsByEmpresasAndStatus(empresaAId, empresaBId, StatusAgendamento.CONFIRMADA);
    }

    public List<Mensagem> findConversaEntreEmpresas(Long empresaAId, Long empresaBId) {
        if (!podeConversar(empresaAId, empresaBId)) {
            throw new RuntimeException("Conversa permitida somente com agendamento confirmado entre as empresas");
        }
        return mensagemRepository.findConversaEntreEmpresas(empresaAId, empresaBId);
    }

    public List<Map<String, Object>> listarContatosConfirmados(Long empresaId) {
        List<Agendamento> agendamentosConfirmados = agendamentoRepository.findByEmpresaIdAndStatus(empresaId, StatusAgendamento.CONFIRMADA);
        Map<Long, Map<String, Object>> contatosMap = new LinkedHashMap<>();

        for (Agendamento agendamento : agendamentosConfirmados) {
            Empresa outraEmpresa = null;

            if (agendamento.getEmpresaSolicitante() != null && agendamento.getEmpresaSolicitante().getId().equals(empresaId)) {
                outraEmpresa = agendamento.getEmpresaColetora();
            } else if (agendamento.getEmpresaColetora() != null && agendamento.getEmpresaColetora().getId().equals(empresaId)) {
                outraEmpresa = agendamento.getEmpresaSolicitante();
            }

            if (outraEmpresa == null || outraEmpresa.getId() == null) {
                continue;
            }

            if (!contatosMap.containsKey(outraEmpresa.getId())) {
                List<Mensagem> conversa = mensagemRepository.findConversaEntreEmpresas(empresaId, outraEmpresa.getId());
                Mensagem ultimaMensagem = conversa.isEmpty() ? null : conversa.get(conversa.size() - 1);

                Map<String, Object> contato = new LinkedHashMap<>();
                contato.put("empresaId", outraEmpresa.getId());
                contato.put("nome", outraEmpresa.getNome());
                contato.put("tipo", outraEmpresa.getTipo() != null ? outraEmpresa.getTipo().name() : null);
                contato.put("agendamentoId", agendamento.getId());
                contato.put("ultimaMensagem", ultimaMensagem != null ? ultimaMensagem.getConteudo() : "");
                contato.put("ultimaMensagemEm", ultimaMensagem != null ? ultimaMensagem.getCreatedAt() : null);
                contatosMap.put(outraEmpresa.getId(), contato);
            }
        }

        return new ArrayList<>(contatosMap.values());
    }

    public Mensagem enviarMensagem(Long remetenteId, Long destinatarioId, String conteudo) {
        if (conteudo == null || conteudo.trim().isEmpty()) {
            throw new RuntimeException("Conteúdo da mensagem não pode ser vazio");
        }

        if (!podeConversar(remetenteId, destinatarioId)) {
            throw new RuntimeException("Envio permitido somente com agendamento confirmado entre as empresas");
        }

        Empresa remetente = empresaRepository.findById(remetenteId)
                .orElseThrow(() -> new RuntimeException("Empresa remetente não encontrada"));
        Empresa destinatario = empresaRepository.findById(destinatarioId)
                .orElseThrow(() -> new RuntimeException("Empresa destinatário não encontrada"));

        List<Agendamento> agendamentos = agendamentoRepository.findByEmpresasAndStatusOrderByDataHoraDesc(remetenteId, destinatarioId, StatusAgendamento.CONFIRMADA);
        Agendamento agendamento = agendamentos.isEmpty() ? null : agendamentos.get(0);

        Mensagem mensagem = new Mensagem();
        mensagem.setAgendamento(agendamento);
        mensagem.setEmpresaRemetente(remetente);
        mensagem.setEmpresaDestinatario(destinatario);
        mensagem.setConteudo(conteudo.trim());
        mensagem.setLido(false);

        return mensagemRepository.save(mensagem);
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