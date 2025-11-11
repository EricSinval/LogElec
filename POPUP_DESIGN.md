# Padrão Visual de Popups - LogElec

## Especificações de Design

### Cores Utilizadas
- **Cor Primária (Botões)**: `#0F726C` (Verde escuro)
- **Cor Primária (Hover)**: `#0a5047` (Verde mais escuro)
- **Cor de Texto**: `#444444` (Cinza escuro claro)
- **Fundo Modal**: `#ffffff` (Branco)
- **Fundo Overlay**: `rgba(0,0,0,0.45)` (Preto com transparência)
- **Borda Separadora**: `#e8e8e8` (Cinza claro)

### Estrutura do Popup

```
┌─────────────────────────────────────┐
│                                     │
│      📝 Mensagem do Popup           │ ← Texto centralizado
│         em tom cinza claro          │   #444444, font-size 16px
│                                     │   font-weight 500
│─────────────────────────────────────│ ← Linha separadora
│ [Botão] [Botão]                     │ ← Botões alinhados à esquerda
│                                     │   Padding: 20px 30px
└─────────────────────────────────────┘
```

### Dimensões
- **Largura Máxima**: 540px
- **Largura Mínima**: 100% (responsivo em mobile)
- **Altura Mínima**: 150px
- **Border Radius**: 10px
- **Box Shadow**: 0 10px 30px rgba(0,0,0,0.25)

### Padding/Espaçamento
- **Content (Texto)**: 40px top, 30px sides, 30px bottom
- **Actions (Botões)**: 20px vertical, 30px horizontal
- **Gap entre Botões**: 12px

### Botões
- **Cor de Fundo**: `#0F726C`
- **Cor de Texto**: `#ffffff` (Branco)
- **Font Size**: 14px
- **Font Weight**: 600 (Semi-bold)
- **Padding**: 10px 20px
- **Border Radius**: 6px
- **Min Width**: 90px
- **Transition**: 200ms ease
- **Hover**: Background muda para `#0a5047`

### Tipos de Popup
Todos os tipos (info, success, error) utilizam as mesmas cores:
- Texto: `#444444`
- Botão: `#0F726C`
- Fundo: `#ffffff`

### Animações
- **Fade In**: 160ms ease-out (entrada)
- **Fade Out**: 160ms ease-in (saída)
- **Botão Hover**: 200ms ease

## Exemplos de Uso

### Sucesso
```javascript
showPopup('✅ Agendamento confirmado para Segunda às 14:00!', { 
  type: 'success',
  buttons: [{
    text: 'Ver postagens',
    onClick: () => { window.location.href = 'postagens.html'; }
  }]
});
```

### Erro
```javascript
showPopup('❌ Já existe um agendamento para este horário', { 
  type: 'error'
});
```

### Info
```javascript
showPopup('⚠️ Você precisa fazer login primeiro!', { 
  type: 'info', 
  buttons: [{ 
    text: 'Ir para login', 
    onClick: () => { window.location.href = 'login.html'; } 
  }] 
});
```

## Implementação
- Arquivo CSS: `frontend/style_css/styles_popup.css`
- Arquivo JS: `frontend/script/ui_popup.js`
- Import CSS em todos os HTML (login.html, cadastro.html, agendamento.html, etc.)
