package com.ads.LogElec.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;

@Component
public class DatabaseIntegrationTest implements CommandLineRunner {

    private final DataSource dataSource;

    public DatabaseIntegrationTest(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🔍 INICIANDO TESTE DE INTEGRAÇÃO DO BANCO...");
        
        try (Connection conn = dataSource.getConnection()) {
            System.out.println("✅ CONEXÃO COM BANCO ESTABELECIDA!");
            System.out.println("📊 Banco: " + conn.getMetaData().getDatabaseProductName());
            System.out.println("🔗 URL: " + conn.getMetaData().getURL());
            
            
            String[] tables = {"empresas", "postagens", "agendamentos", "mensagens"};
            for (String table : tables) {
                try {
                    ResultSet rs = conn.getMetaData().getTables(null, null, table, null);
                    if (rs.next()) {
                        System.out.println("✅ Tabela '" + table + "' encontrada");
                    } else {
                        System.out.println("❌ Tabela '" + table + "' NÃO encontrada");
                    }
                } catch (Exception e) {
                    System.err.println("Erro ao verificar tabela " + table + ": " + e.getMessage());
                }
            }
            
            
            try (var stmt = conn.createStatement();
                 var rs = stmt.executeQuery("SELECT COUNT(*) as count FROM empresas")) {
                if (rs.next()) {
                    System.out.println("👥 Empresas cadastradas: " + rs.getInt("count"));
                }
            }
            
        } catch (Exception e) {
            System.err.println("❌ ERRO NA INTEGRAÇÃO: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("🎯 TESTE DE INTEGRAÇÃO CONCLUÍDO!");
    }
}