// search_utils.js - Utilitários de busca reutilizáveis para todas as páginas

/**
 * Função genérica para calcular score de relevância de busca
 * Retorna um score numérico baseado em múltiplos critérios
 */
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

/**
 * Realiza uma busca case-insensitive e parcial em um array de objetos
 * Retorna array ordenado por relevância
 * 
 * @param {Array} itens - Array de objetos para buscar
 * @param {String} termoBusca - Termo de busca (aceita múltiplas palavras)
 * @param {Array} campos - Array de objetos com {chave: 'campo', peso: 1}
 * @return {Array} - Itens filtrados e ordenados por relevância
 */
function buscarComRelevancia(itens, termoBusca, campos) {
    if (!termoBusca || !termoBusca.trim()) {
        return itens;
    }
    
    // Dividir termo em palavras-chave
    const termos = termoBusca.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
    
    // Calcular score para cada item
    const itensComScore = itens.map(item => {
        // Preparar campos para avaliação
        const camposAvaliacao = campos.map(campo => ({
            valor: item[campo.chave] || '',
            peso: campo.peso || 1
        }));
        
        const score = calcularScoreBusca(item, termos, camposAvaliacao);
        
        return { item, score };
    });
    
    // Filtrar itens com score > 0 e ordenar por score descendente
    return itensComScore
        .filter(obj => obj.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(obj => obj.item);
}

/**
 * Cria um debounce para evitar múltiplas chamadas rápidas
 * @param {Function} func - Função a executar
 * @param {Number} delay - Delay em ms
 * @return {Function} - Função debounced
 */
function criarDebounce(func, delay = 300) {
    let timeout;
    return function executarDebounce(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Inicializa busca genérica em um elemento search-bar
 * @param {Function} callbackBusca - Função a chamar com o termo de busca
 * @param {Number} debounceDelay - Delay do debounce em ms
 */
function inicializarBuscaGenerico(callbackBusca, debounceDelay = 300) {
    const searchInput = document.querySelector('.search-bar input');
    
    if (!searchInput) {
        console.warn('Elemento .search-bar input não encontrado');
        return;
    }
    
    // Criar versão debounced da callback
    const buscarComDebounce = criarDebounce(callbackBusca, debounceDelay);
    
    // Adicionar listener de input
    searchInput.addEventListener('input', function(e) {
        buscarComDebounce(e.target.value);
    });
    
    console.log('✅ Busca genérica inicializada');
}

/**
 * Normaliza texto para comparação (remove acentos, espaços extras, etc)
 * @param {String} texto - Texto a normalizar
 * @return {String} - Texto normalizado
 */
function normalizarTexto(texto) {
    if (!texto) return '';
    
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/\s+/g, ' ')             // Remove espaços extras
        .trim();
}

/**
 * Busca fuzzy simples (permite alguns caracteres diferentes)
 * @param {String} termo - Termo de busca
 * @param {String} texto - Texto para buscar
 * @return {Number} - Score de similaridade (0-100)
 */
function buscaFuzzy(termo, texto) {
    termo = normalizarTexto(termo);
    texto = normalizarTexto(texto);
    
    if (texto.includes(termo)) return 100;
    
    // Implementar Levenshtein distance simples
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
