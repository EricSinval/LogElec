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

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
class AdminControllerIntegrationTest {

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
    void resumoRetornaIndicadoresDaPlataformaParaAdministrador() throws Exception {
        Empresa admin = salvarAdministrador("admin.teste@logelec.com", 19);
        Empresa empresaAtiva = salvarEmpresa("empresa.ativa@logelec.com", StatusConta.ATIVA, TipoEmpresa.DESCARTE, 20);
        Empresa empresaBloqueada = salvarEmpresa("empresa.bloqueada@logelec.com", StatusConta.BLOQUEADA, TipoEmpresa.COLETA, 21);

        Postagem pendente = salvarPostagem(empresaAtiva, StatusModeracaoPostagem.PENDENTE, "Lote de placas", 30);
        salvarPostagem(empresaBloqueada, StatusModeracaoPostagem.BLOQUEADA, "Coleta de monitores", 31);

        Agendamento agendamento = new Agendamento();
        agendamento.setPostagem(pendente);
        agendamento.setEmpresaSolicitante(empresaAtiva);
        agendamento.setEmpresaColetora(empresaBloqueada);
        agendamento.setDataHora(LocalDateTime.now().plusDays(2));
        agendamento.setStatus(StatusAgendamento.CONFIRMADA);
        agendamento.setObservacoes("Coleta confirmada para teste");
        agendamentoRepository.save(agendamento);

        MockHttpSession session = autenticar(admin.getEmail(), "Senha123");

        mockMvc.perform(get("/api/admin/resumo").session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalEmpresas").value(2))
            .andExpect(jsonPath("$.contasBloqueadas").value(1))
            .andExpect(jsonPath("$.totalPostagens").value(2))
            .andExpect(jsonPath("$.publicacoesPendentes").value(1))
            .andExpect(jsonPath("$.publicacoesBloqueadas").value(1))
            .andExpect(jsonPath("$.totalAgendamentos").value(1));
    }

    @Test
    void resumoRetorna403QuandoUsuarioNaoEhAdministrador() throws Exception {
        Empresa empresa = salvarEmpresa("empresa.comum@logelec.com", StatusConta.ATIVA, TipoEmpresa.DESCARTE, 22);
        MockHttpSession session = autenticar(empresa.getEmail(), "Senha123");

        mockMvc.perform(get("/api/admin/resumo").session(session))
            .andExpect(status().isForbidden())
            .andExpect(content().string("Acesso restrito ao administrador."));
    }

    @Test
    void moderarPostagemAtualizaStatusMotivoEAdministrador() throws Exception {
        Empresa admin = salvarAdministrador("admin.moderacao@logelec.com", 18);
        Empresa empresa = salvarEmpresa("empresa.postagem@logelec.com", StatusConta.ATIVA, TipoEmpresa.DESCARTE, 23);
        Postagem postagem = salvarPostagem(empresa, StatusModeracaoPostagem.PENDENTE, "Lote de baterias", 32);
        MockHttpSession session = autenticar(admin.getEmail(), "Senha123");

        mockMvc.perform(put("/api/admin/postagens/{id}/moderar", postagem.getId())
            .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                    "\"statusModeracao\":\"REJEITADA\"," +
                    "\"motivoModeracao\":\"Dados insuficientes para publicação\"" +
                    "}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.statusModeracao").value("REJEITADA"))
            .andExpect(jsonPath("$.motivoModeracao").value("Dados insuficientes para publicação"))
            .andExpect(jsonPath("$.moderadoPor").value(admin.getNome()));

        Postagem atualizada = postagemRepository.findById(postagem.getId()).orElseThrow();
        assertThat(atualizada.getStatusModeracao()).isEqualTo(StatusModeracaoPostagem.REJEITADA);
        assertThat(atualizada.getModeradoPor()).isEqualTo(admin.getNome());
        assertThat(atualizada.getModeradoEm()).isNotNull();
    }

    @Test
    void minhasPostagensRetornamHistoricoDeModeracaoParaEmpresaDona() throws Exception {
        Empresa admin = salvarAdministrador("admin.historico@logelec.com", 24);
        Empresa empresa = salvarEmpresa("empresa.historico@logelec.com", StatusConta.ATIVA, TipoEmpresa.DESCARTE, 25);
        Postagem postagem = salvarPostagem(empresa, StatusModeracaoPostagem.PENDENTE, "Lote com histórico", 33);

        MockHttpSession adminSession = autenticar(admin.getEmail(), "Senha123");
        MockHttpSession empresaSession = autenticar(empresa.getEmail(), "Senha123");

        mockMvc.perform(put("/api/admin/postagens/{id}/moderar", postagem.getId())
                .session(adminSession)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                    "\"statusModeracao\":\"REJEITADA\"," +
                    "\"motivoModeracao\":\"Primeira revisão\"" +
                    "}"))
            .andExpect(status().isOk());

        mockMvc.perform(put("/api/admin/postagens/{id}/moderar", postagem.getId())
                .session(adminSession)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                    "\"statusModeracao\":\"BLOQUEADA\"," +
                    "\"motivoModeracao\":\"Segunda revisão\"" +
                    "}"))
            .andExpect(status().isOk());

        mockMvc.perform(get("/api/postagens/empresa/me").session(empresaSession))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(postagem.getId()))
            .andExpect(jsonPath("$[0].historicoModeracao.length()").value(2))
            .andExpect(jsonPath("$[0].historicoModeracao[0].statusModeracao").value("BLOQUEADA"))
            .andExpect(jsonPath("$[0].historicoModeracao[0].motivoModeracao").value("Segunda revisão"))
            .andExpect(jsonPath("$[0].historicoModeracao[1].statusModeracao").value("REJEITADA"))
            .andExpect(jsonPath("$[0].historicoModeracao[1].motivoModeracao").value("Primeira revisão"));
    }

    @Test
    void resumoRetorna401SemSessao() throws Exception {
        mockMvc.perform(get("/api/admin/resumo"))
            .andExpect(status().isUnauthorized())
            .andExpect(content().string("Não autenticado."));
    }

    private Empresa salvarAdministrador(String email, int sequencia) {
        Empresa admin = new Empresa();
        admin.setNome("Administrador Teste " + sequencia);
        admin.setCnpj(gerarCnpjValido(sequencia));
        admin.setEmail(email);
        admin.setSenha(passwordEncoder.encode("Senha123"));
        admin.setTipo(TipoEmpresa.COLETA);
        admin.setPerfilAcesso(PerfilAcesso.ADMIN);
        admin.setStatusConta(StatusConta.ATIVA);
        admin.setEndereco("Rua do Admin, " + sequencia);
        admin.setTelefone("(11) 96666-00" + String.format("%02d", sequencia));
        return empresaRepository.save(admin);
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

    private Empresa salvarEmpresa(String email, StatusConta statusConta, TipoEmpresa tipoEmpresa, int sequencia) {
        Empresa empresa = new Empresa();
        empresa.setNome("Empresa Teste " + sequencia);
        empresa.setCnpj(gerarCnpjValido(sequencia));
        empresa.setEmail(email);
        empresa.setSenha(passwordEncoder.encode("Senha123"));
        empresa.setTipo(tipoEmpresa);
        empresa.setPerfilAcesso(PerfilAcesso.EMPRESA);
        empresa.setStatusConta(statusConta);
        empresa.setEndereco("Rua de Teste, " + sequencia);
        empresa.setTelefone("(11) 97777-00" + String.format("%02d", sequencia));
        return empresaRepository.save(empresa);
    }

    private Postagem salvarPostagem(Empresa empresa, StatusModeracaoPostagem statusModeracao, String titulo, int sequencia) {
        Postagem postagem = new Postagem();
        postagem.setEmpresa(empresa);
        postagem.setTitulo(titulo);
        postagem.setDescricao("Descrição de teste " + sequencia);
        postagem.setTipoResiduo("Resíduo eletrônico " + sequencia);
        postagem.setPeso(BigDecimal.valueOf(50 + sequencia));
        postagem.setEnderecoRetirada("Rua de Coleta, " + sequencia);
        postagem.setStatusModeracao(statusModeracao);
        postagem.setCreatedAt(LocalDateTime.now());
        return postagemRepository.save(postagem);
    }

    private String gerarCnpjValido(int sequencia) {
        String base = String.format("700001%06d", sequencia);
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