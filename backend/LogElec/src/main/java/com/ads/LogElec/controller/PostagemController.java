package com.ads.LogElec.controller;

import com.ads.LogElec.entity.Postagem;
import com.ads.LogElec.service.PostagemService;
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
        return postagemService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Postagem> getPostagemById(@PathVariable Long id) {
        Optional<Postagem> postagem = postagemService.findById(id);
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
    public Postagem createPostagem(@RequestBody Postagem postagem) {
        return postagemService.save(postagem);
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