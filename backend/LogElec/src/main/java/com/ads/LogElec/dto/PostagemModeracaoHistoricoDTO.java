package com.ads.LogElec.dto;

import com.ads.LogElec.entity.PostagemModeracaoHistorico;
import com.ads.LogElec.entity.StatusModeracaoPostagem;
import java.time.LocalDateTime;

public class PostagemModeracaoHistoricoDTO {
    private Long id;
    private StatusModeracaoPostagem statusModeracao;
    private String motivoModeracao;
    private LocalDateTime moderadoEm;
    private String moderadoPor;

    public static PostagemModeracaoHistoricoDTO fromEntity(PostagemModeracaoHistorico historico) {
        PostagemModeracaoHistoricoDTO dto = new PostagemModeracaoHistoricoDTO();
        dto.id = historico.getId();
        dto.statusModeracao = historico.getStatusModeracao();
        dto.motivoModeracao = historico.getMotivoModeracao();
        dto.moderadoEm = historico.getModeradoEm();
        dto.moderadoPor = historico.getModeradoPor();
        return dto;
    }

    public Long getId() { return id; }
    public StatusModeracaoPostagem getStatusModeracao() { return statusModeracao; }
    public String getMotivoModeracao() { return motivoModeracao; }
    public LocalDateTime getModeradoEm() { return moderadoEm; }
    public String getModeradoPor() { return moderadoPor; }
}