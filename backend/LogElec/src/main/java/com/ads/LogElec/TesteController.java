package com.ads.LogElec;

import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.TipoEmpresa; 
import com.ads.LogElec.repository.EmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TesteController {

    @Autowired
    private EmpresaRepository empresaRepository;

    
    @GetMapping("/teste")
    public String teste() {
        return "🎉 LogElec Backend está rodando perfeitamente!";
    }

    
    @GetMapping("/")
    public String home() {
        return "🏠 Bem-vindo ao LogElec - Sistema de Descarte Eletrônico";
    }

    
    @GetMapping("/teste/empresas")
    public List<Empresa> listarEmpresas() {
        return empresaRepository.findAll(); 
    }

    
    @PostMapping("/teste/empresas")
    public Empresa criarEmpresa(@RequestBody Empresa empresa) {
        return empresaRepository.save(empresa);
    }

    
    @GetMapping("/teste/empresas/coleta")
    public List<Empresa> listarColetoras() {
        return empresaRepository.findByTipo(TipoEmpresa.COLETA);
    }

    
    @GetMapping("/teste/empresas/descarte")
    public List<Empresa> listarDescartadoras() {
        return empresaRepository.findByTipo(TipoEmpresa.DESCARTE);
    }
}