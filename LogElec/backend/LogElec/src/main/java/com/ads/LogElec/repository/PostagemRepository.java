package com.ads.LogElec.repository;

import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.Postagem;
import com.ads.LogElec.entity.StatusPostagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostagemRepository extends JpaRepository<Postagem, Long> {
    List<Postagem> findByEmpresaId(Long empresaId);
    List<Postagem> findByEmpresaAndStatus(Empresa empresa, StatusPostagem status);
    List<Postagem> findByStatus(StatusPostagem status);
    List<Postagem> findByTipoResiduoContainingIgnoreCase(String tipoResiduo);
    List<Postagem> findByEmpresaTipo(com.ads.LogElec.entity.TipoEmpresa tipo);
}