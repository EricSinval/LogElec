package com.ads.LogElec.repository;

import com.ads.LogElec.entity.PostagemModeracaoHistorico;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostagemModeracaoHistoricoRepository extends JpaRepository<PostagemModeracaoHistorico, Long> {
    long deleteByPostagemId(Long postagemId);

    List<PostagemModeracaoHistorico> findByPostagemIdOrderByModeradoEmDescIdDesc(Long postagemId);
}