package com.ads.LogElec.security;

import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.PerfilAcesso;
import com.ads.LogElec.entity.StatusConta;
import com.ads.LogElec.entity.TipoEmpresa;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.io.Serial;
import java.io.Serializable;
import java.util.Collection;
import java.util.List;

public class EmpresaSessionPrincipal implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private final Long id;
    private final String nome;
    private final String email;
    private final String cnpj;
    private final TipoEmpresa tipo;
    private final PerfilAcesso perfilAcesso;
    private final StatusConta statusConta;
    private final String endereco;
    private final String telefone;

    private EmpresaSessionPrincipal(
        Long id,
        String nome,
        String email,
        String cnpj,
        TipoEmpresa tipo,
        PerfilAcesso perfilAcesso,
        StatusConta statusConta,
        String endereco,
        String telefone
    ) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.cnpj = cnpj;
        this.tipo = tipo;
        this.perfilAcesso = perfilAcesso;
        this.statusConta = statusConta;
        this.endereco = endereco;
        this.telefone = telefone;
    }

    public static EmpresaSessionPrincipal fromEmpresa(Empresa empresa) {
        return new EmpresaSessionPrincipal(
            empresa.getId(),
            empresa.getNome(),
            empresa.getEmail(),
            empresa.getCnpj(),
            empresa.getTipo(),
            empresa.getPerfilAcesso(),
            empresa.getStatusConta(),
            empresa.getEndereco(),
            empresa.getTelefone()
        );
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        String perfil = perfilAcesso == null ? PerfilAcesso.EMPRESA.name() : perfilAcesso.name();
        return List.of(new SimpleGrantedAuthority("ROLE_" + perfil));
    }

    public boolean isAdministrador() {
        return perfilAcesso == PerfilAcesso.ADMIN;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getCnpj() { return cnpj; }
    public TipoEmpresa getTipo() { return tipo; }
    public PerfilAcesso getPerfilAcesso() { return perfilAcesso; }
    public StatusConta getStatusConta() { return statusConta; }
    public String getEndereco() { return endereco; }
    public String getTelefone() { return telefone; }
}