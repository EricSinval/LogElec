package com.ads.LogElec.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "residuos")
public class Residuo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nome;
    
    private String descricao;
    
    @Enumerated(EnumType.STRING)
    private CategoriaResiduo categoria;
    
    // ✅ NOVOS CAMPOS PARA O FORMULÁRIO
    private Double peso; // em kg - "Qual o peso total?"
    
    private String enderecoRetirada; // "Qual endereço para retirada?"
    
    private String fotoUrl; // Para upload de imagem depois
    
    // ✅ RELACIONAMENTO COM EMPRESA (QUEM CADASTROU)
    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;
    
    private LocalDateTime dataCadastro;
    
    // Construtores
    public Residuo() {}
    
    public Residuo(String nome, String descricao, CategoriaResiduo categoria, 
                  Double peso, String enderecoRetirada, Empresa empresa) {
        this.nome = nome;
        this.descricao = descricao;
        this.categoria = categoria;
        this.peso = peso;
        this.enderecoRetirada = enderecoRetirada;
        this.empresa = empresa;
        this.dataCadastro = LocalDateTime.now();
    }
    
    // GETTERS E SETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    
    public CategoriaResiduo getCategoria() { return categoria; }
    public void setCategoria(CategoriaResiduo categoria) { this.categoria = categoria; }
    
    public Double getPeso() { return peso; }
    public void setPeso(Double peso) { this.peso = peso; }
    
    public String getEnderecoRetirada() { return enderecoRetirada; }
    public void setEnderecoRetirada(String enderecoRetirada) { this.enderecoRetirada = enderecoRetirada; }
    
    public String getFotoUrl() { return fotoUrl; }
    public void setFotoUrl(String fotoUrl) { this.fotoUrl = fotoUrl; }
    
    public Empresa getEmpresa() { return empresa; }
    public void setEmpresa(Empresa empresa) { this.empresa = empresa; }
    
    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }
}