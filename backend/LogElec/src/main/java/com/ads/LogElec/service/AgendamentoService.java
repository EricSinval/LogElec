package com.ads.LogElec.service;

import com.ads.LogElec.entity.Agendamento;
import com.ads.LogElec.entity.StatusAgendamento;
import com.ads.LogElec.repository.AgendamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AgendamentoService {

    @Autowired
    private AgendamentoRepository agendamentoRepository;

    public List<Agendamento> findAll() {
        return agendamentoRepository.findAll();
    }

    public Optional<Agendamento> findById(Long id) {
        return agendamentoRepository.findById(id);
    }

    public List<Agendamento> findByEmpresaSolicitanteId(Long empresaId) {
        return agendamentoRepository.findByEmpresaSolicitanteId(empresaId);
    }

    public List<Agendamento> findByEmpresaColetoraId(Long empresaId) {
        return agendamentoRepository.findByEmpresaColetoraId(empresaId);
    }

    public List<Agendamento> findByStatus(String status) {
        try {
            StatusAgendamento statusEnum = StatusAgendamento.valueOf(status.toUpperCase());
            return agendamentoRepository.findByStatus(statusEnum);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Status inválido: " + status);
        }
    }

    public List<Agendamento> findByPostagemId(Long postagemId) {
        return agendamentoRepository.findByPostagemId(postagemId);
    }

    public Agendamento save(Agendamento agendamento) {
        return agendamentoRepository.save(agendamento);
    }

    public Agendamento update(Long id, Agendamento agendamentoDetails) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado com id: " + id));

        if (agendamentoDetails.getDataHora() != null) {
            agendamento.setDataHora(agendamentoDetails.getDataHora());
        }
        if (agendamentoDetails.getObservacoes() != null) {
            agendamento.setObservacoes(agendamentoDetails.getObservacoes());
        }
        if (agendamentoDetails.getStatus() != null) {
            agendamento.setStatus(agendamentoDetails.getStatus());
        }
        if (agendamentoDetails.getEmpresaColetora() != null) {
            agendamento.setEmpresaColetora(agendamentoDetails.getEmpresaColetora());
        }

        return agendamentoRepository.save(agendamento);
    }

    public void deleteById(Long id) {
        if (!agendamentoRepository.existsById(id)) {
            throw new RuntimeException("Agendamento não encontrado com id: " + id);
        }
        agendamentoRepository.deleteById(id);
    }
}