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

    // ✅ BUSCAR TODOS OS AGENDAMENTOS
    public List<Agendamento> findAll() {
        return agendamentoRepository.findAll();
    }
    
    // ✅ BUSCAR AGENDAMENTO POR ID
    public Agendamento findById(Long id) {
        return agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));
    }
    
    // ✅ BUSCAR AGENDAMENTOS POR EMPRESA SOLICITANTE
    public List<Agendamento> findByEmpresaSolicitante(Long empresaId) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa solicitante não encontrada"));
        return agendamentoRepository.findByEmpresaSolicitante(empresa);
    }
    
    // ✅ BUSCAR AGENDAMENTOS POR EMPRESA COLETORA
    public List<Agendamento> findByEmpresaColetora(Long empresaId) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa coletora não encontrada"));
        return agendamentoRepository.findByEmpresaColetora(empresa);
    }
    
    // ✅ BUSCAR AGENDAMENTOS PENDENTES PARA UMA EMPRESA COLETORA
    public List<Agendamento> findPendentesByEmpresaColetora(Long empresaId) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa coletora não encontrada"));
        return agendamentoRepository.findByEmpresaColetoraAndStatus(empresa, StatusAgendamento.AGENDADA);
    }
    
    // ✅ BUSCAR AGENDAMENTOS FUTUROS
    public List<Agendamento> findAgendamentosFuturos() {
        return agendamentoRepository.findAgendamentosFuturos(LocalDateTime.now());
    }
    
    // ✅ BUSCAR AGENDAMENTOS POR POSTAGEM
    public List<Agendamento> findByPostagem(Long postagemId) {
        Postagem postagem = postagemRepository.findById(postagemId)
                .orElseThrow(() -> new RuntimeException("Postagem não encontrada"));
        return agendamentoRepository.findByPostagem(postagem);
    }
    
    // ✅ CRIAR NOVO AGENDAMENTO (USANDO postagemId do DTO)
    public Agendamento criarAgendamento(AgendamentoDTO agendamentoDTO) {
        // Validar empresas
        Empresa empresaSolicitante = empresaRepository.findById(agendamentoDTO.getEmpresaSolicitanteId())
                .orElseThrow(() -> new RuntimeException("Empresa solicitante não encontrada"));

        Empresa empresaColetora = empresaRepository.findById(agendamentoDTO.getEmpresaColetoraId())
                .orElseThrow(() -> new RuntimeException("Empresa coletora não encontrada"));

        // Validar postagem explicitamente enviada no DTO
        Postagem postagem = postagemRepository.findById(agendamentoDTO.getPostagemId())
                .orElseThrow(() -> new RuntimeException("Postagem não encontrada"));

        // Verificar se a postagem pertence à empresa coletora indicada
        if (postagem.getEmpresa() == null || !postagem.getEmpresa().getId().equals(empresaColetora.getId())) {
            throw new RuntimeException("A postagem informada não pertence à empresa coletora especificada");
        }

        // Combinar data e hora para LocalDateTime
        LocalDateTime dataHoraAgendamento = LocalDateTime.of(
                agendamentoDTO.getDataAgendamento(),
                agendamentoDTO.getHoraAgendamento()
        );

        // Verificar se a data/hora é futura
        if (dataHoraAgendamento.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Não é possível agendar para datas/horários passados");
        }

        // Verificar conflitos de horário
        List<Agendamento> conflitos = agendamentoRepository.findByEmpresaColetoraAndDataHoraAndStatusNot(
                empresaColetora,
                dataHoraAgendamento,
                StatusAgendamento.CANCELADA
        );

        if (!conflitos.isEmpty()) {
            throw new RuntimeException("Já existe um agendamento para este horário com a empresa coletora");
        }

        // Criar agendamento
        Agendamento agendamento = new Agendamento();
        agendamento.setPostagem(postagem);
        agendamento.setEmpresaSolicitante(empresaSolicitante);
        agendamento.setEmpresaColetora(empresaColetora);
        agendamento.setEmpresaCliente(empresaSolicitante); // Mapeamento: cliente = solicitante
        agendamento.setEmpresaPrestadora(empresaColetora); // Mapeamento: prestadora = coletora
        agendamento.setDataHora(dataHoraAgendamento);
        agendamento.setObservacoes(agendamentoDTO.getObservacoes());
        agendamento.setStatus(StatusAgendamento.AGENDADA);

        return agendamentoRepository.save(agendamento);
    }
    
    // ✅ CONFIRMAR AGENDAMENTO (empresa coletora confirma)
    public Agendamento confirmarAgendamento(Long id) {
        Agendamento agendamento = findById(id);
        
        if (agendamento.getStatus() != StatusAgendamento.AGENDADA) {
            throw new RuntimeException("Só é possível confirmar agendamentos com status AGENDADA");
        }
        
        agendamento.setStatus(StatusAgendamento.CONFIRMADA);
        return agendamentoRepository.save(agendamento);
    }
    
    // ✅ CANCELAR AGENDAMENTO
    public Agendamento cancelarAgendamento(Long id) {
        Agendamento agendamento = findById(id);
        
        if (agendamento.getStatus() == StatusAgendamento.REALIZADA) {
            throw new RuntimeException("Não é possível cancelar um agendamento já realizado");
        }
        
        agendamento.setStatus(StatusAgendamento.CANCELADA);
        return agendamentoRepository.save(agendamento);
    }
    
    // ✅ ATUALIZAR STATUS PARA "REALIZADA" (concluir agendamento)
    public Agendamento concluirAgendamento(Long id) {
        Agendamento agendamento = findById(id);
        
        if (agendamento.getStatus() != StatusAgendamento.CONFIRMADA) {
            throw new RuntimeException("Só é possível concluir agendamentos confirmados");
        }
        
        agendamento.setStatus(StatusAgendamento.REALIZADA);
        return agendamentoRepository.save(agendamento);
    }
    
    // ✅ EXCLUIR AGENDAMENTO
    public void deleteById(Long id) {
        if (!agendamentoRepository.existsById(id)) {
            throw new RuntimeException("Agendamento não encontrado");
        }
        agendamentoRepository.deleteById(id);
    }
    
    // ✅ BUSCAR AGENDAMENTOS POR STATUS
    public List<Agendamento> findByStatus(StatusAgendamento status) {
        return agendamentoRepository.findByStatus(status);
    }
    
    // ✅ BUSCAR AGENDAMENTOS POR PERÍODO
    public List<Agendamento> findAgendamentosPorPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        LocalDateTime inicio = dataInicio.atStartOfDay();
        LocalDateTime fim = dataFim.atTime(LocalTime.MAX);
        return agendamentoRepository.findByDataHoraBetween(inicio, fim);
    }
    
    // ✅ BUSCAR AGENDAMENTOS POR EMPRESA E STATUS
    public List<Agendamento> findByEmpresaSolicitanteAndStatus(Long empresaId, StatusAgendamento status) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
        return agendamentoRepository.findByEmpresaSolicitanteAndStatus(empresa, status);
    }
    
    // ✅ CONTAR AGENDAMENTOS POR STATUS
    public Long countByStatus(StatusAgendamento status) {
        return agendamentoRepository.countByStatus(status);
    }

    
    
    
}