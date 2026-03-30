package com.ads.LogElec.dto;

public class RecuperarSenhaDTO {
    private String email;
    private String cnpj;
    private String novaSenha;

    public RecuperarSenhaDTO() {}

    public RecuperarSenhaDTO(String email, String cnpj, String novaSenha) {
        this.email = email;
        this.cnpj = cnpj;
        this.novaSenha = novaSenha;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public String getNovaSenha() { return novaSenha; }
    public void setNovaSenha(String novaSenha) { this.novaSenha = novaSenha; }
}
