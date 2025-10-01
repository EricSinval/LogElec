package com.ads.LogElec.service;

import com.ads.LogElec.dto.CadastroResiduoDTO;
import com.ads.LogElec.entity.Residuo;
import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.StatusResiduo;
import com.ads.LogElec.repository.ResiduoRepository;
import com.ads.LogElec.repository.EmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class ResiduoService {

    @Autowired
    private ResiduoRepository residuoRepository;
    
    @Autowired
    private EmpresaRepository empresaRepository;
    
    // Diretório para salvar as fotos
    private final String UPLOAD_DIR = "uploads/residuos/";

    public List<Residuo> findAll() {
        return residuoRepository.findAll();
    }
    
    public List<Residuo> findByEmpresa(Long empresaId) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
        return residuoRepository.findByEmpresa(empresa);
    }
    
    // ✅ MÉTODO findPendentes CORRIGIDO (ÚNICO)
    public List<Residuo> findPendentes() {
        List<Residuo> residuos = residuoRepository.findByStatusOrderByDataCadastroDesc(StatusResiduo.PENDENTE);
        
        // Carrega os dados da empresa para evitar LazyLoading
        for (Residuo residuo : residuos) {
            if (residuo.getEmpresa() != null) {
                // Acessa os campos para forçar o carregamento
                residuo.getEmpresa().getNome();
                residuo.getEmpresa().getEndereco();
                residuo.getEmpresa().getTelefone();
                residuo.getEmpresa().getEmail();
            }
        }
        
        return residuos;
    }

    public Residuo cadastrarResiduo(CadastroResiduoDTO dto) {
        try {
            // Buscar empresa
            Empresa empresa = empresaRepository.findById(dto.getEmpresaId())
                    .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
            
            // Converter peso de "15kg" para Double
            Double peso = converterPeso(dto.getPeso());
            
            // Salvar foto se existir
            String fotoPath = null;
            if (dto.getFoto() != null && !dto.getFoto().isEmpty()) {
                fotoPath = salvarFoto(dto.getFoto());
            }
            
            // Criar entidade Residuo
            Residuo residuo = new Residuo();
            residuo.setTipo(dto.getTipo());
            residuo.setPeso(peso);
            residuo.setEnderecoRetirada(dto.getEndereco());
            residuo.setFotoPath(fotoPath);
            residuo.setEmpresa(empresa);
            residuo.setStatus(StatusResiduo.PENDENTE);
            
            return residuoRepository.save(residuo);
            
        } catch (Exception e) {
            throw new RuntimeException("Erro ao cadastrar resíduo: " + e.getMessage());
        }
    }
    
    private Double converterPeso(String pesoStr) {
        try {
            // Remove "kg" e espaços, converte para Double
            String pesoLimpo = pesoStr.replace("kg", "").replace("KG", "").replace("Kg", "").trim();
            return Double.parseDouble(pesoLimpo);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Formato de peso inválido. Use ex: '15kg' ou '15.5'");
        }
    }
    
    private String salvarFoto(MultipartFile foto) throws IOException {
        // Criar diretório se não existir
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Gerar nome único para o arquivo
        String fileName = System.currentTimeMillis() + "_" + foto.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        
        // Salvar arquivo
        Files.copy(foto.getInputStream(), filePath);
        
        return filePath.toString();
    }
    
    public Residuo findById(Long id) {
        return residuoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resíduo não encontrado"));
    }
    
    public void deleteById(Long id) {
        residuoRepository.deleteById(id);
    }
}