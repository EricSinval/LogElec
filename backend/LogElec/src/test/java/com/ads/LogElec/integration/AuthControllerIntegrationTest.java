package com.ads.LogElec.integration;

import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.PerfilAcesso;
import com.ads.LogElec.entity.StatusConta;
import com.ads.LogElec.entity.TipoEmpresa;
import com.ads.LogElec.repository.EmpresaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.FilterChainProxy;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private FilterChainProxy springSecurityFilterChain;

    @Autowired
    private EmpresaRepository empresaRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
            .addFilters(springSecurityFilterChain)
            .build();
    }

    @Test
    void loginRetornaEmpresaSemExporSenha() throws Exception {
        Empresa empresa = salvarEmpresa("empresa.login@logelec.com", StatusConta.ATIVA, PerfilAcesso.EMPRESA, 10);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                    "\"email\":\"" + empresa.getEmail() + "\"," +
                    "\"senha\":\"Senha123\"" +
                    "}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("empresa.login@logelec.com"))
            .andExpect(jsonPath("$.perfilAcesso").value("EMPRESA"))
            .andExpect(jsonPath("$.senha").doesNotExist());
    }

    @Test
    void loginRetorna401QuandoContaEstaBloqueada() throws Exception {
        Empresa empresa = salvarEmpresa("empresa.bloqueada@logelec.com", StatusConta.BLOQUEADA, PerfilAcesso.EMPRESA, 11);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                    "\"email\":\"" + empresa.getEmail() + "\"," +
                    "\"senha\":\"Senha123\"" +
                    "}"))
            .andExpect(status().isUnauthorized())
            .andExpect(content().string("Conta bloqueada pela administração da plataforma"));
    }

    @Test
    void meRetornaUsuarioDaSessaoAutenticada() throws Exception {
        Empresa empresa = salvarEmpresa("empresa.me@logelec.com", StatusConta.ATIVA, PerfilAcesso.EMPRESA, 12);

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                    "\"email\":\"" + empresa.getEmail() + "\"," +
                    "\"senha\":\"Senha123\"" +
                    "}"))
            .andExpect(status().isOk())
            .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);
        assertThat(session).isNotNull();

        mockMvc.perform(get("/api/auth/me").session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(empresa.getId()))
            .andExpect(jsonPath("$.email").value(empresa.getEmail()))
            .andExpect(jsonPath("$.senha").doesNotExist());
    }

    @Test
    void meRetorna401SemSessao() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isUnauthorized())
            .andExpect(content().string("Não autenticado."));
    }

    private Empresa salvarEmpresa(String email, StatusConta statusConta, PerfilAcesso perfilAcesso, int sequencia) {
        Empresa empresa = new Empresa();
        empresa.setNome("Empresa Teste " + sequencia);
        empresa.setCnpj(gerarCnpjValido(sequencia));
        empresa.setEmail(email);
        empresa.setSenha(passwordEncoder.encode("Senha123"));
        empresa.setTipo(TipoEmpresa.DESCARTE);
        empresa.setPerfilAcesso(perfilAcesso);
        empresa.setStatusConta(statusConta);
        empresa.setEndereco("Rua de Teste, " + sequencia);
        empresa.setTelefone("(11) 98888-00" + String.format("%02d", sequencia));
        return empresaRepository.save(empresa);
    }

    private String gerarCnpjValido(int sequencia) {
        String base = String.format("700000%06d", sequencia);
        return base + calcularDigito(base, new int[]{5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2})
            + calcularDigito(base + calcularDigito(base, new int[]{5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}), new int[]{6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2});
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