package com.ads.LogElec.repository;

import com.ads.LogElec.entity.Residuo;
import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.StatusResiduo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResiduoRepository extends JpaRepository<Residuo, Long> {
    
    // Buscar resíduos por empresa
    List<Residuo> findByEmpresa(Empresa empresa);
    
    // Buscar resíduos por status
    List<Residuo> findByStatus(StatusResiduo status);
    
    // Buscar resíduos pendentes (não agendados)
    List<Residuo> findByStatusOrderByDataCadastroDesc(StatusResiduo status);
}