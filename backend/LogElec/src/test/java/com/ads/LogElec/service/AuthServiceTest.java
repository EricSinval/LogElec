package com.ads.LogElec.service;

import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.PerfilAcesso;
import com.ads.LogElec.entity.StatusConta;
import com.ads.LogElec.entity.TipoEmpresa;
import com.ads.LogElec.repository.EmpresaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private EmpresaRepository empresaRepository;

    @InjectMocks
    private AuthService authService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    void loginRetornaEmpresaQuandoCredenciaisSaoValidas() {
        Empresa empresa = novaEmpresa("ativa@logelec.com", StatusConta.ATIVA);
        empresa.setSenha(passwordEncoder.encode("Senha123"));

        when(empresaRepository.findByEmail("ativa@logelec.com")).thenReturn(Optional.of(empresa));

        Empresa autenticada = authService.login("ativa@logelec.com", "Senha123");

        assertThat(autenticada).isSameAs(empresa);
    }

    @Test
    void loginLancaErroQuandoContaEstaBloqueada() {
        Empresa empresa = novaEmpresa("bloqueada@logelec.com", StatusConta.BLOQUEADA);
        empresa.setSenha(passwordEncoder.encode("Senha123"));

        when(empresaRepository.findByEmail("bloqueada@logelec.com")).thenReturn(Optional.of(empresa));

        assertThatThrownBy(() -> authService.login("bloqueada@logelec.com", "Senha123"))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Conta bloqueada pela administração da plataforma");
    }

    @Test
    void loginLancaErroQuandoSenhaEstaIncorreta() {
        Empresa empresa = novaEmpresa("senha@logelec.com", StatusConta.ATIVA);
        empresa.setSenha(passwordEncoder.encode("Senha123"));

        when(empresaRepository.findByEmail("senha@logelec.com")).thenReturn(Optional.of(empresa));

        assertThatThrownBy(() -> authService.login("senha@logelec.com", "OutraSenha"))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Senha incorreta");
    }

    private Empresa novaEmpresa(String email, StatusConta statusConta) {
        Empresa empresa = new Empresa();
        empresa.setNome("Empresa de Teste");
        empresa.setCnpj("70000000000179");
        empresa.setEmail(email);
        empresa.setTipo(TipoEmpresa.DESCARTE);
        empresa.setPerfilAcesso(PerfilAcesso.EMPRESA);
        empresa.setStatusConta(statusConta);
        empresa.setEndereco("Rua de Teste, 100");
        empresa.setTelefone("(11) 98888-0000");
        return empresa;
    }
}