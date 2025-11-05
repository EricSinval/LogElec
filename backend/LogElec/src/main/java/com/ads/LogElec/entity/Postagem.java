package com.ads.LogElec.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "postagens")
public class Postagem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "tipo_residuo", length = 150)
    private String tipoResiduo;

    @Column(precision = 10, scale = 2)
    private BigDecimal peso = BigDecimal.ZERO;

    @Column(name = "max_peso_coleta", precision = 10, scale = 2)
    private BigDecimal maxPesoColeta = BigDecimal.ZERO;

    @Column(name = "endereco_retirada", columnDefinition = "TEXT")
    private String enderecoRetirada;

    @Column(name = "foto_empresa")
    private String fotoEmpresa;

    @Column(name = "foto_residuos")
    private String fotoResiduos;

    @Enumerated(EnumType.STRING)
    private StatusPostagem status = StatusPostagem.ABERTA;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Postagem() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Postagem(Empresa empresa, String titulo, String descricao, String tipoResiduo, 
                   BigDecimal peso, String enderecoRetirada) {
        this.empresa = empresa;
        this.titulo = titulo;
        this.descricao = descricao;
        this.tipoResiduo = tipoResiduo;
        this.peso = peso;
        this.enderecoRetirada = enderecoRetirada;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Empresa getEmpresa() { return empresa; }
    public void setEmpresa(Empresa empresa) { this.empresa = empresa; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getTipoResiduo() { return tipoResiduo; }
    public void setTipoResiduo(String tipoResiduo) { this.tipoResiduo = tipoResiduo; }

    public BigDecimal getPeso() { return peso; }
    public void setPeso(BigDecimal peso) { this.peso = peso; }

    public BigDecimal getMaxPesoColeta() { return maxPesoColeta; }
    public void setMaxPesoColeta(BigDecimal maxPesoColeta) { this.maxPesoColeta = maxPesoColeta; }

    public String getEnderecoRetirada() { return enderecoRetirada; }
    public void setEnderecoRetirada(String enderecoRetirada) { this.enderecoRetirada = enderecoRetirada; }

    public String getFotoEmpresa() { return fotoEmpresa; }
    public void setFotoEmpresa(String fotoEmpresa) { this.fotoEmpresa = fotoEmpresa; }

    public String getFotoResiduos() { return fotoResiduos; }
    public void setFotoResiduos(String fotoResiduos) { this.fotoResiduos = fotoResiduos; }

    public StatusPostagem getStatus() { return status; }
    public void setStatus(StatusPostagem status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}