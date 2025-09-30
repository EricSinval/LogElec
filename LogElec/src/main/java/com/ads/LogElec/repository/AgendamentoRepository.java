package com.ads.LogElec.repository;

import com.ads.LogElec.entity.Agendamento;
import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.StatusAgendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    
    // 📋 Buscar agendamentos por empresa solicitante (que descarta)
    List<Agendamento> findByEmpresaSolicitante(Empresa empresa);
    
    // 🏢 Buscar agendamentos por empresa coletora 
    List<Agendamento> findByEmpresaColetora(Empresa empresa);
    
    // 📊 Buscar agendamentos por status
    List<Agendamento> findByStatus(StatusAgendamento status);
    
    // 🔍 Buscar agendamentos de uma empresa (tanto como solicitante quanto coletora)
    List<Agendamento> findByEmpresaSolicitanteOrEmpresaColetora(Empresa solicitante, Empresa coletora);
}