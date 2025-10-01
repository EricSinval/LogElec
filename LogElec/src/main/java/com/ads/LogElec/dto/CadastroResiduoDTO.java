package com.ads.LogElec.dto;

import org.springframework.web.multipart.MultipartFile;

public class CadastroResiduoDTO {
    private String tipo;
    private String peso; // Vem como string "15kg"
    private String endereco;
    private MultipartFile foto;
    private Long empresaId; // ID da empresa logada
    
    // Construtores
    public CadastroResiduoDTO() {}
    
    public CadastroResiduoDTO(String tipo, String peso, String endereco, Long empresaId) {
        this.tipo = tipo;
        this.peso = peso;
        this.endereco = endereco;
        this.empresaId = empresaId;
    }
    
    // Getters e Setters
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    
    public String getPeso() { return peso; }
    public void setPeso(String peso) { this.peso = peso; }
    
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    
    public MultipartFile getFoto() { return foto; }
    public void setFoto(MultipartFile foto) { this.foto = foto; }
    
    public Long getEmpresaId() { return empresaId; }
    public void setEmpresaId(Long empresaId) { this.empresaId = empresaId; }
}