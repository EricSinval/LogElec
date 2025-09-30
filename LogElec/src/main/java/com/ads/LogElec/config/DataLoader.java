package com.ads.LogElec.config;

import com.ads.LogElec.entity.Empresa;
import com.ads.LogElec.entity.TipoEmpresa;
import com.ads.LogElec.repository.EmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.ads.LogElec.entity.Agendamento;
import com.ads.LogElec.entity.StatusAgendamento;
import com.ads.LogElec.repository.AgendamentoRepository;
import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private EmpresaRepository empresaRepository;
    
    @Autowired
    private AgendamentoRepository agendamentoRepository;

    @Override
    public void run(String... args) throws Exception {
        
        // VERIFICAR SE JÁ EXISTEM DADOS
        if (empresaRepository.count() == 0) {
            System.out.println("🐢 Criando dados de teste...");
            
            // Empresa Coletora 1
            Empresa coletora1 = new Empresa();
            coletora1.setCnpj("12.345.678/0001-90");
            coletora1.setNome("EcoRecicla Soluções Ambientais");
            coletora1.setEmail("contato@ecorecicla.com");
            coletora1.setSenha("senha123");
            coletora1.setTipo(TipoEmpresa.COLETA);
            coletora1.setEndereco("Av. Sustentável, 100 - São Paulo, SP");
            coletora1.setTelefone("(11) 9999-8888");
            coletora1.setCapacidadeColeta(1000);
            
            // Empresa Coletora 2  
            Empresa coletora2 = new Empresa();
            coletora2.setCnpj("98.765.432/0001-10");
            coletora2.setNome("Green Tech Coleta");
            coletora2.setEmail("contato@greentech.com");
            coletora2.setSenha("senha123");
            coletora2.setTipo(TipoEmpresa.COLETA);
            coletora2.setEndereco("Rua Verde, 200 - São Caetano do Sul, SP");
            coletora2.setTelefone("(11) 7777-6666");
            coletora2.setCapacidadeColeta(500);
            
            // Empresa que Descartará
            Empresa descartadora1 = new Empresa();
            descartadora1.setCnpj("11.222.333/0001-44");
            descartadora1.setNome("Tech Solutions LTDA");
            descartadora1.setEmail("contato@techsolutions.com");
            descartadora1.setSenha("senha123");
            descartadora1.setTipo(TipoEmpresa.DESCARTE);
            descartadora1.setEndereco("Av. Paulista, 1000 - São Paulo, SP");
            descartadora1.setTelefone("(11) 5555-4444");
            
            // SALVAR NO BANCO
            empresaRepository.save(coletora1);
            empresaRepository.save(coletora2);
            empresaRepository.save(descartadora1);
            
            System.out.println("✅ Dados de teste criados com sucesso!");
            System.out.println("📊 Empresas cadastradas: " + empresaRepository.count());
        } else {
            System.out.println("ℹ️  Dados já existem no banco: " + empresaRepository.count() + " empresas");
        }
    
        // VERIFICAR SE JÁ EXISTEM AGENDAMENTOS
        if (agendamentoRepository.count() == 0 && empresaRepository.count() > 0) {
            System.out.println("🗓️ Criando agendamentos de teste...");
            
            // Buscar empresas criadas
            Empresa techSolutions = empresaRepository.findByCnpj("11.222.333/0001-44")
                .orElseThrow(() -> new RuntimeException("Empresa Tech Solutions não encontrada"));
            Empresa ecoRecicla = empresaRepository.findByCnpj("12.345.678/0001-90")
                .orElseThrow(() -> new RuntimeException("Empresa EcoRecicla não encontrada"));
            Empresa greenTech = empresaRepository.findByCnpj("98.765.432/0001-10")
                .orElseThrow(() -> new RuntimeException("Empresa Green Tech não encontrada"));
            
            // Agendamento 1: Tech Solutions com EcoRecicla
            Agendamento agendamento1 = new Agendamento();
            agendamento1.setDataAgendamento(LocalDate.of(2025, 10, 15)); // 15/10/2025
            agendamento1.setHoraAgendamento(LocalTime.of(9, 0));         // 09:00
            agendamento1.setEmpresaSolicitante(techSolutions); // Empresa que descarta
            agendamento1.setEmpresaColetora(ecoRecicla);       // Empresa que coleta
            agendamento1.setTiposResiduos("Computadores, Monitores"); // Tipos de resíduos
            agendamento1.setPesoEstimado(150.5);               // Peso estimado
            agendamento1.setEnderecoColeta("Av. Paulista, 1000 - São Paulo, SP"); // Endereço
            agendamento1.setStatus(StatusAgendamento.PENDENTE);
            
            // Agendamento 2: Tech Solutions com Green Tech
            Agendamento agendamento2 = new Agendamento();
            agendamento2.setDataAgendamento(LocalDate.of(2025, 10, 20));
            agendamento2.setHoraAgendamento(LocalTime.of(14, 30));       // 14:30
            agendamento2.setEmpresaSolicitante(techSolutions);
            agendamento2.setEmpresaColetora(greenTech);
            agendamento2.setTiposResiduos("Celulares, Tablets");
            agendamento2.setPesoEstimado(75.0);
            agendamento2.setEnderecoColeta("Av. Paulista, 1000 - São Paulo, SP");
            agendamento2.setStatus(StatusAgendamento.CONFIRMADO); // Já confirmado
            
            // Salvar agendamentos
            agendamentoRepository.save(agendamento1);
            agendamentoRepository.save(agendamento2);
            
            System.out.println("✅ Agendamentos de teste criados: " + agendamentoRepository.count());
        } else {
            System.out.println("ℹ️  Agendamentos já existem no banco: " + agendamentoRepository.count() + " agendamentos");
        }
    }
}