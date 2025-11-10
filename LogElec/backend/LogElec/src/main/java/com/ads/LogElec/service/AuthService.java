package com.ads.LogElec.service;

import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.repository.EmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private EmpresaRepository empresaRepository;

    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Empresa login(String email, String senha) {
        Optional<Empresa> empresaOpt = empresaRepository.findByEmail(email);
        
        if (empresaOpt.isPresent()) {
            Empresa empresa = empresaOpt.get();
            // ✅ CORRETO: Compara senha em texto com hash usando BCrypt
            if (passwordEncoder.matches(senha, empresa.getSenha())) {
                return empresa;
            } else {
                throw new RuntimeException("Senha incorreta");
            }
        } else {
            throw new RuntimeException("Empresa não encontrada com esse email");
        }
    }
}