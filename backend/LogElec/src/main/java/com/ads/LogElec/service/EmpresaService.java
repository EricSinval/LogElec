package com.ads.LogElec.service;

import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.repository.EmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class EmpresaService {

    @Autowired
    private EmpresaRepository empresaRepository;

    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public List<Empresa> findAll() {
        return empresaRepository.findAll();
    }

    public Empresa createEmpresa(Empresa empresa) {
        // VALIDAÇÃO 1: Email único
        if (empresaRepository.findByEmail(empresa.getEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }
        
        // VALIDAÇÃO 2: CNPJ único  
        if (empresaRepository.findByCnpj(empresa.getCnpj()).isPresent()) {
            throw new RuntimeException("CNPJ já cadastrado");
        }
        
        // ✅ HASH DA SENHA ANTES DE SALVAR
        String senhaHash = passwordEncoder.encode(empresa.getSenha());
        empresa.setSenha(senhaHash);
        
        return empresaRepository.save(empresa);
    }

    public Optional<Empresa> findByEmail(String email) {
        return empresaRepository.findByEmail(email);
    }

    public List<Empresa> findByTipo(String tipo) {
        return empresaRepository.findByTipo(com.ads.LogElec.entity.TipoEmpresa.valueOf(tipo));
    }

    public Optional<Empresa> findById(Long id) {
        return empresaRepository.findById(id);
    }
}