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

    // ✅ TESTE - Verificar se está funcionando
    @GetMapping("/teste")
    public String teste() {
        return "🎉 LogElec Backend está rodando perfeitamente!";
    }

    // ✅ HOME
    @GetMapping("/")
    public String home() {
        return "🏠 Bem-vindo ao LogElec - Sistema de Descarte Eletrônico";
    }

    // ✅ LISTAR TODAS EMPRESAS
    @GetMapping("/teste/empresas")
    public List<Empresa> listarEmpresas() {
        return empresaRepository.findAll(); 
    }

    // ✅ CRIAR NOVA EMPRESA (CADASTRO)
    @PostMapping("/teste/empresas")
    public Empresa criarEmpresa(@RequestBody Empresa empresa) {
        return empresaRepository.save(empresa);
    }

    // ✅ LISTAR EMPRESAS DE COLETA
    @GetMapping("/teste/empresas/coleta")
    public List<Empresa> listarColetoras() {
        return empresaRepository.findByTipo(TipoEmpresa.COLETA);
    }

    // ✅ LISTAR EMPRESAS DE DESCARTE  
    @GetMapping("/teste/empresas/descarte")
    public List<Empresa> listarDescartadoras() {
        return empresaRepository.findByTipo(TipoEmpresa.DESCARTE);
    }
}