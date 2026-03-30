





function calcularScoreBusca(item, termos, campos) {
    let score = 0;
    
    termos.forEach(termo => {
        campos.forEach(campo => {
            const valor = (campo.valor || '').toLowerCase();
            const peso = campo.peso || 1;
            
            if (valor.includes(termo)) {
                score += peso;

                if (valor.startsWith(termo)) {
                    score += peso * 0.5;
                }

                if (valor === termo) {
                    score += peso;
                }
            }
        });
    });
    
    return score;
}










function buscarComRelevancia(itens, termoBusca, campos) {
    if (!termoBusca || !termoBusca.trim()) {
        return itens;
    }
    
    
    const termos = termoBusca.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
    
    
    const itensComScore = itens.map(item => {
        
        const camposAvaliacao = campos.map(campo => ({
            valor: item[campo.chave] || '',
            peso: campo.peso || 1
        }));
        
        const score = calcularScoreBusca(item, termos, camposAvaliacao);
        
        return { item, score };
    });
    
    
    return itensComScore
        .filter(obj => obj.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(obj => obj.item);
}







function criarDebounce(func, delay = 300) {
    let timeout;
    return function executarDebounce(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}






function inicializarBuscaGenerico(callbackBusca, debounceDelay = 300) {
    const searchInput = document.querySelector('.search-bar input');
    
    if (!searchInput) {
        console.warn('Elemento .search-bar input não encontrado');
        return;
    }
    
    
    const buscarComDebounce = criarDebounce(callbackBusca, debounceDelay);
    
    
    searchInput.addEventListener('input', function(e) {
        buscarComDebounce(e.target.value);
    });
    
    console.log('✅ Busca genérica inicializada');
}






function normalizarTexto(texto) {
    if (!texto) return '';
    
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') 
        .replace(/\s+/g, ' ')             
        .trim();
}







function buscaFuzzy(termo, texto) {
    termo = normalizarTexto(termo);
    texto = normalizarTexto(texto);
    
    if (texto.includes(termo)) return 100;
    
    
    let matches = 0;
    let posicao = 0;
    
    for (let char of termo) {
        const idx = texto.indexOf(char, posicao);
        if (idx === -1) break;
        matches++;
        posicao = idx + 1;
    }
    
    return Math.round((matches / termo.length) * 100);
}

console.log('🔍 search_utils.js carregado com sucesso');
