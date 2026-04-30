package com.ads.LogElec.integration;

import com.ads.LogElec.entity.Agendamento;
import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.PerfilAcesso;
import com.ads.LogElec.entity.Postagem;
import com.ads.LogElec.entity.StatusAgendamento;
import com.ads.LogElec.entity.StatusConta;
import com.ads.LogElec.entity.StatusModeracaoPostagem;
import com.ads.LogElec.entity.TipoEmpresa;
import com.ads.LogElec.repository.AgendamentoRepository;
import com.ads.LogElec.repository.EmpresaRepository;
import com.ads.LogElec.repository.PostagemRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.FilterChainProxy;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class SessionOwnershipIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private FilterChainProxy springSecurityFilterChain;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private PostagemRepository postagemRepository;

    @Autowired
    private AgendamentoRepository agendamentoRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
            .addFilters(springSecurityFilterChain)
            .build();
    }

    @Test
    void empresaMeAtualizaContaAutenticadaSemUsarPathId() throws Exception {
        Empresa empresa = salvarEmpresa("empresa.perfil@logelec.com", TipoEmpresa.DESCARTE, 40);
        MockHttpSession session = autenticar(empresa.getEmail(), "Senha123");

        mockMvc.perform(put("/api/empresas/me")
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                    "\"email\":\"empresa.perfil.atualizada@logelec.com\"," +
                    "\"telefone\":\"11999990000\"," +
                    "\"endereco\":\"Rua Atualizada, 40\"" +
                    "}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(empresa.getId()))
            .andExpect(jsonPath("$.email").value("empresa.perfil.atualizada@logelec.com"));

        Empresa atualizada = empresaRepository.findById(empresa.getId()).orElseThrow();
        assertThat(atualizada.getTelefone()).isEqualTo("11999990000");
        assertThat(atualizada.getEndereco()).isEqualTo("Rua Atualizada, 40");
    }

    @Test
    void postagensDaEmpresaRetornam403QuandoPathNaoCorrespondeASessao() throws Exception {
        Empresa autenticada = salvarEmpresa("empresa.autenticada@logelec.com", TipoEmpresa.DESCARTE, 41);
        Empresa outraEmpresa = salvarEmpresa("empresa.outra@logelec.com", TipoEmpresa.COLETA, 42);
        MockHttpSession session = autenticar(autenticada.getEmail(), "Senha123");

        mockMvc.perform(get("/api/postagens/empresa/{empresaId}", outraEmpresa.getId()).session(session))
            .andExpect(status().isForbidden())
            .andExpect(content().string("Acesso restrito às suas próprias postagens."));
    }

    @Test
    void criacaoDePostagemIgnoraEmpresaEnviadaNoBodyEUsaSessao() throws Exception {
        Empresa autenticada = salvarEmpresa("empresa.postagem@logelec.com", TipoEmpresa.DESCARTE, 43);
        Empresa outraEmpresa = salvarEmpresa("empresa.invasora@logelec.com", TipoEmpresa.COLETA, 44);
        MockHttpSession session = autenticar(autenticada.getEmail(), "Senha123");

        mockMvc.perform(post("/api/postagens")
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                    "\"titulo\":\"Lote de testes\"," +
                    "\"descricao\":\"Descricao da postagem\"," +
                    "\"tipoResiduo\":\"Cabos\"," +
                    "\"peso\":\"15\"," +
                    "\"enderecoRetirada\":\"Rua A, 123\"," +
                    "\"empresa\":{\"id\":" + outraEmpresa.getId() + "}" +
                    "}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.empresa.id").value(autenticada.getId()));
    }

    @Test
    void criacaoDeAgendamentoDerivaEmpresasDaSessaoEDaPostagem() throws Exception {
        Empresa solicitante = salvarEmpresa("empresa.solicitante@logelec.com", TipoEmpresa.DESCARTE, 45);
        Empresa coletora = salvarEmpresa("empresa.coletora@logelec.com", TipoEmpresa.COLETA, 46);
        Postagem postagem = salvarPostagem(coletora, 47);
        MockHttpSession session = autenticar(solicitante.getEmail(), "Senha123");

        mockMvc.perform(post("/api/agendamentos")
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                    "\"empresaSolicitanteId\":999," +
                    "\"empresaColetoraId\":888," +
                    "\"postagemId\":" + postagem.getId() + "," +
                    "\"dataAgendamento\":\"2099-12-30\"," +
                    "\"horaAgendamento\":\"10:30\"," +
                    "\"observacoes\":\"Teste de sessão\"" +
                    "}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.empresaSolicitante.id").value(solicitante.getId()))
            .andExpect(jsonPath("$.empresaColetora.id").value(coletora.getId()))
            .andExpect(jsonPath("$.postagem.id").value(postagem.getId()));
    }

    @Test
    void envioDeMensagemIgnoraRemetenteDoBodyEUsaSessao() throws Exception {
        Empresa remetente = salvarEmpresa("empresa.remetente@logelec.com", TipoEmpresa.DESCARTE, 48);
        Empresa destinatario = salvarEmpresa("empresa.destinatario@logelec.com", TipoEmpresa.COLETA, 49);
        Empresa spoof = salvarEmpresa("empresa.spoof@logelec.com", TipoEmpresa.COLETA, 50);
        Postagem postagem = salvarPostagem(destinatario, 51);
        salvarAgendamentoConfirmado(remetente, destinatario, postagem, 52);
        MockHttpSession session = autenticar(remetente.getEmail(), "Senha123");

        mockMvc.perform(post("/api/mensagens/enviar")
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                    "\"remetenteId\":" + spoof.getId() + "," +
                    "\"destinatarioId\":" + destinatario.getId() + "," +
                    "\"conteudo\":\"Ola\"" +
                    "}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.empresaRemetente.id").value(remetente.getId()))
            .andExpect(jsonPath("$.empresaDestinatario.id").value(destinatario.getId()))
            .andExpect(jsonPath("$.conteudo").value("Ola"));
    }

    @Test
    void conclusaoDeAgendamentoUsaEmpresaDaSessaoSemQueryParam() throws Exception {
        Empresa solicitante = salvarEmpresa("empresa.descarte@logelec.com", TipoEmpresa.DESCARTE, 53);
        Empresa coletora = salvarEmpresa("empresa.coleta@logelec.com", TipoEmpresa.COLETA, 54);
        Postagem postagem = salvarPostagem(coletora, 55);
        Agendamento agendamento = salvarAgendamentoConfirmado(solicitante, coletora, postagem, 56);
        MockHttpSession session = autenticar(coletora.getEmail(), "Senha123");

        mockMvc.perform(put("/api/agendamentos/{id}/concluir", agendamento.getId()).session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("REALIZADA"));

        Agendamento atualizado = agendamentoRepository.findById(agendamento.getId()).orElseThrow();
        assertThat(atualizado.getStatus()).isEqualTo(StatusAgendamento.REALIZADA);
    }

    @Test
    void agendamentosFuturosRetornam403ParaEmpresaComum() throws Exception {
        Empresa empresa = salvarEmpresa("empresa.futuros@logelec.com", TipoEmpresa.DESCARTE, 57);
        MockHttpSession session = autenticar(empresa.getEmail(), "Senha123");

        mockMvc.perform(get("/api/agendamentos/futuros").session(session))
            .andExpect(status().isForbidden())
            .andExpect(content().string("Acesso restrito ao administrador."));
    }

    @Test
    void agendamentosDaPostagemRetornam403QuandoEmpresaNaoEhProprietaria() throws Exception {
        Empresa solicitante = salvarEmpresa("empresa.consulta@logelec.com", TipoEmpresa.DESCARTE, 58);
        Empresa coletora = salvarEmpresa("empresa.postagem.restrita@logelec.com", TipoEmpresa.COLETA, 59);
        Postagem postagem = salvarPostagem(coletora, 60);
        MockHttpSession session = autenticar(solicitante.getEmail(), "Senha123");

        mockMvc.perform(get("/api/agendamentos/postagem/{postagemId}", postagem.getId()).session(session))
            .andExpect(status().isForbidden())
            .andExpect(content().string("Acesso restrito à empresa dona da postagem."));
    }

    private MockHttpSession autenticar(String email, String senha) throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                    "\"email\":\"" + email + "\"," +
                    "\"senha\":\"" + senha + "\"" +
                    "}"))
            .andExpect(status().isOk())
            .andReturn();

        return (MockHttpSession) loginResult.getRequest().getSession(false);
    }

    private Empresa salvarEmpresa(String email, TipoEmpresa tipoEmpresa, int sequencia) {
        Empresa empresa = new Empresa();
        empresa.setNome("Empresa Teste " + sequencia);
        empresa.setCnpj(gerarCnpjValido(sequencia));
        empresa.setEmail(email);
        empresa.setSenha(passwordEncoder.encode("Senha123"));
        empresa.setTipo(tipoEmpresa);
        empresa.setPerfilAcesso(PerfilAcesso.EMPRESA);
        empresa.setStatusConta(StatusConta.ATIVA);
        empresa.setEndereco("Rua de Teste, " + sequencia);
        empresa.setTelefone("119777700" + String.format("%02d", sequencia));
        return empresaRepository.save(empresa);
    }

    private Postagem salvarPostagem(Empresa empresa, int sequencia) {
        Postagem postagem = new Postagem();
        postagem.setEmpresa(empresa);
        postagem.setTitulo("Postagem Teste " + sequencia);
        postagem.setDescricao("Descricao da postagem " + sequencia);
        postagem.setTipoResiduo("Resíduo eletrônico " + sequencia);
        postagem.setPeso(BigDecimal.valueOf(25 + sequencia));
        postagem.setEnderecoRetirada("Rua da Coleta, " + sequencia);
        postagem.setStatusModeracao(StatusModeracaoPostagem.APROVADA);
        return postagemRepository.save(postagem);
    }

    private Agendamento salvarAgendamentoConfirmado(Empresa solicitante, Empresa coletora, Postagem postagem, int sequencia) {
        Agendamento agendamento = new Agendamento();
        agendamento.setPostagem(postagem);
        agendamento.setEmpresaSolicitante(solicitante);
        agendamento.setEmpresaColetora(coletora);
        agendamento.setEmpresaCliente(solicitante);
        agendamento.setEmpresaPrestadora(coletora);
        agendamento.setDataHora(LocalDateTime.now().plusDays(2).plusHours(sequencia));
        agendamento.setStatus(StatusAgendamento.CONFIRMADA);
        agendamento.setObservacoes("Agendamento confirmado para teste " + sequencia);
        return agendamentoRepository.save(agendamento);
    }

    private String gerarCnpjValido(int sequencia) {
        String base = String.format("710000%06d", sequencia);
        int digito1 = calcularDigito(base, new int[]{5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2});
        int digito2 = calcularDigito(base + digito1, new int[]{6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2});
        return base + digito1 + digito2;
    }

    private int calcularDigito(String numero, int[] pesos) {
        int soma = 0;
        for (int i = 0; i < pesos.length; i++) {
            soma += Character.getNumericValue(numero.charAt(i)) * pesos[i];
        }

        int digito = 11 - (soma % 11);
        return digito >= 10 ? 0 : digito;
    }
}