// src/main/java/com/ads/LogElec/service/EmpresaService.java
package com.ads.LogElec.service;

import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.TipoEmpresa;
import com.ads.LogElec.repository.EmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@Service
@Validated
public class EmpresaService {

    @Autowired
    private EmpresaRepository empresaRepository;

    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public List<Empresa> findAll() {
        return empresaRepository.findAll();
    }

    public Optional<Empresa> findById(Long id) {
        return empresaRepository.findById(id);
    }

    public Optional<Empresa> findByEmail(String email) {
        return empresaRepository.findByEmail(email);
    }

    public List<Empresa> findByTipo(String tipo) {
        return empresaRepository.findByTipo(TipoEmpresa.valueOf(tipo.toUpperCase()));
    }

    public Empresa createEmpresa(@Valid Empresa empresa) {
        // VALIDAÇÃO 1: Email único
        if (empresaRepository.findByEmail(empresa.getEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }
        
        // VALIDAÇÃO 2: CNPJ único  
        if (empresaRepository.findByCnpj(empresa.getCnpj()).isPresent()) {
            throw new RuntimeException("CNPJ já cadastrado");
        }
        
        // VALIDAÇÃO 3: CNPJ matemático
        if (!empresa.isCnpjValido()) {
            throw new RuntimeException("CNPJ inválido");
        }
        
        // VALIDAÇÃO 4: Senha forte
        if (empresa.getSenha().length() < 6) {
            throw new RuntimeException("Senha deve ter no mínimo 6 caracteres");
        }
        
        // HASH DA SENHA ANTES DE SALVAR
        String senhaHash = passwordEncoder.encode(empresa.getSenha());
        empresa.setSenha(senhaHash);
        
        return empresaRepository.save(empresa);
    }
}