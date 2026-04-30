package com.ads.LogElec.service;

import com.ads.LogElec.dto.AgendamentoDTO;
import com.ads.LogElec.entity.Agendamento;
import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.Postagem;
import com.ads.LogElec.entity.StatusAgendamento;
import com.ads.LogElec.entity.TipoEmpresa;
import com.ads.LogElec.repository.AgendamentoRepository;
import com.ads.LogElec.repository.EmpresaRepository;
import com.ads.LogElec.repository.PostagemRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AgendamentoServiceTest {

    @Mock
    private AgendamentoRepository agendamentoRepository;

    @Mock
    private EmpresaRepository empresaRepository;

    @Mock
    private PostagemRepository postagemRepository;

    @InjectMocks
    private AgendamentoService agendamentoService;

    @Test
    void criarAgendamentoDefinePrestadoraEClienteConformeTipoDasEmpresas() {
        Empresa empresaColeta = novaEmpresa(1L, TipoEmpresa.COLETA);
        Empresa empresaDescarte = novaEmpresa(2L, TipoEmpresa.DESCARTE);
        Postagem postagem = new Postagem();
        postagem.setId(30L);
        postagem.setEmpresa(empresaDescarte);

        AgendamentoDTO dto = new AgendamentoDTO();
        dto.setEmpresaSolicitanteId(1L);
        dto.setEmpresaColetoraId(2L);
        dto.setPostagemId(30L);
        dto.setDataAgendamento(LocalDate.now().plusDays(2));
        dto.setHoraAgendamento(LocalTime.of(10, 0));
        dto.setObservacoes("Coleta reversa para validar regra de negócio");

        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresaColeta));
        when(empresaRepository.findById(2L)).thenReturn(Optional.of(empresaDescarte));
        when(postagemRepository.findById(30L)).thenReturn(Optional.of(postagem));
        when(agendamentoRepository.findByEmpresaColetoraAndDataHoraAndStatusNotIn(
                eq(empresaDescarte),
                any(LocalDateTime.class),
                eq(List.of(StatusAgendamento.CANCELADA, StatusAgendamento.RECUSADO))
        )).thenReturn(List.of());
        when(agendamentoRepository.save(any(Agendamento.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Agendamento agendamento = agendamentoService.criarAgendamento(dto);

        assertThat(agendamento.getEmpresaPrestadora()).isEqualTo(empresaColeta);
        assertThat(agendamento.getEmpresaCliente()).isEqualTo(empresaDescarte);
        assertThat(agendamento.getStatus()).isEqualTo(StatusAgendamento.AGENDADA);
    }

    @Test
    void concluirAgendamentoPermiteSomenteEmpresaDeColeta() {
        Empresa empresaColeta = novaEmpresa(1L, TipoEmpresa.COLETA);
        Empresa empresaDescarte = novaEmpresa(2L, TipoEmpresa.DESCARTE);
        Agendamento agendamento = novoAgendamentoConfirmado(10L, empresaColeta, empresaDescarte);

        when(agendamentoRepository.findById(10L)).thenReturn(Optional.of(agendamento));
        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresaColeta));
        when(agendamentoRepository.save(any(Agendamento.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Agendamento atualizado = agendamentoService.concluirAgendamento(10L, 1L);

        assertThat(atualizado.getStatus()).isEqualTo(StatusAgendamento.REALIZADA);
    }

    @Test
    void concluirAgendamentoRejeitaEmpresaQueNaoEhDeColeta() {
        Empresa empresaColeta = novaEmpresa(1L, TipoEmpresa.COLETA);
        Empresa empresaDescarte = novaEmpresa(2L, TipoEmpresa.DESCARTE);
        Agendamento agendamento = novoAgendamentoConfirmado(10L, empresaColeta, empresaDescarte);

        when(agendamentoRepository.findById(10L)).thenReturn(Optional.of(agendamento));
        when(empresaRepository.findById(2L)).thenReturn(Optional.of(empresaDescarte));

        assertThatThrownBy(() -> agendamentoService.concluirAgendamento(10L, 2L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Apenas a empresa de coleta pode concluir a coleta");

        verify(agendamentoRepository, never()).save(any(Agendamento.class));
    }

    private Agendamento novoAgendamentoConfirmado(Long id, Empresa empresaColeta, Empresa empresaDescarte) {
        Agendamento agendamento = new Agendamento();
        agendamento.setId(id);
        agendamento.setStatus(StatusAgendamento.CONFIRMADA);
        agendamento.setEmpresaSolicitante(empresaDescarte);
        agendamento.setEmpresaColetora(empresaDescarte);
        agendamento.setEmpresaPrestadora(empresaColeta);
        agendamento.setEmpresaCliente(empresaDescarte);
        return agendamento;
    }

    private Empresa novaEmpresa(Long id, TipoEmpresa tipo) {
        Empresa empresa = new Empresa();
        empresa.setId(id);
        empresa.setTipo(tipo);
        empresa.setNome(tipo == TipoEmpresa.COLETA ? "Empresa Coleta" : "Empresa Descarte");
        empresa.setEmail(tipo.name().toLowerCase() + id + "@logelec.com");
        empresa.setCnpj(tipo == TipoEmpresa.COLETA ? "70000000000179" : "11444777000161");
        empresa.setSenha("senha-hash");
        empresa.setEndereco("Rua de Teste, 100");
        return empresa;
    }
}