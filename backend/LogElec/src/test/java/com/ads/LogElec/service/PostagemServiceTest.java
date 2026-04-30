package com.ads.LogElec.service;

import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.PerfilAcesso;
import com.ads.LogElec.entity.Postagem;
import com.ads.LogElec.entity.StatusConta;
import com.ads.LogElec.entity.StatusModeracaoPostagem;
import com.ads.LogElec.entity.StatusPostagem;
import com.ads.LogElec.entity.TipoEmpresa;
import com.ads.LogElec.repository.AgendamentoRepository;
import com.ads.LogElec.repository.PostagemRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostagemServiceTest {

    @Mock
    private PostagemRepository postagemRepository;

    @Mock
    private AgendamentoRepository agendamentoRepository;

    @InjectMocks
    private PostagemService postagemService;

    @Test
    void saveDefineModeracaoPendenteQuandoNaoInformada() {
        Postagem postagem = novaPostagem();
        postagem.setStatusModeracao(null);

        when(postagemRepository.save(any(Postagem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Postagem salva = postagemService.save(postagem);

        assertThat(salva.getStatusModeracao()).isEqualTo(StatusModeracaoPostagem.PENDENTE);
    }

    @Test
    void updateResetaModeracaoQuandoConteudoEAlterado() {
        Postagem existente = novaPostagem();
        existente.setId(10L);
        existente.setStatus(StatusPostagem.ABERTA);
        existente.setStatusModeracao(StatusModeracaoPostagem.APROVADA);
        existente.setMotivoModeracao("Conteúdo aprovado");
        existente.setModeradoPor("Administrador");
        existente.setModeradoEm(LocalDateTime.now());

        Postagem alteracoes = new Postagem();
        alteracoes.setDescricao("Nova descrição para a postagem");

        when(postagemRepository.findById(10L)).thenReturn(Optional.of(existente));
        when(postagemRepository.save(any(Postagem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Postagem atualizada = postagemService.update(10L, alteracoes);

        assertThat(atualizada.getDescricao()).isEqualTo("Nova descrição para a postagem");
        assertThat(atualizada.getStatusModeracao()).isEqualTo(StatusModeracaoPostagem.PENDENTE);
        assertThat(atualizada.getMotivoModeracao()).isNull();
        assertThat(atualizada.getModeradoPor()).isNull();
        assertThat(atualizada.getModeradoEm()).isNull();
    }

    @Test
    void moderarPostagemAtualizaCamposDeModeracao() {
        Postagem existente = novaPostagem();
        existente.setId(20L);

        when(postagemRepository.findById(20L)).thenReturn(Optional.of(existente));
        when(postagemRepository.save(any(Postagem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Postagem moderada = postagemService.moderarPostagem(20L, StatusModeracaoPostagem.REJEITADA, "Conteúdo incompleto", "Administrador LogElec");

        assertThat(moderada.getStatusModeracao()).isEqualTo(StatusModeracaoPostagem.REJEITADA);
        assertThat(moderada.getMotivoModeracao()).isEqualTo("Conteúdo incompleto");
        assertThat(moderada.getModeradoPor()).isEqualTo("Administrador LogElec");
        assertThat(moderada.getModeradoEm()).isNotNull();
    }

    private Postagem novaPostagem() {
        Empresa empresa = new Empresa();
        empresa.setId(1L);
        empresa.setNome("Empresa de Teste");
        empresa.setCnpj("70000000000179");
        empresa.setEmail("empresa@logelec.com");
        empresa.setSenha("senha-hash");
        empresa.setTipo(TipoEmpresa.DESCARTE);
        empresa.setPerfilAcesso(PerfilAcesso.EMPRESA);
        empresa.setStatusConta(StatusConta.ATIVA);
        empresa.setEndereco("Rua de Teste, 100");

        Postagem postagem = new Postagem();
        postagem.setEmpresa(empresa);
        postagem.setTitulo("Lote de baterias");
        postagem.setDescricao("Baterias para descarte");
        postagem.setTipoResiduo("Baterias");
        postagem.setPeso(BigDecimal.valueOf(120));
        postagem.setEnderecoRetirada("Rua de Teste, 100");
        postagem.setStatus(StatusPostagem.ABERTA);
        return postagem;
    }
}