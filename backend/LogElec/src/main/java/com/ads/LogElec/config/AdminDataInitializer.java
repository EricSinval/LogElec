package com.ads.LogElec.config;

import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.PerfilAcesso;
import com.ads.LogElec.entity.Postagem;
import com.ads.LogElec.entity.StatusConta;
import com.ads.LogElec.entity.StatusModeracaoPostagem;
import com.ads.LogElec.entity.TipoEmpresa;
import com.ads.LogElec.repository.EmpresaRepository;
import com.ads.LogElec.repository.PostagemRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class AdminDataInitializer implements CommandLineRunner {

    private final EmpresaRepository empresaRepository;
    private final PostagemRepository postagemRepository;
    private final boolean bootstrapEnabled;
    private final String adminEmail;
    private final String adminPassword;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminDataInitializer(
        EmpresaRepository empresaRepository,
        PostagemRepository postagemRepository,
        @Value("${app.admin.bootstrap-enabled:true}") boolean bootstrapEnabled,
        @Value("${app.admin.email:admin@logelec.com}") String adminEmail,
        @Value("${app.admin.password:Admin123}") String adminPassword
    ) {
        this.empresaRepository = empresaRepository;
        this.postagemRepository = postagemRepository;
        this.bootstrapEnabled = bootstrapEnabled;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        normalizarEmpresasExistentes();
        normalizarPostagensExistentes();

        if (bootstrapEnabled) {
            garantirContaAdministrador();
        }
    }

    private void normalizarEmpresasExistentes() {
        List<Empresa> empresas = empresaRepository.findAll();
        List<Empresa> atualizadas = new ArrayList<>();

        for (Empresa empresa : empresas) {
            boolean alterou = false;

            if (empresa.getPerfilAcesso() == null) {
                empresa.setPerfilAcesso(PerfilAcesso.EMPRESA);
                alterou = true;
            }

            if (empresa.getStatusConta() == null) {
                empresa.setStatusConta(StatusConta.ATIVA);
                alterou = true;
            }

            if (alterou) {
                atualizadas.add(empresa);
            }
        }

        if (!atualizadas.isEmpty()) {
            empresaRepository.saveAll(atualizadas);
        }
    }

    private void normalizarPostagensExistentes() {
        List<Postagem> postagens = postagemRepository.findAll();
        List<Postagem> atualizadas = new ArrayList<>();

        for (Postagem postagem : postagens) {
            if (postagem.getStatusModeracao() == null) {
                postagem.setStatusModeracao(StatusModeracaoPostagem.APROVADA);
                atualizadas.add(postagem);
            }
        }

        if (!atualizadas.isEmpty()) {
            postagemRepository.saveAll(atualizadas);
        }
    }

    private void garantirContaAdministrador() {
        Empresa adminExistente = empresaRepository.findByEmail(adminEmail).orElse(null);
        String cnpjAdmin = resolverCnpjAdministrador(adminExistente);

        if (adminExistente != null) {
            boolean alterou = false;

            if (!cnpjAdmin.equals(adminExistente.getCnpj())) {
                adminExistente.setCnpj(cnpjAdmin);
                alterou = true;
            }
            if (!"Administrador LogElec".equals(adminExistente.getNome())) {
                adminExistente.setNome("Administrador LogElec");
                alterou = true;
            }
            if (adminExistente.getTipo() == null) {
                adminExistente.setTipo(TipoEmpresa.COLETA);
                alterou = true;
            }
            if (adminExistente.getPerfilAcesso() != PerfilAcesso.ADMIN) {
                adminExistente.setPerfilAcesso(PerfilAcesso.ADMIN);
                alterou = true;
            }
            if (adminExistente.getStatusConta() != StatusConta.ATIVA) {
                adminExistente.setStatusConta(StatusConta.ATIVA);
                alterou = true;
            }
            if (adminExistente.getEndereco() == null || adminExistente.getEndereco().isBlank()) {
                adminExistente.setEndereco("Painel administrativo LogElec");
                alterou = true;
            }
            if (adminExistente.getTelefone() == null || adminExistente.getTelefone().isBlank()) {
                adminExistente.setTelefone("(11) 90000-0000");
                alterou = true;
            }

            if (alterou) {
                empresaRepository.save(adminExistente);
            }
            return;
        }

        Empresa admin = new Empresa();
        admin.setNome("Administrador LogElec");
        admin.setCnpj(cnpjAdmin);
        admin.setEmail(adminEmail);
        admin.setSenha(passwordEncoder.encode(adminPassword));
        admin.setTipo(TipoEmpresa.COLETA);
        admin.setPerfilAcesso(PerfilAcesso.ADMIN);
        admin.setStatusConta(StatusConta.ATIVA);
        admin.setEndereco("Painel administrativo LogElec");
        admin.setTelefone("(11) 90000-0000");

        empresaRepository.save(admin);
    }

    private String resolverCnpjAdministrador(Empresa adminExistente) {
        if (adminExistente != null && adminExistente.isCnpjValido()) {
            Empresa empresaComMesmoCnpj = empresaRepository.findByCnpj(adminExistente.getCnpj()).orElse(null);
            if (empresaComMesmoCnpj == null || empresaComMesmoCnpj.getId().equals(adminExistente.getId())) {
                return adminExistente.getCnpj();
            }
        }

        long baseInicial = 900000000001L;
        for (int incremento = 0; incremento < 5000; incremento++) {
            String base = String.format("%012d", baseInicial + incremento);
            String candidato = gerarCnpjValido(base);
            Empresa empresaComMesmoCnpj = empresaRepository.findByCnpj(candidato).orElse(null);

            if (empresaComMesmoCnpj == null || (adminExistente != null && empresaComMesmoCnpj.getId().equals(adminExistente.getId()))) {
                return candidato;
            }
        }

        throw new IllegalStateException("Nao foi possivel gerar um CNPJ valido para a conta administrativa.");
    }

    private String gerarCnpjValido(String base12) {
        int digito1 = calcularDigito(base12, new int[]{5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2});
        int digito2 = calcularDigito(base12 + digito1, new int[]{6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2});
        return base12 + digito1 + digito2;
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