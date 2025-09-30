package com.ads.LogElec.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "empresas")
public class Empresa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String cnpj;
    
    @Column(nullable = false)
    private String nome;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String senha;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoEmpresa tipo; // Agora usa o enum separado
    
    @Column(nullable = false)
    private String endereco;
    
    private String telefone;
    
    private Integer capacidadeColeta; // Só para empresas de coleta
    
    // Construtor vazio (OBRIGATÓRIO para JPA)
    public Empresa() {}
    
    // Construtor com parâmetros
    public Empresa(String cnpj, String nome, String email, String senha, TipoEmpresa tipo, String endereco) {
        this.cnpj = cnpj;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.tipo = tipo;
        this.endereco = endereco;
    }
    
    // GETTERS E SETTERS (copie e cole TODOS)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
    
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    
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
    
    public Integer getCapacidadeColeta() { return capacidadeColeta; }
    public void setCapacidadeColeta(Integer capacidadeColeta) { this.capacidadeColeta = capacidadeColeta; }
}
