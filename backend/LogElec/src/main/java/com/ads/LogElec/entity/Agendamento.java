package com.ads.LogElec.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "agendamentos")
public class Agendamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "postagem_id", nullable = false)
    private Postagem postagem;

    @ManyToOne
    @JoinColumn(name = "empresa_solicitante_id", nullable = false)
    private Empresa empresaSolicitante;

    @ManyToOne
    @JoinColumn(name = "empresa_coletora_id")
    private Empresa empresaColetora;

    @ManyToOne
    @JoinColumn(name = "empresa_cliente_id")
    private Empresa empresaCliente;

    @ManyToOne
    @JoinColumn(name = "empresa_prestadora_id")
    private Empresa empresaPrestadora;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @Enumerated(EnumType.STRING)
    private StatusAgendamento status = StatusAgendamento.AGENDADA;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Construtores
    public Agendamento() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Agendamento(Postagem postagem, Empresa empresaSolicitante, Empresa empresaColetora, LocalDateTime dataHora) {
        this.postagem = postagem;
        this.empresaSolicitante = empresaSolicitante;
        this.empresaColetora = empresaColetora;
        this.dataHora = dataHora;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Postagem getPostagem() { return postagem; }
    public void setPostagem(Postagem postagem) { this.postagem = postagem; }

    public Empresa getEmpresaSolicitante() { return empresaSolicitante; }
    public void setEmpresaSolicitante(Empresa empresaSolicitante) { this.empresaSolicitante = empresaSolicitante; }

    public Empresa getEmpresaColetora() { return empresaColetora; }
    public void setEmpresaColetora(Empresa empresaColetora) { this.empresaColetora = empresaColetora; }

    public Empresa getEmpresaCliente() { return empresaCliente; }
    public void setEmpresaCliente(Empresa empresaCliente) { this.empresaCliente = empresaCliente; }

    public Empresa getEmpresaPrestadora() { return empresaPrestadora; }
    public void setEmpresaPrestadora(Empresa empresaPrestadora) { this.empresaPrestadora = empresaPrestadora; }

    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }

    public StatusAgendamento getStatus() { return status; }
    public void setStatus(StatusAgendamento status) { this.status = status; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ✅ MÉTODOS DE CONVENIÊNCIA PARA O FRONTEND
    public String getDataFormatada() {
        return dataHora != null ? dataHora.toLocalDate().toString() : "";
    }

    public String getHoraFormatada() {
        return dataHora != null ? dataHora.toLocalTime().toString() : "";
    }

    public boolean isPendente() {
        return status == StatusAgendamento.AGENDADA;
    }

    public boolean podeCancelar() {
        return status == StatusAgendamento.AGENDADA || status == StatusAgendamento.CONFIRMADA;
    }
}