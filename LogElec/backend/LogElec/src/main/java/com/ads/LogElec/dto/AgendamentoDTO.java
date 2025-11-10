package com.ads.LogElec.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class AgendamentoDTO {
    private Long empresaSolicitanteId;
    private Long empresaColetoraId;
    private LocalDate dataAgendamento;
    private LocalTime horaAgendamento;
    private String observacoes;
    
    // Construtores
    public AgendamentoDTO() {}
    
    public AgendamentoDTO(Long empresaSolicitanteId, Long empresaColetoraId, 
                                 LocalDate dataAgendamento, LocalTime horaAgendamento) {
        this.empresaSolicitanteId = empresaSolicitanteId;
        this.empresaColetoraId = empresaColetoraId;
        this.dataAgendamento = dataAgendamento;
        this.horaAgendamento = horaAgendamento;
    }
    
    public AgendamentoDTO(Long empresaSolicitanteId, Long empresaColetoraId, 
                                 LocalDate dataAgendamento, LocalTime horaAgendamento,
                                 String observacoes) {
        this.empresaSolicitanteId = empresaSolicitanteId;
        this.empresaColetoraId = empresaColetoraId;
        this.dataAgendamento = dataAgendamento;
        this.horaAgendamento = horaAgendamento;
        this.observacoes = observacoes;
    }
    
    // Getters e Setters
    public Long getEmpresaSolicitanteId() { return empresaSolicitanteId; }
    public void setEmpresaSolicitanteId(Long empresaSolicitanteId) { this.empresaSolicitanteId = empresaSolicitanteId; }
    
    public Long getEmpresaColetoraId() { return empresaColetoraId; }
    public void setEmpresaColetoraId(Long empresaColetoraId) { this.empresaColetoraId = empresaColetoraId; }
    
    public LocalDate getDataAgendamento() { return dataAgendamento; }
    public void setDataAgendamento(LocalDate dataAgendamento) { this.dataAgendamento = dataAgendamento; }
    
    public LocalTime getHoraAgendamento() { return horaAgendamento; }
    public void setHoraAgendamento(LocalTime horaAgendamento) { this.horaAgendamento = horaAgendamento; }
    
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    
    @Override
    public String toString() {
        return "CadastroAgendamentoDTO{" +
                "empresaSolicitanteId=" + empresaSolicitanteId +
                ", empresaColetoraId=" + empresaColetoraId +
                ", dataAgendamento=" + dataAgendamento +
                ", horaAgendamento=" + horaAgendamento +
                ", observacoes='" + observacoes + '\'' +
                '}';
    }
}