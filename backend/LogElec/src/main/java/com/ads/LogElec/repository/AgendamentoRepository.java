package com.ads.LogElec.repository;

import com.ads.LogElec.entity.Agendamento;
import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.Postagem;
import com.ads.LogElec.entity.StatusAgendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    
    // ✅ Buscar agendamentos por empresa SOLICITANTE
    List<Agendamento> findByEmpresaSolicitante(Empresa empresaSolicitante);
    
    // ✅ Buscar agendamentos por empresa COLETORA
    List<Agendamento> findByEmpresaColetora(Empresa empresaColetora);
    
    // ✅ Buscar agendamentos por POSTAGEM
    List<Agendamento> findByPostagem(Postagem postagem);
    
    // ✅ Buscar agendamentos por STATUS
    List<Agendamento> findByStatus(StatusAgendamento status);
    
    // ✅ Buscar agendamentos por empresa SOLICITANTE e STATUS (NOVO)
    List<Agendamento> findByEmpresaSolicitanteAndStatus(Empresa empresaSolicitante, StatusAgendamento status);
    
    // ✅ Buscar agendamentos por empresa COLETORA e STATUS
    List<Agendamento> findByEmpresaColetoraAndStatus(Empresa empresaColetora, StatusAgendamento status);
    
    // ✅ CONTAR agendamentos por STATUS (NOVO)
    Long countByStatus(StatusAgendamento status);
    
    // ✅ Buscar agendamentos por empresa COLETORA, DATA/HORA e STATUS diferente
    List<Agendamento> findByEmpresaColetoraAndDataHoraAndStatusNot(
        Empresa empresaColetora, 
        LocalDateTime dataHora,
        StatusAgendamento status
    );
    
    // ✅ Buscar agendamentos FUTUROS
    @Query("SELECT a FROM Agendamento a WHERE a.dataHora > :dataAtual ORDER BY a.dataHora ASC")
    List<Agendamento> findAgendamentosFuturos(@Param("dataAtual") LocalDateTime dataAtual);
    
    // ✅ Buscar agendamentos por PERÍODO
    @Query("SELECT a FROM Agendamento a WHERE a.dataHora BETWEEN :inicio AND :fim ORDER BY a.dataHora ASC")
    List<Agendamento> findByDataHoraBetween(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
    
    // ✅ Buscar agendamento com todas as relações (para evitar LazyLoading)
    @Query("SELECT a FROM Agendamento a LEFT JOIN FETCH a.postagem LEFT JOIN FETCH a.empresaSolicitante LEFT JOIN FETCH a.empresaColetora WHERE a.id = :id")
    Optional<Agendamento> findByIdWithDetails(@Param("id") Long id);

    // No seu AgendamentoRepository.java, adicione:
    Optional<Agendamento> findById(Long id);
}