package com.ads.LogElec.dto;

import com.ads.LogElec.entity.Postagem;
import com.ads.LogElec.entity.StatusModeracaoPostagem;
import com.ads.LogElec.entity.StatusPostagem;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class PostagemEmpresaDTO {
    private Long id;
    private Long empresaId;
    private String titulo;
    private String descricao;
    private String tipoResiduo;
    private BigDecimal peso;
    private BigDecimal maxPesoColeta;
    private String enderecoRetirada;
    private String fotoEmpresa;
    private String fotoResiduos;
    private String diasDisponibilidade;
    private LocalTime horaInicio;
    private LocalTime horaFim;
    private StatusPostagem status;
    private StatusModeracaoPostagem statusModeracao;
    private String motivoModeracao;
    private LocalDateTime moderadoEm;
    private String moderadoPor;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PostagemModeracaoHistoricoDTO> historicoModeracao;

    public static PostagemEmpresaDTO fromEntity(Postagem postagem, List<PostagemModeracaoHistoricoDTO> historicoModeracao) {
        PostagemEmpresaDTO dto = new PostagemEmpresaDTO();
        dto.id = postagem.getId();
        dto.empresaId = postagem.getEmpresa() != null ? postagem.getEmpresa().getId() : null;
        dto.titulo = postagem.getTitulo();
        dto.descricao = postagem.getDescricao();
        dto.tipoResiduo = postagem.getTipoResiduo();
        dto.peso = postagem.getPeso();
        dto.maxPesoColeta = postagem.getMaxPesoColeta();
        dto.enderecoRetirada = postagem.getEnderecoRetirada();
        dto.fotoEmpresa = postagem.getFotoEmpresa();
        dto.fotoResiduos = postagem.getFotoResiduos();
        dto.diasDisponibilidade = postagem.getDiasDisponibilidade();
        dto.horaInicio = postagem.getHoraInicio();
        dto.horaFim = postagem.getHoraFim();
        dto.status = postagem.getStatus();
        dto.statusModeracao = postagem.getStatusModeracao();
        dto.motivoModeracao = postagem.getMotivoModeracao();
        dto.moderadoEm = postagem.getModeradoEm();
        dto.moderadoPor = postagem.getModeradoPor();
        dto.createdAt = postagem.getCreatedAt();
        dto.updatedAt = postagem.getUpdatedAt();
        dto.historicoModeracao = historicoModeracao;
        return dto;
    }

    public Long getId() { return id; }
    public Long getEmpresaId() { return empresaId; }
    public String getTitulo() { return titulo; }
    public String getDescricao() { return descricao; }
    public String getTipoResiduo() { return tipoResiduo; }
    public BigDecimal getPeso() { return peso; }
    public BigDecimal getMaxPesoColeta() { return maxPesoColeta; }
    public String getEnderecoRetirada() { return enderecoRetirada; }
    public String getFotoEmpresa() { return fotoEmpresa; }
    public String getFotoResiduos() { return fotoResiduos; }
    public String getDiasDisponibilidade() { return diasDisponibilidade; }
    public LocalTime getHoraInicio() { return horaInicio; }
    public LocalTime getHoraFim() { return horaFim; }
    public StatusPostagem getStatus() { return status; }
    public StatusModeracaoPostagem getStatusModeracao() { return statusModeracao; }
    public String getMotivoModeracao() { return motivoModeracao; }
    public LocalDateTime getModeradoEm() { return moderadoEm; }
    public String getModeradoPor() { return moderadoPor; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public List<PostagemModeracaoHistoricoDTO> getHistoricoModeracao() { return historicoModeracao; }
}