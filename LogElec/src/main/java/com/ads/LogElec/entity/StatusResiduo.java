package com.ads.LogElec.entity;

public enum StatusResiduo {
    PENDENTE,      // 📝 Cadastrado mas não agendado
    AGENDADO,      // 📅 Tem agendamento marcado
    COLETADO,      // ✅ Já foi coletado
    CANCELADO      // ❌ Cadastro cancelado
}