package com.ads.LogElec.repository;

import com.ads.LogElec.entity.Agendamento;
import com.ads.LogElec.entity.StatusAgendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    List<Agendamento> findByEmpresaSolicitanteId(Long empresaId);
    List<Agendamento> findByEmpresaColetoraId(Long empresaId);
    List<Agendamento> findByStatus(StatusAgendamento status);
    List<Agendamento> findByPostagemId(Long postagemId);
}