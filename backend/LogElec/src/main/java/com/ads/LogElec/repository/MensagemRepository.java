package com.ads.LogElec.repository;

import com.ads.LogElec.entity.Mensagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface MensagemRepository extends JpaRepository<Mensagem, Long> {
    List<Mensagem> findByAgendamentoId(Long agendamentoId);
    List<Mensagem> findByEmpresaRemetenteIdOrEmpresaDestinatarioId(Long remetenteId, Long destinatarioId);
    @Transactional
    long deleteByEmpresaRemetenteIdOrEmpresaDestinatarioId(Long remetenteId, Long destinatarioId);
    List<Mensagem> findByEmpresaDestinatarioIdAndLidoFalse(Long destinatarioId);
    List<Mensagem> findByAgendamentoIdAndEmpresaDestinatarioId(Long agendamentoId, Long destinatarioId);

    @Query("SELECT m FROM Mensagem m WHERE ((m.empresaRemetente.id = :empresaAId AND m.empresaDestinatario.id = :empresaBId) OR (m.empresaRemetente.id = :empresaBId AND m.empresaDestinatario.id = :empresaAId)) ORDER BY m.createdAt ASC")
    List<Mensagem> findConversaEntreEmpresas(@Param("empresaAId") Long empresaAId, @Param("empresaBId") Long empresaBId);
}