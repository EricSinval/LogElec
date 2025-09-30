package com.ads.LogElec.service;

import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.repository.EmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EmpresaService {

    @Autowired
    private EmpresaRepository empresaRepository;

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
        
        return empresaRepository.save(empresa);
    }

    public Empresa findByEmail(String email) {
        return empresaRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
    }

    // NOVO MÉTODO: Buscar por tipo
    public List<Empresa> findByTipo(String tipo) {
        return empresaRepository.findByTipo(com.ads.LogElec.entity.TipoEmpresa.valueOf(tipo));
    }
}
