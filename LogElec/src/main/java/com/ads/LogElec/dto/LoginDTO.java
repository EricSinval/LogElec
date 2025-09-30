package com.ads.LogElec.dto;

public class LoginDTO {
    private String email;
    private String senha;
    
    // Construtor vazio
    public LoginDTO() {}
    
    // Construtor com parâmetros
    public LoginDTO(String email, String senha) {
        this.email = email;
        this.senha = senha;
    }
    
    // Getters e Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
}