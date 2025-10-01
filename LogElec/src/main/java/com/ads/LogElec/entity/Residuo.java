package com.ads.LogElec.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "residuos")
public class Residuo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ✅ CAMPOS DO SEU FORMULÁRIO HTML
    @Column(nullable = false)
    private String tipo; // "Computadores, Monitores, Celulares" - campo do HTML
    
    private Double peso; // Em kg - campo do HTML (convertido de "15kg")
    
    @Column(nullable = false)
    private String enderecoRetirada; // campo "endereco" do HTML
    
    private String fotoPath; // Caminho da foto no servidor - campo "foto" do HTML
    
    // ✅ CAMPOS EXISTENTES (mantemos para compatibilidade)
    private String nome; // "Computador", "Celular", "Monitor"
    private String descricao;
    
    @Enumerated(EnumType.STRING)
    private CategoriaResiduo categoria;
    
    // ✅ NOVOS CAMPOS PARA CONTROLE
    private LocalDate dataCadastro;
    
    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa; // Empresa que está descartando
    
    @Enumerated(EnumType.STRING)
    private StatusResiduo status;
    
    // Construtores
    public Residuo() {
        this.dataCadastro = LocalDate.now();
        this.status = StatusResiduo.PENDENTE;
    }
    
    // Construtor para o formulário HTML
    public Residuo(String tipo, Double peso, String enderecoRetirada, Empresa empresa) {
        this();
        this.tipo = tipo;
        this.peso = peso;
        this.enderecoRetirada = enderecoRetirada;
        this.empresa = empresa;
        // Define nome automaticamente baseado no tipo
        this.nome = extrairNomeDoTipo(tipo);
        this.categoria = CategoriaResiduo.OUTROS; // Default
    }
    
    // Construtor original (mantido para compatibilidade)
    public Residuo(String nome, String descricao, CategoriaResiduo categoria) {
        this();
        this.nome = nome;
        this.descricao = descricao;
        this.categoria = categoria;
        this.tipo = nome; // Para compatibilidade
    }
    
    // Método auxiliar para extrair nome do tipo
    private String extrairNomeDoTipo(String tipo) {
        if (tipo == null || tipo.isEmpty()) return "Resíduo Eletrônico";
        
        // Pega a primeira parte antes de vírgula, se houver
        String[] partes = tipo.split(",");
        return partes[0].trim();
    }
    
    // GETTERS E SETTERS - TODOS OS CAMPOS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    // ✅ NOVOS GETTERS/SETTERS para campos do HTML
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { 
        this.tipo = tipo;
        // Atualiza nome automaticamente
        if (this.nome == null || this.nome.equals("Resíduo Eletrônico")) {
            this.nome = extrairNomeDoTipo(tipo);
        }
    }
    
    public Double getPeso() { return peso; }
    public void setPeso(Double peso) { this.peso = peso; }
    
    public String getEnderecoRetirada() { return enderecoRetirada; }
    public void setEnderecoRetirada(String enderecoRetirada) { this.enderecoRetirada = enderecoRetirada; }
    
    public String getFotoPath() { return fotoPath; }
    public void setFotoPath(String fotoPath) { this.fotoPath = fotoPath; }
    
    public LocalDate getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDate dataCadastro) { this.dataCadastro = dataCadastro; }
    
    public Empresa getEmpresa() { return empresa; }
    public void setEmpresa(Empresa empresa) { this.empresa = empresa; }
    
    public StatusResiduo getStatus() { return status; }
    public void setStatus(StatusResiduo status) { this.status = status; }
    
    // ✅ GETTERS/SETTERS ORIGINAIS (mantidos)
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    
    public CategoriaResiduo getCategoria() { return categoria; }
    public void setCategoria(CategoriaResiduo categoria) { this.categoria = categoria; }
}