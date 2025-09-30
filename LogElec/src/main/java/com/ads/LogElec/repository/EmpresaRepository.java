package com.ads.LogElec.repository;

import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.TipoEmpresa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    
    // Encontrar empresa por CNPJ
    Optional<Empresa> findByCnpj(String cnpj);
    
    // Encontrar empresa por email
    Optional<Empresa> findByEmail(String email);
    
    // Listar empresas por tipo (COLETA ou DESCARTE)
    List<Empresa> findByTipo(TipoEmpresa tipo);
    
    // Verificar se CNPJ já existe
    boolean existsByCnpj(String cnpj);
    
    // Verificar se email já existe  
    boolean existsByEmail(String email);
}