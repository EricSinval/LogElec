package com.ads.LogElec.repository;

import com.ads.LogElec.entity.Residuo;
import com.ads.LogElec.entity.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResiduoRepository extends JpaRepository<Residuo, Long> {
    
    // Buscar resíduos por empresa
    List<Residuo> findByEmpresa(Empresa empresa);
    
    // Buscar todos ordenados por data (para "disponíveis")
    List<Residuo> findAllByOrderByDataCadastroDesc();
}