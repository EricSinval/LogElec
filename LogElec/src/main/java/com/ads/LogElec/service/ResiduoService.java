package com.ads.LogElec.service;

import com.ads.LogElec.dto.CadastroResiduoDTO;
import com.ads.LogElec.entity.Residuo;
import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.CategoriaResiduo;
import com.ads.LogElec.repository.ResiduoRepository;
import com.ads.LogElec.repository.EmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResiduoService {

    @Autowired
    private ResiduoRepository residuoRepository;
    
    @Autowired
    private EmpresaRepository empresaRepository;

    public List<Residuo> findAll() {
        return residuoRepository.findAll();
    }
    
    public List<Residuo> findByEmpresa(Long empresaId) {
        Optional<Empresa> empresa = empresaRepository.findById(empresaId);
        return empresa.map(residuoRepository::findByEmpresa).orElse(List.of());
    }
    
    public List<Residuo> findDisponiveis() {
        return residuoRepository.findAllByOrderByDataCadastroDesc();
    }
    
    public Residuo findById(Long id) {
        return residuoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resíduo não encontrado"));
    }
    
    public Residuo cadastrarResiduo(CadastroResiduoDTO cadastroDTO) {
        // Buscar empresa
        Empresa empresa = empresaRepository.findById(cadastroDTO.getEmpresaId())
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
        
        // Converter categoria de String para Enum
        CategoriaResiduo categoria;
        try {
            categoria = CategoriaResiduo.valueOf(cadastroDTO.getCategoria().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Categoria inválida: " + cadastroDTO.getCategoria());
        }
        
        // Criar resíduo
        Residuo residuo = new Residuo(
            cadastroDTO.getNome(),
            cadastroDTO.getDescricao(),
            categoria,
            cadastroDTO.getPeso(),
            cadastroDTO.getEndereco(),
            empresa
        );
        
        // TODO: Processar foto se existir
        if (cadastroDTO.getFoto() != null && !cadastroDTO.getFoto().isEmpty()) {
            // Implementar upload de foto depois
            residuo.setFotoUrl("/uploads/" + cadastroDTO.getFoto().getOriginalFilename());
        }
        
        return residuoRepository.save(residuo);
    }
    
    public void deleteById(Long id) {
        if (!residuoRepository.existsById(id)) {
            throw new RuntimeException("Resíduo não encontrado");
        }
        residuoRepository.deleteById(id);
    }
}