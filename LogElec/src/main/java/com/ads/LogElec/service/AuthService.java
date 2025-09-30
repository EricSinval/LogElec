package com.ads.LogElec.service;

import com.ads.LogElec.entity.Empresa;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private EmpresaService empresaService;

    public Empresa login(String email, String senha) {
        Empresa empresa = empresaService.findByEmail(email);
        
        if (empresa.getSenha().equals(senha)) {
            empresa.setSenha(null); // Não retornar senha
            return empresa;
        } else {
            throw new RuntimeException("Senha inválida");
        }
    }
}