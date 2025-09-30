package com.ads.LogElec.entity;

public enum StatusAgendamento {
    PENDENTE,      // 📝 Agendado mas não confirmado
    CONFIRMADO,    // ✅ Coletora aceitou
    EM_ROTA,       // 🚚 Coletora a caminho  
    CONCLUIDO,     // 🎉 Coleta realizada
    CANCELADO      // ❌ Agendamento cancelado
}