package com.ads.LogElec.service;

import com.ads.LogElec.dto.AgendamentoDTO;
import com.ads.LogElec.entity.Agendamento;
import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.Postagem;
import com.ads.LogElec.entity.StatusAgendamento;
import com.ads.LogElec.entity.StatusPostagem;
import com.ads.LogElec.repository.AgendamentoRepository;
import com.ads.LogElec.repository.EmpresaRepository;
import com.ads.LogElec.repository.PostagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class AgendamentoService {

    @Autowired
    private AgendamentoRepository agendamentoRepository;
    
    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private PostagemRepository postagemRepository;

    
    public List<Agendamento> findAll() {
        return agendamentoRepository.findAll();
    }
    
    
    public Agendamento findById(Long id) {
        return agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));
    }
    
    
    public List<Agendamento> findByEmpresaSolicitante(Long empresaId) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa solicitante não encontrada"));
        return agendamentoRepository.findByEmpresaSolicitante(empresa);
    }
    
    
    public List<Agendamento> findByEmpresaColetora(Long empresaId) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa coletora não encontrada"));
        return agendamentoRepository.findByEmpresaColetora(empresa);
    }
    
    
    public List<Agendamento> findPendentesByEmpresaColetora(Long empresaId) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa coletora não encontrada"));
        return agendamentoRepository.findByEmpresaColetoraAndStatus(empresa, StatusAgendamento.AGENDADA);
    }
    
    
    public List<Agendamento> findAgendamentosFuturos() {
        return agendamentoRepository.findAgendamentosFuturos(LocalDateTime.now());
    }
    
    
    public List<Agendamento> findByPostagem(Long postagemId) {
        Postagem postagem = postagemRepository.findById(postagemId)
                .orElseThrow(() -> new RuntimeException("Postagem não encontrada"));
        return agendamentoRepository.findByPostagem(postagem);
    }
    
    
    public Agendamento criarAgendamento(AgendamentoDTO agendamentoDTO) {
        
        Empresa empresaSolicitante = empresaRepository.findById(agendamentoDTO.getEmpresaSolicitanteId())
                .orElseThrow(() -> new RuntimeException("Empresa solicitante não encontrada"));

        Empresa empresaColetora = empresaRepository.findById(agendamentoDTO.getEmpresaColetoraId())
                .orElseThrow(() -> new RuntimeException("Empresa coletora não encontrada"));

        
        Postagem postagem = postagemRepository.findById(agendamentoDTO.getPostagemId())
                .orElseThrow(() -> new RuntimeException("Postagem não encontrada"));

        
        if (postagem.getEmpresa() == null || !postagem.getEmpresa().getId().equals(empresaColetora.getId())) {
            throw new RuntimeException("A postagem informada não pertence à empresa coletora especificada");
        }

        
        LocalDateTime dataHoraAgendamento = LocalDateTime.of(
                agendamentoDTO.getDataAgendamento(),
                agendamentoDTO.getHoraAgendamento()
        );

        
        if (dataHoraAgendamento.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Não é possível agendar para datas/horários passados");
        }

        
        List<Agendamento> conflitos = agendamentoRepository.findByEmpresaColetoraAndDataHoraAndStatusNotIn(
            empresaColetora,
            dataHoraAgendamento,
            List.of(StatusAgendamento.CANCELADA, StatusAgendamento.RECUSADO)
        );

        if (!conflitos.isEmpty()) {
            throw new RuntimeException("Já existe um agendamento para este horário com a empresa coletora");
        }

        
        Agendamento agendamento = new Agendamento();
        agendamento.setPostagem(postagem);
        agendamento.setEmpresaSolicitante(empresaSolicitante);
        agendamento.setEmpresaColetora(empresaColetora);
        agendamento.setEmpresaCliente(empresaSolicitante); 
        agendamento.setEmpresaPrestadora(empresaColetora); 
        agendamento.setDataHora(dataHoraAgendamento);
        agendamento.setObservacoes(agendamentoDTO.getObservacoes());
        agendamento.setStatus(StatusAgendamento.AGENDADA);

        return agendamentoRepository.save(agendamento);
    }
    
    
    public Agendamento confirmarAgendamento(Long id) {
        Agendamento agendamento = findById(id);
        
        if (agendamento.getStatus() != StatusAgendamento.AGENDADA) {
            throw new RuntimeException("Só é possível confirmar agendamentos com status AGENDADA");
        }
        
        agendamento.setStatus(StatusAgendamento.CONFIRMADA);
        return agendamentoRepository.save(agendamento);
    }
    
    
    public Agendamento recusarAgendamento(Long id) {
        Agendamento agendamento = findById(id);
        if (agendamento.getStatus() != StatusAgendamento.AGENDADA) {
            throw new RuntimeException("Só é possível recusar agendamentos com status AGENDADA");
        }
        agendamento.setStatus(StatusAgendamento.RECUSADO);
        agendamento.setUpdatedAt(LocalDateTime.now());
        return agendamentoRepository.save(agendamento);
    }

    
    public Agendamento cancelarAgendamento(Long id) {
        Agendamento agendamento = findById(id);
        
        if (agendamento.getStatus() == StatusAgendamento.REALIZADA) {
            throw new RuntimeException("Não é possível cancelar um agendamento já realizado");
        }
        
        agendamento.setStatus(StatusAgendamento.CANCELADA);
        return agendamentoRepository.save(agendamento);
    }
    
    
    public Agendamento concluirAgendamento(Long id) {
        Agendamento agendamento = findById(id);
        
        if (agendamento.getStatus() != StatusAgendamento.CONFIRMADA) {
            throw new RuntimeException("Só é possível concluir agendamentos confirmados");
        }
        
        agendamento.setStatus(StatusAgendamento.REALIZADA);
        return agendamentoRepository.save(agendamento);
    }
    
    
    public void deleteById(Long id) {
        if (!agendamentoRepository.existsById(id)) {
            throw new RuntimeException("Agendamento não encontrado");
        }
        agendamentoRepository.deleteById(id);
    }
    
    
    public List<Agendamento> findByStatus(StatusAgendamento status) {
        return agendamentoRepository.findByStatus(status);
    }
    
    
    public List<Agendamento> findAgendamentosPorPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        LocalDateTime inicio = dataInicio.atStartOfDay();
        LocalDateTime fim = dataFim.atTime(LocalTime.MAX);
        return agendamentoRepository.findByDataHoraBetween(inicio, fim);
    }
    
    
    public List<Agendamento> findByEmpresaSolicitanteAndStatus(Long empresaId, StatusAgendamento status) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
        return agendamentoRepository.findByEmpresaSolicitanteAndStatus(empresa, status);
    }
    
    
    public Long countByStatus(StatusAgendamento status) {
        return agendamentoRepository.countByStatus(status);
    }

    
    
    
}