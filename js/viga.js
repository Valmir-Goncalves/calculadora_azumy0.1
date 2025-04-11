// Configurações do traço de concreto por fck (MPa)
const TRACOS = {
    '20': {
        cimento: 0.344,
        areia: 0.486,
        brita: 0.364,
        agua: 0.210,
        aditivo: 0.0037,
        descricao: "20 MPa (Estrutural leve)"
    },
    '25': {
        cimento: 0.378,
        areia: 0.473,
        brita: 0.355,
        agua: 0.205,
        aditivo: 0.0041,
        descricao: "25 MPa (Estrutural comum)"
    },
    '30': {
        cimento: 0.412,
        areia: 0.460,
        brita: 0.345,
        agua: 0.200,
        aditivo: 0.0045,
        descricao: "30 MPa (Estrutural reforçado)"
    },
    '35': {
        cimento: 0.446,
        areia: 0.447,
        brita: 0.335,
        agua: 0.195,
        aditivo: 0.0049,
        descricao: "35 MPa (Estrutural pesado)"
    },
    '40': {
        cimento: 0.480,
        areia: 0.434,
        brita: 0.325,
        agua: 0.190,
        aditivo: 0.0053,
        descricao: "40 MPa (Alta resistência)"
    },
    '45': {
        cimento: 0.514,
        areia: 0.421,
        brita: 0.315,
        agua: 0.185,
        aditivo: 0.0057,
        descricao: "45 MPa (Alta resistência)"
    },
    '50': {
        cimento: 0.548,
        areia: 0.408,
        brita: 0.305,
        agua: 0.180,
        aditivo: 0.0061,
        descricao: "50 MPa (Alta resistência)"
    }
};

function calcularConcreto() {
    // Obter valores dos inputs
    const tipoEstrutura = document.getElementById('tipo-estrutura').value;
    const fck = document.getElementById('fck').value;
    const altura = parseFloat(document.getElementById('altura-viga').value);
    const largura = parseFloat(document.getElementById('largura-viga').value);
    const comprimento = parseFloat(document.getElementById('comprimento-viga').value);
    const quantidade = parseInt(document.getElementById('quantidade-viga').value);
    const pesoCimento = parseFloat(document.getElementById('saco-cimento').value);

    // Validar entradas
    if (isNaN(altura)) return mostrarFeedback('Altura inválida!', 'error');
    if (isNaN(largura)) return mostrarFeedback('Largura inválida!', 'error');
    if (isNaN(comprimento)) return mostrarFeedback('Comprimento inválido!', 'error');
    if (isNaN(quantidade)) return mostrarFeedback('Quantidade inválida!', 'error');
    if (isNaN(pesoCimento)) return mostrarFeedback('Peso do cimento inválido!', 'error');

    // Obter traço para o fck selecionado
    const traco = TRACOS[fck];
    
    // Calcular volume total
    const volumeTotal = altura * largura * comprimento * quantidade;

    // Cálculos de materiais
    const materiais = {
        fck: fck,
        descricaoResistencia: traco.descricao,
        cimentoKg: traco.cimento * 1000 * volumeTotal,
        cimentoSacos: (traco.cimento * 1000 * volumeTotal) / pesoCimento,
        areiaM3: traco.areia * volumeTotal,
        areiaLatas: (traco.areia * 1000 * volumeTotal) / 18,
        britaM3: traco.brita * volumeTotal,
        britaLatas: (traco.brita * 1000 * volumeTotal) / 18,
        aguaLitros: traco.agua * 1000 * volumeTotal,
        aguaLatas: (traco.agua * 1000 * volumeTotal) / 18,
        aditivoLitros: traco.aditivo * volumeTotal
    };

    // Exibir resultados
    exibirResultados(tipoEstrutura, volumeTotal, materiais, pesoCimento);
}

function exibirResultados(tipo, volume, materiais, pesoCimento) {
    const container = document.getElementById('resultado-concreto');
    
    container.innerHTML = `
        <h3>Resultados para ${tipo}</h3>
        
        <div class="resultado-item">
            <span>Resistência do concreto:</span>
            <span class="resultado-valor">${materiais.fck} MPa (${materiais.descricaoResistencia})</span>
        </div>
        
        <div class="resultado-item">
            <span>Volume total:</span>
            <span class="resultado-valor">${volume.toFixed(2)} m³</span>
        </div>
        
        <div class="resultado-grid">
            <h4>Materiais Necessários</h4>
            
            <div class="resultado-item">
                <span>Cimento:</span>
                <span class="resultado-valor">${materiais.cimentoKg.toFixed(2)} kg (${materiais.cimentoSacos.toFixed(2)} sacos de ${pesoCimento}kg)</span>
            </div>
            
            <div class="resultado-item">
                <span>Areia:</span>
                <span class="resultado-valor">${materiais.areiaM3.toFixed(2)} m³ (${materiais.areiaLatas.toFixed(2)} latas de 18L)</span>
            </div>
            
            <div class="resultado-item">
                <span>Brita:</span>
                <span class="resultado-valor">${materiais.britaM3.toFixed(2)} m³ (${materiais.britaLatas.toFixed(2)} latas de 18L)</span>
            </div>
            
            <div class="resultado-item">
                <span>Água:</span>
                <span class="resultado-valor">${materiais.aguaLitros.toFixed(2)} L (${materiais.aguaLatas.toFixed(2)} latas de 18L)</span>
            </div>
            
            <div class="resultado-item">
                <span>Aditivo:</span>
                <span class="resultado-valor">${materiais.aditivoLitros.toFixed(2)} L</span>
            </div>
        </div>
        
        <div class="resultado-item destaque">
            <span>Traço para 1 saco de ${pesoCimento}kg:</span>
            <span class="resultado-valor">
                ${(materiais.areiaLatas/materiais.cimentoSacos).toFixed(2)} latas de areia |
                ${(materiais.britaLatas/materiais.cimentoSacos).toFixed(2)} latas de brita |
                ${(materiais.aguaLatas/materiais.cimentoSacos).toFixed(2)} latas de água
            </span>
        </div>
    `;

    container.style.display = 'block';
}

// Função de feedback
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