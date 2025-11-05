package com.ads.LogElec.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mensagens")
public class Mensagem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "agendamento_id")
    private Agendamento agendamento;

    @ManyToOne
    @JoinColumn(name = "empresa_remetente_id", nullable = false)
    private Empresa empresaRemetente;

    @ManyToOne
    @JoinColumn(name = "empresa_destinatario_id", nullable = false)
    private Empresa empresaDestinatario;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String conteudo;

    private Boolean lido = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Construtores
    public Mensagem() {
        this.createdAt = LocalDateTime.now();
    }

    public Mensagem(Empresa empresaRemetente, Empresa empresaDestinatario, String conteudo) {
        this.empresaRemetente = empresaRemetente;
        this.empresaDestinatario = empresaDestinatario;
        this.conteudo = conteudo;
        this.createdAt = LocalDateTime.now();
    }

    public Mensagem(Agendamento agendamento, Empresa empresaRemetente, Empresa empresaDestinatario, String conteudo) {
        this.agendamento = agendamento;
        this.empresaRemetente = empresaRemetente;
        this.empresaDestinatario = empresaDestinatario;
        this.conteudo = conteudo;
        this.createdAt = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Agendamento getAgendamento() { return agendamento; }
    public void setAgendamento(Agendamento agendamento) { this.agendamento = agendamento; }

    public Empresa getEmpresaRemetente() { return empresaRemetente; }
    public void setEmpresaRemetente(Empresa empresaRemetente) { this.empresaRemetente = empresaRemetente; }

    public Empresa getEmpresaDestinatario() { return empresaDestinatario; }
    public void setEmpresaDestinatario(Empresa empresaDestinatario) { this.empresaDestinatario = empresaDestinatario; }

    public String getConteudo() { return conteudo; }
    public void setConteudo(String conteudo) { this.conteudo = conteudo; }

    public Boolean getLido() { return lido; }
    public void setLido(Boolean lido) { this.lido = lido; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}