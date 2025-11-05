package com.ads.LogElec.repository;

import com.ads.LogElec.entity.Mensagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MensagemRepository extends JpaRepository<Mensagem, Long> {
    List<Mensagem> findByAgendamentoId(Long agendamentoId);
    List<Mensagem> findByEmpresaRemetenteIdOrEmpresaDestinatarioId(Long remetenteId, Long destinatarioId);
    List<Mensagem> findByEmpresaDestinatarioIdAndLidoFalse(Long destinatarioId);
    List<Mensagem> findByAgendamentoIdAndEmpresaDestinatarioId(Long agendamentoId, Long destinatarioId);
}