package com.ads.LogElec.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "agendamentos")
public class Agendamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // 📅 DATA E HORA (do calendário do Figma)
    private LocalDate dataAgendamento;
    private LocalTime horaAgendamento;
    
    // 🏢 EMPRESAS ENVOLVIDAS - RELACIONAMENTOS!
    @ManyToOne
    @JoinColumn(name = "empresa_solicitante_id") // Empresa que DESCARTARÁ
    private Empresa empresaSolicitante;
    
    @ManyToOne  
    @JoinColumn(name = "empresa_coletora_id") // Empresa que COLETARÁ
    private Empresa empresaColetora;
    
    // 📊 STATUS DO AGENDAMENTO
    @Enumerated(EnumType.STRING)
    private StatusAgendamento status;
    
    // 🗑️ INFORMAÇÕES DA COLETA (do Figma)
    private String tiposResiduos; // Ex: "Computadores, Monitores, Celulares"
    private Double pesoEstimado;  // Em kg (500kg, 1000kg do Figma)
    
    // 🏠 ENDEREÇO DA COLETA
    private String enderecoColeta;
    
    // 📝 OBSERVAÇÕES (opcional)
    private String observacoes;
    
    // ⏰ DATA DE CRIAÇÃO
    private LocalDate dataCriacao;
    
    // CONSTRUTORES
    public Agendamento() {}
    
    public Agendamento(LocalDate dataAgendamento, LocalTime horaAgendamento, 
                      Empresa empresaSolicitante, Empresa empresaColetora, 
                      String tiposResiduos, Double pesoEstimado, String enderecoColeta) {
        this.dataAgendamento = dataAgendamento;
        this.horaAgendamento = horaAgendamento;
        this.empresaSolicitante = empresaSolicitante;
        this.empresaColetora = empresaColetora;
        this.tiposResiduos = tiposResiduos;
        this.pesoEstimado = pesoEstimado;
        this.enderecoColeta = enderecoColeta;
        this.status = StatusAgendamento.PENDENTE; // Sempre inicia como PENDENTE
        this.dataCriacao = LocalDate.now(); // Data atual
    }
    
    // GETTERS E SETTERS - vamos gerar automaticamente!
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public LocalDate getDataAgendamento() { return dataAgendamento; }
    public void setDataAgendamento(LocalDate dataAgendamento) { this.dataAgendamento = dataAgendamento; }
    
    public LocalTime getHoraAgendamento() { return horaAgendamento; }
    public void setHoraAgendamento(LocalTime horaAgendamento) { this.horaAgendamento = horaAgendamento; }
    
    public Empresa getEmpresaSolicitante() { return empresaSolicitante; }
    public void setEmpresaSolicitante(Empresa empresaSolicitante) { this.empresaSolicitante = empresaSolicitante; }
    
    public Empresa getEmpresaColetora() { return empresaColetora; }
    public void setEmpresaColetora(Empresa empresaColetora) { this.empresaColetora = empresaColetora; }
    
    public StatusAgendamento getStatus() { return status; }
    public void setStatus(StatusAgendamento status) { this.status = status; }
    
    public String getTiposResiduos() { return tiposResiduos; }
    public void setTiposResiduos(String tiposResiduos) { this.tiposResiduos = tiposResiduos; }
    
    public Double getPesoEstimado() { return pesoEstimado; }
    public void setPesoEstimado(Double pesoEstimado) { this.pesoEstimado = pesoEstimado; }
    
    public String getEnderecoColeta() { return enderecoColeta; }
    public void setEnderecoColeta(String enderecoColeta) { this.enderecoColeta = enderecoColeta; }
    
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    
    public LocalDate getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDate dataCriacao) { this.dataCriacao = dataCriacao; }
}