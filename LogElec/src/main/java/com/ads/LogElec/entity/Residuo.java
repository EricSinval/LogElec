package com.ads.LogElec.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "residuos")
public class Residuo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nome; // "Computador", "Celular", "Monitor"
    
    private String descricao;
    
    @Enumerated(EnumType.STRING)
    private CategoriaResiduo categoria;
    
    // Construtor
    public Residuo() {}
    
    public Residuo(String nome, String descricao, CategoriaResiduo categoria) {
        this.nome = nome;
        this.descricao = descricao;
        this.categoria = categoria;
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
}

// ENUM para categorias
enum CategoriaResiduo {
    INFORMATICA, ELETRODOMESTICO, TELEFONIA, OUTROS
}