package com.ads.LogElec.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "empresas")
public class Empresa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_razao", nullable = false)
    private String nome;

    @Column(unique = true, nullable = false, length = 20)
    private String cnpj;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "senha_hash", nullable = false)
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoEmpresa tipo;

    @Column(nullable = false)
    private String endereco;

    private String telefone;

    @Column(name = "foto_perfil")
    private String fotoPerfil;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Empresa() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Empresa(String cnpj, String nome, String email, String senha, TipoEmpresa tipo, String endereco) {
        this.cnpj = cnpj;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.tipo = tipo;
        this.endereco = endereco;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public TipoEmpresa getTipo() { return tipo; }
    public void setTipo(TipoEmpresa tipo) { this.tipo = tipo; }

    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getFotoPerfil() { return fotoPerfil; }
    public void setFotoPerfil(String fotoPerfil) { this.fotoPerfil = fotoPerfil; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    

    


    public boolean isValido() {
        return isNomeValido() && isCnpjValido() && isEmailValido() && isSenhaValida() && isEnderecoValido() && isTipoValido();
    }

    


    public boolean isTipoValido() {
        return tipo != null;
    }

    


    public boolean isNomeValido() {
        return nome != null && !nome.trim().isEmpty() && nome.length() >= 2 && nome.length() <= 255;
    }

    


    public boolean isEmailValido() {
        if (email == null || email.trim().isEmpty()) return false;
        
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        return email.matches(emailRegex);
    }

    


    public boolean isSenhaValida() {
        return senha != null && senha.length() >= 6;
    }

    


    public boolean isEnderecoValido() {
        return endereco != null && !endereco.trim().isEmpty();
    }

    


    public boolean isTelefoneValido() {
        if (telefone == null || telefone.trim().isEmpty()) return true; 
        
        String telefoneRegex = "^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$";
        return telefone.matches(telefoneRegex);
    }

    


    public boolean isCnpjValido() {
        if (this.cnpj == null) return false;
        
        
        String cnpjNumerico = this.cnpj.replaceAll("\\D", "");
        
        
        if (cnpjNumerico.length() != 14) return false;
        
        
        if (cnpjNumerico.matches("(\\d)\\1{13}")) return false;

        try {
            
            int soma = 0;
            int peso = 5;
            for (int i = 0; i < 12; i++) {
                soma += Character.getNumericValue(cnpjNumerico.charAt(i)) * peso;
                peso = (peso == 2) ? 9 : peso - 1;
            }
            int digito1 = 11 - (soma % 11);
            if (digito1 >= 10) digito1 = 0;

            
            soma = 0;
            peso = 6;
            for (int i = 0; i < 13; i++) {
                soma += Character.getNumericValue(cnpjNumerico.charAt(i)) * peso;
                peso = (peso == 2) ? 9 : peso - 1;
            }
            int digito2 = 11 - (soma % 11);
            if (digito2 >= 10) digito2 = 0;

            
            return (Character.getNumericValue(cnpjNumerico.charAt(12)) == digito1 &&
                    Character.getNumericValue(cnpjNumerico.charAt(13)) == digito2);

        } catch (NumberFormatException e) {
            return false;
        }
    }

    


    public String getMensagensErro() {
        StringBuilder erros = new StringBuilder();
        
        if (!isNomeValido()) {
            erros.append("• Nome deve ter entre 2 e 255 caracteres. ");
        }
        if (!isEmailValido()) {
            erros.append("• Email inválido. Use o formato: exemplo@dominio.com. ");
        }
        if (!isSenhaValida()) {
            erros.append("• Senha deve ter no mínimo 6 caracteres. ");
        }
        if (!isCnpjValido()) {
            erros.append("• CNPJ inválido. ");
        }
        if (!isEnderecoValido()) {
            erros.append("• Endereço é obrigatório. ");
        }
        if (!isTipoValido()) {
            erros.append("• Tipo de empresa é obrigatório (COLETA ou DESCARTE). ");
        }
        if (!isTelefoneValido()) {
            erros.append("• Telefone inválido. Use o formato: (11) 99999-9999. ");
        }
        
        return erros.toString().trim();
    }

    


    public String getCnpjFormatado() {
        if (cnpj == null) return "";
        String cnpjNumerico = cnpj.replaceAll("\\D", "");
        if (cnpjNumerico.length() != 14) return cnpj;
        
        return cnpjNumerico.replaceAll("(\\d{2})(\\d{3})(\\d{3})(\\d{4})(\\d{2})", "$1.$2.$3/$4-$5");
    }

    


    public String getTelefoneFormatado() {
        if (telefone == null) return "";
        String telefoneNumerico = telefone.replaceAll("\\D", "");
        
        if (telefoneNumerico.length() == 11) {
            return telefoneNumerico.replaceAll("(\\d{2})(\\d{5})(\\d{4})", "($1) $2-$3");
        } else if (telefoneNumerico.length() == 10) {
            return telefoneNumerico.replaceAll("(\\d{2})(\\d{4})(\\d{4})", "($1) $2-$3");
        } else {
            return telefone;
        }
    }
}