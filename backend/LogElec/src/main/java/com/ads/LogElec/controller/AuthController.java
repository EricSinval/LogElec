package com.ads.LogElec.controller;

import com.ads.LogElec.dto.LoginDTO;
import com.ads.LogElec.dto.RecuperarSenhaDTO;
import com.ads.LogElec.dto.SessaoUsuarioDTO;
import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.repository.EmpresaRepository;
import com.ads.LogElec.security.EmpresaSessionPrincipal;
import com.ads.LogElec.service.AuthService;
import com.ads.LogElec.service.EmpresaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:8081", "http://127.0.0.1:8080", "http://127.0.0.1:8081", "http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private EmpresaService empresaService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO, HttpServletRequest request) {
        try {
            Empresa empresa = authService.login(loginDTO.getEmail(), loginDTO.getSenha());
            EmpresaSessionPrincipal principal = EmpresaSessionPrincipal.fromEmpresa(empresa);
            Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                principal,
                null,
                principal.getAuthorities()
            );

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            HttpSession session = request.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

            return ResponseEntity.ok(SessaoUsuarioDTO.fromPrincipal(principal));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno do servidor");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@org.springframework.security.core.annotation.AuthenticationPrincipal EmpresaSessionPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Não autenticado.");
        }

        return empresaRepository.findById(principal.getId())
            .<ResponseEntity<?>>map(empresa -> ResponseEntity.ok(SessaoUsuarioDTO.fromEmpresa(empresa)))
            .orElseGet(() -> ResponseEntity.status(401).body("Sessão inválida."));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        new SecurityContextLogoutHandler().logout(request, response, SecurityContextHolder.getContext().getAuthentication());
        return ResponseEntity.ok("Sessão encerrada com sucesso.");
    }

    @PostMapping("/recuperar-senha")
    public ResponseEntity<?> recuperarSenha(@RequestBody RecuperarSenhaDTO dto) {
        try {
            Optional<Empresa> empresaOpt = empresaRepository.findByEmail(dto.getEmail());
            if (!empresaOpt.isPresent()) {
                return ResponseEntity.status(404).body("Nenhuma empresa encontrada com este email.");
            }
            Empresa empresa = empresaOpt.get();
            if (!empresa.getCnpj().equals(dto.getCnpj())) {
                return ResponseEntity.status(400).body("CNPJ não corresponde ao email informado.");
            }
            empresaService.atualizarSenha(empresa, dto.getNovaSenha());
            empresaRepository.save(empresa);
            return ResponseEntity.ok("Senha atualizada com sucesso.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno do servidor");
        }
    }
}