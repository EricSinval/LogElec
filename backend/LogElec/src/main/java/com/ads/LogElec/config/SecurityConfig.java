package com.ads.LogElec.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .logout(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/recuperar-senha").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/empresas").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/postagens/empresa/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/postagens", "/api/postagens/search").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/postagens/*", "/api/postagens/status/*").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/empresas/coletoras").permitAll()
                .requestMatchers("/api/auth/me", "/api/auth/logout").authenticated()
                .requestMatchers("/api/admin/**").authenticated()
                .requestMatchers("/api/agendamentos/**", "/api/mensagens/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/postagens").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/postagens/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/postagens/**").authenticated()
                .requestMatchers("/api/empresas/me").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/empresas/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/empresas/**").authenticated()
                .anyRequest().permitAll()
            )
            .exceptionHandling(exceptionHandling -> exceptionHandling
                .authenticationEntryPoint((request, response, ex) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType(MediaType.TEXT_PLAIN_VALUE);
                    response.getWriter().write("Não autenticado.");
                })
                .accessDeniedHandler((request, response, ex) -> {
                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.setContentType(MediaType.TEXT_PLAIN_VALUE);
                    response.getWriter().write("Acesso negado.");
                })
            );

        return http.build();
    }
}