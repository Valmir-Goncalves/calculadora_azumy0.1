// Configurações do traço de concreto por fck (MPa) para escadas/rampas
const TRACOS_ESCADA = {
    '20': {
        cimento: 0.365,
        areia: 0.609,
        brita: 0.592,
        agua: 0.186,
        aditivo: 0.0046,
        descricao: "20 MPa (Estrutural leve)"
    },
    '25': {
        cimento: 0.400,
        areia: 0.585,
        brita: 0.568,
        agua: 0.181,
        aditivo: 0.0050,
        descricao: "25 MPa (Estrutural comum)"
    },
    '30': {
        cimento: 0.435,
        areia: 0.561,
        brita: 0.544,
        agua: 0.176,
        aditivo: 0.0054,
        descricao: "30 MPa (Estrutural reforçado - recomendado para escadas)"
    },
    '35': {
        cimento: 0.470,
        areia: 0.537,
        brita: 0.520,
        agua: 0.171,
        aditivo: 0.0058,
        descricao: "35 MPa (Alta resistência)"
    }
};

function calcularEscada() {
    // Obter valores dos inputs
    const tipoEstrutura = document.getElementById('tipo-estrutura').value;
    const fck = document.getElementById('fck').value;
    const comprimento = parseFloat(document.getElementById('comprimento').value);
    const alturaFundo = parseFloat(document.getElementById('altura-fundo').value);
    const largura = parseFloat(document.getElementById('largura').value);
    const numDegraus = parseInt(document.getElementById('num-degraus').value);
    const alturaEspelho = parseFloat(document.getElementById('altura-espelho').value);
    const comprimentoDegrau = parseFloat(document.getElementById('comprimento-degrau').value);
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const pesoSaco = parseFloat(document.getElementById('saco-cimento').value);

    // Validar entradas
    if (isNaN(comprimento)) return mostrarFeedback('Comprimento inválido!', 'error');
    if (isNaN(alturaFundo)) return mostrarFeedback('Altura do fundo inválida!', 'error');
    if (isNaN(largura)) return mostrarFeedback('Largura inválida!', 'error');
    if (isNaN(numDegraus)) return mostrarFeedback('Número de degraus inválido!', 'error');
    if (isNaN(alturaEspelho)) return mostrarFeedback('Altura do espelho inválida!', 'error');
    if (isNaN(comprimentoDegrau)) return mostrarFeedback('Comprimento do degrau inválido!', 'error');
    if (isNaN(quantidade)) return mostrarFeedback('Quantidade inválida!', 'error');
    if (isNaN(pesoSaco)) return mostrarFeedback('Peso do saco inválido!', 'error');

    // Obter traço para o fck selecionado
    const traco = TRACOS_ESCADA[fck];
    
    // CÁLCULOS ATUALIZADOS DE VOLUME
    let volumeTotal;
    
    if (tipoEstrutura === 'escada') {
        // Cálculo para escada
        const volumeFundo = comprimento * alturaFundo * largura * quantidade;
        
        // Cálculo mais preciso para degraus (cada degrau como bloco completo)
        const volumeDegraus = numDegraus * comprimentoDegrau * alturaEspelho * largura * quantidade;
        
        volumeTotal = volumeFundo + volumeDegraus;
    } else {
        // Cálculo para rampa (considerando como um bloco inclinado)
        const alturaTotal = alturaFundo + (numDegraus * alturaEspelho);
        volumeTotal = comprimento * ((alturaFundo + alturaTotal) / 2) * largura * quantidade;
    }

    // Cálculos de materiais
    const materiais = {
        fck: fck,
        descricaoResistencia: traco.descricao,
        tipoEstrutura: tipoEstrutura,
        cimentoKg: traco.cimento * 1000 * volumeTotal,
        cimentoSacos: Math.ceil((traco.cimento * 1000 * volumeTotal) / pesoSaco), // Arredonda para cima
        areiaM3: traco.areia * volumeTotal,
        areiaLatas: Math.ceil((traco.areia * 1000 * volumeTotal) / 18), // Arredonda para cima
        britaM3: traco.brita * volumeTotal,
        britaLatas: Math.ceil((traco.brita * 1000 * volumeTotal) / 18), // Arredonda para cima
        aguaLitros: traco.agua * 1000 * volumeTotal,
        aguaLatas: Math.ceil((traco.agua * 1000 * volumeTotal) / 18), // Arredonda para cima
        aditivoLitros: traco.aditivo * volumeTotal,
        volumeTotal: volumeTotal,
        quantidade: quantidade
    };

    // Exibir resultados
    exibirResultadosEscada(materiais, pesoSaco);
}

function exibirResultadosEscada(materiais, pesoSaco) {
    const container = document.getElementById('resultado-concreto');
    
    container.innerHTML = `
        <h3>Resultados para ${materiais.tipoEstrutura === 'escada' ? 'Escada' : 'Rampa'} (${materiais.quantidade}x)</h3>
        
        <div class="resultado-item">
            <span>Resistência do concreto:</span>
            <span class="resultado-valor">${materiais.fck} MPa (${materiais.descricaoResistencia})</span>
        </div>
        
        <div class="resultado-grid">
            <h4>Volumes Calculados</h4>
            
            <div class="resultado-item destaque">
                <span>Volume total de concreto:</span>
                <span class="resultado-valor">${materiais.volumeTotal.toFixed(2)} m³</span>
            </div>
        </div>
        
        <div class="resultado-grid">
            <h4>Materiais Necessários (com 10% de margem)</h4>
            
            <div class="resultado-item">
                <span>Cimento:</span>
                <span class="resultado-valor">
                    ${Math.ceil(materiais.cimentoKg * 1.1).toFixed(2)} kg 
                    (${Math.ceil(materiais.cimentoSacos * 1.1)} sacos de ${pesoSaco}kg)
                </span>
            </div>
            
            <div class="resultado-item">
                <span>Areia:</span>
                <span class="resultado-valor">
                    ${(materiais.areiaM3 * 1.1).toFixed(2)} m³ 
                    (${Math.ceil(materiais.areiaLatas * 1.1)} latas de 18L)
                </span>
            </div>
            
            <div class="resultado-item">
                <span>Brita:</span>
                <span class="resultado-valor">
                    ${(materiais.britaM3 * 1.1).toFixed(2)} m³ 
                    (${Math.ceil(materiais.britaLatas * 1.1)} latas de 18L)
                </span>
            </div>
            
            <div class="resultado-item">
                <span>Água:</span>
                <span class="resultado-valor">
                    ${Math.ceil(materiais.aguaLitros * 1.1).toFixed(2)} L 
                    (${Math.ceil(materiais.aguaLatas * 1.1)} latas de 18L)
                </span>
            </div>
            
            <div class="resultado-item">
                <span>Aditivo:</span>
                <span class="resultado-valor">
                    ${(materiais.aditivoLitros * 1.1).toFixed(2)} L
                </span>
            </div>
        </div>
        
        <div class="resultado-item destaque">
            <span>Traço para 1 saco de ${pesoSaco}kg:</span>
            <span class="resultado-valor">
                ${(materiais.areiaLatas/materiais.cimentoSacos).toFixed(2)} latas de areia |
                ${(materiais.britaLatas/materiais.cimentoSacos).toFixed(2)} latas de brita |
                ${(materiais.aguaLatas/materiais.cimentoSacos).toFixed(2)} latas de água
            </span>
        </div>
        
        <div class="resultado-observacoes">
            <h4>Observações:</h4>
            <ul>
                <li>Valores já incluem 10% de margem de segurança para desperdício</li>
                <li>Slump (abatimento) recomendado: 8cm ± 2cm</li>
                <li>Padiola de 36.33 litros para cimento de 42.5kg</li>
                <li>Para obras profissionais, consulte um engenheiro civil</li>
            </ul>
        </div>
    `;

    container.style.display = 'block';
}

function mostrarFeedback(mensagem, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `feedback-toast feedback-${tipo}`;
    toast.innerHTML = `
        <span class="feedback-icon">${tipo === 'success' ? '✓' : '⚠'}</span>
        <span>${mensagem}</span>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}