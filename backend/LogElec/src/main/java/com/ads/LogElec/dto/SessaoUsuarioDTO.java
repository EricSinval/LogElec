package com.ads.LogElec.dto;

import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.PerfilAcesso;
import com.ads.LogElec.entity.StatusConta;
import com.ads.LogElec.entity.TipoEmpresa;
import com.ads.LogElec.security.EmpresaSessionPrincipal;

public class SessaoUsuarioDTO {
    private Long id;
    private String nome;
    private String nomeRazao;
    private String email;
    private String cnpj;
    private TipoEmpresa tipo;
    private PerfilAcesso perfilAcesso;
    private StatusConta statusConta;
    private String endereco;
    private String telefone;

    public static SessaoUsuarioDTO fromEmpresa(Empresa empresa) {
        SessaoUsuarioDTO dto = new SessaoUsuarioDTO();
        dto.id = empresa.getId();
        dto.nome = empresa.getNome();
        dto.nomeRazao = empresa.getNome();
        dto.email = empresa.getEmail();
        dto.cnpj = empresa.getCnpj();
        dto.tipo = empresa.getTipo();
        dto.perfilAcesso = empresa.getPerfilAcesso();
        dto.statusConta = empresa.getStatusConta();
        dto.endereco = empresa.getEndereco();
        dto.telefone = empresa.getTelefone();
        return dto;
    }

    public static SessaoUsuarioDTO fromPrincipal(EmpresaSessionPrincipal principal) {
        SessaoUsuarioDTO dto = new SessaoUsuarioDTO();
        dto.id = principal.getId();
        dto.nome = principal.getNome();
        dto.nomeRazao = principal.getNome();
        dto.email = principal.getEmail();
        dto.cnpj = principal.getCnpj();
        dto.tipo = principal.getTipo();
        dto.perfilAcesso = principal.getPerfilAcesso();
        dto.statusConta = principal.getStatusConta();
        dto.endereco = principal.getEndereco();
        dto.telefone = principal.getTelefone();
        return dto;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getNomeRazao() { return nomeRazao; }
    public String getEmail() { return email; }
    public String getCnpj() { return cnpj; }
    public TipoEmpresa getTipo() { return tipo; }
    public PerfilAcesso getPerfilAcesso() { return perfilAcesso; }
    public StatusConta getStatusConta() { return statusConta; }
    public String getEndereco() { return endereco; }
    public String getTelefone() { return telefone; }
}