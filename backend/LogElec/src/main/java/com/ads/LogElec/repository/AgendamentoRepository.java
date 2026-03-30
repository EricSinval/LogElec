package com.ads.LogElec.repository;

import com.ads.LogElec.entity.Agendamento;
import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.Postagem;
import com.ads.LogElec.entity.StatusAgendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    
    
    List<Agendamento> findByEmpresaSolicitante(Empresa empresaSolicitante);
    
    
    List<Agendamento> findByEmpresaColetora(Empresa empresaColetora);
    
    
    List<Agendamento> findByPostagem(Postagem postagem);
    
    
    List<Agendamento> findByStatus(StatusAgendamento status);
    
    
    List<Agendamento> findByEmpresaSolicitanteAndStatus(Empresa empresaSolicitante, StatusAgendamento status);
    
    
    List<Agendamento> findByEmpresaColetoraAndStatus(Empresa empresaColetora, StatusAgendamento status);
    
    
    Long countByStatus(StatusAgendamento status);
    
    
    List<Agendamento> findByEmpresaColetoraAndDataHoraAndStatusNot(
        Empresa empresaColetora, 
        LocalDateTime dataHora,
        StatusAgendamento status
    );
    
    
    @Query("SELECT a FROM Agendamento a WHERE a.dataHora > :dataAtual ORDER BY a.dataHora ASC")
    List<Agendamento> findAgendamentosFuturos(@Param("dataAtual") LocalDateTime dataAtual);
    
    
    @Query("SELECT a FROM Agendamento a WHERE a.dataHora BETWEEN :inicio AND :fim ORDER BY a.dataHora ASC")
    List<Agendamento> findByDataHoraBetween(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
    
    
    @Query("SELECT a FROM Agendamento a LEFT JOIN FETCH a.postagem LEFT JOIN FETCH a.empresaSolicitante LEFT JOIN FETCH a.empresaColetora WHERE a.id = :id")
    Optional<Agendamento> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT a FROM Agendamento a WHERE a.status = :status AND (a.empresaSolicitante.id = :empresaId OR a.empresaColetora.id = :empresaId) ORDER BY a.updatedAt DESC")
    List<Agendamento> findByEmpresaIdAndStatus(@Param("empresaId") Long empresaId, @Param("status") StatusAgendamento status);

    @Query("SELECT COUNT(a) > 0 FROM Agendamento a WHERE a.status = :status AND ((a.empresaSolicitante.id = :empresaAId AND a.empresaColetora.id = :empresaBId) OR (a.empresaSolicitante.id = :empresaBId AND a.empresaColetora.id = :empresaAId))")
    boolean existsByEmpresasAndStatus(@Param("empresaAId") Long empresaAId, @Param("empresaBId") Long empresaBId, @Param("status") StatusAgendamento status);

    @Query("SELECT a FROM Agendamento a WHERE a.status = :status AND ((a.empresaSolicitante.id = :empresaAId AND a.empresaColetora.id = :empresaBId) OR (a.empresaSolicitante.id = :empresaBId AND a.empresaColetora.id = :empresaAId)) ORDER BY a.dataHora DESC")
    List<Agendamento> findByEmpresasAndStatusOrderByDataHoraDesc(@Param("empresaAId") Long empresaAId, @Param("empresaBId") Long empresaBId, @Param("status") StatusAgendamento status);

    
    Optional<Agendamento> findById(Long id);

    @Transactional
    @Modifying
    long deleteByPostagemId(Long postagemId);
}