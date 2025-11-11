package com.ads.LogElec.controller;

import com.ads.LogElec.entity.Postagem;
import com.ads.LogElec.service.PostagemService;
import java.time.LocalTime;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/postagens")
public class PostagemController {

    @Autowired
    private PostagemService postagemService;

    @GetMapping
    public List<Postagem> getAllPostagens() {
        List<Postagem> lista = postagemService.findAll();
        // debug: log scheduling fields for each postagem
        lista.forEach(p -> System.out.println("[DEBUG] getAllPostagens - id=" + p.getId()
                + ", diasDisponibilidade=" + p.getDiasDisponibilidade()
                + ", horaInicio=" + p.getHoraInicio()
                + ", horaFim=" + p.getHoraFim()));
        return lista;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Postagem> getPostagemById(@PathVariable Long id) {
        Optional<Postagem> postagem = postagemService.findById(id);
        postagem.ifPresent(p -> System.out.println("[DEBUG] getPostagemById - id=" + p.getId()
                + ", diasDisponibilidade=" + p.getDiasDisponibilidade()
                + ", horaInicio=" + p.getHoraInicio()
                + ", horaFim=" + p.getHoraFim()));
        return postagem.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/empresa/{empresaId}")
    public List<Postagem> getPostagensByEmpresa(@PathVariable Long empresaId) {
        return postagemService.findByEmpresaId(empresaId);
    }

    @GetMapping("/status/{status}")
    public List<Postagem> getPostagensByStatus(@PathVariable String status) {
        return postagemService.findByStatus(status);
    }

    @PostMapping
    public ResponseEntity<?> createPostagem(@RequestBody Map<String, Object> body) {
        try {
            System.out.println("[DEBUG] createPostagem - raw body: " + body);
            Postagem postagem = new Postagem();
            if (body.containsKey("titulo")) postagem.setTitulo((String) body.get("titulo"));
            if (body.containsKey("descricao")) postagem.setDescricao((String) body.get("descricao"));
            if (body.containsKey("tipoResiduo")) postagem.setTipoResiduo((String) body.get("tipoResiduo"));
            if (body.containsKey("peso")) postagem.setPeso(new java.math.BigDecimal(body.get("peso").toString()));
            if (body.containsKey("enderecoRetirada")) postagem.setEnderecoRetirada((String) body.get("enderecoRetirada"));
            if (body.containsKey("empresa") && body.get("empresa") instanceof Map) {
                Map<String, Object> empresaMap = (Map<String, Object>) body.get("empresa");
                com.ads.LogElec.entity.Empresa empresa = new com.ads.LogElec.entity.Empresa();
                if (empresaMap.containsKey("id")) {
                    Long empresaId = Long.valueOf(empresaMap.get("id").toString());
                    empresa.setId(empresaId);
                    postagem.setEmpresa(empresa);
                }
            }
            if (body.containsKey("fotoResiduos") && body.get("fotoResiduos") != null) {
                postagem.setFotoResiduos(body.get("fotoResiduos").toString());
                System.out.println("[DEBUG] fotoResiduos set, length: " + postagem.getFotoResiduos().length());
            }
            if (body.containsKey("diasDisponibilidade") && body.get("diasDisponibilidade") != null) {
                postagem.setDiasDisponibilidade(body.get("diasDisponibilidade").toString());
                System.out.println("[DEBUG] diasDisponibilidade set to: " + postagem.getDiasDisponibilidade());
            }
            if (body.containsKey("horaInicio") && body.get("horaInicio") != null) {
                Object horaValue = body.get("horaInicio");
                if (horaValue instanceof String) {
                    try {
                        LocalTime tempo = LocalTime.parse(horaValue.toString());
                        postagem.setHoraInicio(tempo);
                        System.out.println("[DEBUG] horaInicio parsed and set to: " + postagem.getHoraInicio());
                    } catch (Exception e) {
                        System.out.println("[ERROR] Failed to parse horaInicio: " + e.getMessage());
                    }
                }
            }
            if (body.containsKey("horaFim") && body.get("horaFim") != null) {
                Object horaValue = body.get("horaFim");
                if (horaValue instanceof String) {
                    try {
                        LocalTime tempo = LocalTime.parse(horaValue.toString());
                        postagem.setHoraFim(tempo);
                        System.out.println("[DEBUG] horaFim parsed and set to: " + postagem.getHoraFim());
                    } catch (Exception e) {
                        System.out.println("[ERROR] Failed to parse horaFim: " + e.getMessage());
                    }
                }
            }
            Postagem saved = postagemService.save(postagem);
            System.out.println("[DEBUG] createPostagem - after save id=" + saved.getId()
                    + ", diasDisponibilidade=" + saved.getDiasDisponibilidade()
                    + ", horaInicio=" + saved.getHoraInicio()
                    + ", horaFim=" + saved.getHoraFim());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("[ERROR] Erro ao criar postagem: " + e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao criar postagem: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Postagem> updatePostagem(@PathVariable Long id, @RequestBody Postagem postagemDetails) {
        try {
            Postagem updatedPostagem = postagemService.update(id, postagemDetails);
            return ResponseEntity.ok(updatedPostagem);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePostagem(@PathVariable Long id) {
        try {
            postagemService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}