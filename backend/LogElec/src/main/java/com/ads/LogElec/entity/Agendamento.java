package com.ads.LogElec.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;

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

    // Métodos de conveniência para compatibilidade com código existente
    public LocalDate getDataAgendamento() {
        return dataHora != null ? dataHora.toLocalDate() : null;
    }

    public void setDataAgendamento(LocalDate dataAgendamento) {
        if (this.dataHora == null && dataAgendamento != null) {
            this.dataHora = LocalDateTime.of(dataAgendamento, LocalTime.of(0, 0));
        } else if (dataAgendamento != null) {
            this.dataHora = LocalDateTime.of(dataAgendamento, this.dataHora.toLocalTime());
        }
    }

    public LocalTime getHoraAgendamento() {
        return dataHora != null ? dataHora.toLocalTime() : null;
    }

    public void setHoraAgendamento(LocalTime horaAgendamento) {
        if (this.dataHora == null && horaAgendamento != null) {
            this.dataHora = LocalDateTime.of(LocalDate.now(), horaAgendamento);
        } else if (horaAgendamento != null) {
            this.dataHora = LocalDateTime.of(this.dataHora.toLocalDate(), horaAgendamento);
        }
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
}