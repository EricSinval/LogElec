package com.ads.LogElec.dto;

import org.springframework.web.multipart.MultipartFile;

public class CadastroResiduoDTO {
    private String nome;
    private String descricao;
    private String categoria;
    private Double peso;
    private String endereco;
    private MultipartFile foto;
    private Long empresaId;
    private String diasDisponibilidade;
    private String horaInicio;
    private String horaFim;
    
    // Construtores
    public CadastroResiduoDTO() {}
    
    public CadastroResiduoDTO(String nome, String descricao, String categoria, 
                             Double peso, String endereco, Long empresaId) {
        this.nome = nome;
        this.descricao = descricao;
        this.categoria = categoria;
        this.peso = peso;
        this.endereco = endereco;
        this.empresaId = empresaId;
    }
    
    // Getters e Setters
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    
    public Double getPeso() { return peso; }
    public void setPeso(Double peso) { this.peso = peso; }
    
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    
    public MultipartFile getFoto() { return foto; }
    public void setFoto(MultipartFile foto) { this.foto = foto; }
    
    public Long getEmpresaId() { return empresaId; }
    public void setEmpresaId(Long empresaId) { this.empresaId = empresaId; }
}