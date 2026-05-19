package com.ads.LogElec.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "postagem_moderacao_historico")
public class PostagemModeracaoHistorico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "postagem_id", nullable = false)
    private Postagem postagem;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_moderacao", nullable = false)
    private StatusModeracaoPostagem statusModeracao;

    @Column(name = "motivo_moderacao", columnDefinition = "TEXT")
    private String motivoModeracao;

    @Column(name = "moderado_em", nullable = false)
    private LocalDateTime moderadoEm;

    @Column(name = "moderado_por")
    private String moderadoPor;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Postagem getPostagem() { return postagem; }
    public void setPostagem(Postagem postagem) { this.postagem = postagem; }

    public StatusModeracaoPostagem getStatusModeracao() { return statusModeracao; }
    public void setStatusModeracao(StatusModeracaoPostagem statusModeracao) { this.statusModeracao = statusModeracao; }

    public String getMotivoModeracao() { return motivoModeracao; }
    public void setMotivoModeracao(String motivoModeracao) { this.motivoModeracao = motivoModeracao; }

    public LocalDateTime getModeradoEm() { return moderadoEm; }
    public void setModeradoEm(LocalDateTime moderadoEm) { this.moderadoEm = moderadoEm; }

    public String getModeradoPor() { return moderadoPor; }
    public void setModeradoPor(String moderadoPor) { this.moderadoPor = moderadoPor; }
}