// =============================================
// EXPOSIÇÃO DE FUNÇÕES GLOBAIS
// =============================================
window.abrirCalculadora = function(tela) {
    if (tela === 'banco-duto') {
        window.location.href = 'calculadora.html?tela=banco-duto';
    } else if (tela === 'viga') {
        window.location.href = 'viga.html';
    } else {
        alert("Funcionalidade em desenvolvimento!");
    }
};
// =============================================
// VARIÁVEIS GLOBAIS E CONFIGURAÇÕES
// =============================================

// Controle de elementos da interface
const elementos = {
    inputsBanco: {
        largura: document.getElementById('largura-banco-duto'),
        altura: document.getElementById('altura-banco-duto'),
        comprimento: document.getElementById('comprimento-banco-duto')
    },
    containerTubos: document.getElementById('tubos-container'),
    resultado: {
        container: document.getElementById('resultado-banco-duto'),
        dimensoes: {
            largura: document.getElementById('resumo-largura'),
            altura: document.getElementById('resumo-altura'),
            comprimento: document.getElementById('resumo-comprimento')
        },
        volumes: {
            bruto: document.getElementById('volume-bruto'),
            tubos: document.getElementById('volume-tubos'),
            concreto: document.getElementById('volume-concreto')
        },
        listaTubos: document.getElementById('resumo-tubos')
    },
    historicoLista: document.getElementById('historico-listagem')
};

// Configurações de armazenamento
const config = {
    chaves: {
        historico: 'azumy-historico-v3',
        dadosAtuais: 'azumy-dados-atuais-v3',
        ultimoCalculo: 'azumy-ultimo-calculo-v3'
    },
    limites: {
        historico: 30
    }
};

// Estado da aplicação
let estado = {
    tuboCount: 0,
    historico: [],
    dadosAtuais: null
};

// =============================================
// FUNÇÕES DE GERENCIAMENTO DE TUBOS
// =============================================

function adicionarTubo(dados = {}) {
    estado.tuboCount++;
    
    const novoTubo = `
        <div class="tubo-item" id="tubo-${estado.tuboCount}">
            <h3>Tubo ${estado.tuboCount}</h3>
            <div class="input-group">
                <label>Raio (m)</label>
                <input type="number" id="raio-tubo-${estado.tuboCount}" 
                       class="input-tubo" step="0.01" min="0.01" 
                       value="${dados.raio || ''}" required>
            </div>
            <div class="input-group">
                <label>Quantidade</label>
                <input type="number" id="quantidade-tubo-${estado.tuboCount}" 
                       class="input-tubo" min="1" 
                       value="${dados.quantidade || 1}" required>
            </div>
            <div class="input-group">
                <label>Comprimento (m)</label>
                <input type="number" id="comprimento-tubo-${estado.tuboCount}" 
                       class="input-tubo" step="0.01" min="0.1" 
                       value="${dados.comprimento || ''}" required>
            </div>
            <button class="btn-remover" onclick="removerTubo(${estado.tuboCount})">
                Remover
            </button>
        </div>
    `;
    
    elementos.containerTubos.insertAdjacentHTML('beforeend', novoTubo);
}

function removerTubo(id) {
    const tubo = document.getElementById(`tubo-${id}`);
    if (tubo) {
        tubo.remove();
        atualizarNumeracaoTubos();
    }
}

function atualizarNumeracaoTubos() {
    const tubos = document.querySelectorAll('.tubo-item');
    tubos.forEach((tubo, index) => {
        const novoId = index + 1;
        tubo.querySelector('h3').textContent = `Tubo ${novoId}`;
        tubo.id = `tubo-${novoId}`;
        
        ['raio', 'quantidade', 'comprimento'].forEach((tipo, i) => {
            tubo.querySelectorAll('input')[i].id = `${tipo}-tubo-${novoId}`;
        });
    });
    estado.tuboCount = tubos.length;
}

// =============================================
// FUNÇÕES DE LIMPEZA
// =============================================

function limparDadosBancoDuto() {
    if (!confirm('Tem certeza que deseja limpar todos os dados?\nEsta ação não pode ser desfeita.')) return;

    // Reset dos inputs principais
    Object.values(elementos.inputsBanco).forEach(input => input.value = '');
    
    // Limpeza de tubos
    elementos.containerTubos.innerHTML = '';
    estado.tuboCount = 0;
    adicionarTubo();
    
    // Oculta resultados
    elementos.resultado.container.style.display = 'none';
    
    // Limpeza do storage
    localStorage.removeItem(config.chaves.dadosAtuais);
    
    // Feedback
    mostrarFeedback('Todos os dados foram resetados', 'success');
}

// =============================================
// FUNÇÕES DE HISTÓRICO
// =============================================

function carregarHistorico() {
    const historicoSalvo = localStorage.getItem(config.chaves.historico);
    estado.historico = historicoSalvo ? JSON.parse(historicoSalvo) : [];
    atualizarHistoricoUI();
}

function limparHistorico() {
    if (!confirm('Limpar todo o histórico de cálculos?')) return;
    
    estado.historico = [];
    localStorage.removeItem(config.chaves.historico);
    atualizarHistoricoUI();
    mostrarFeedback('Histórico limpo com sucesso', 'success');
}

function atualizarHistoricoUI() {
    if (!elementos.historicoLista) return;

    elementos.historicoLista.innerHTML = estado.historico.length > 0
        ? estado.historico.map((item, idx) => `
            <div class="historico-item" data-id="${idx}">
                <div class="historico-cabecalho">
                    <span>${item.data || 'Sem data'}</span>
                    <span>${item.resultados?.volumeConcreto?.toFixed(2) || '0.00'}m³</span>
                </div>
                <div class="historico-detalhes">
                    <div>Dimensões: ${item.estado?.medidas?.largura?.toFixed(2) || '0.00'} × ${item.estado?.medidas?.altura?.toFixed(2) || '0.00'} × ${item.estado?.medidas?.comprimento?.toFixed(2) || '0.00'}</div>
                    <div>Tubos: ${item.estado?.tubos?.length || 0}</div>
                </div>
                <div class="historico-acoes">
                    <button onclick="recuperarDoHistorico(${idx})">Recuperar</button>
                    <button onclick="removerDoHistorico(${idx})">Excluir</button>
                </div>
            </div>
        `).join('')
        : '<div class="sem-dados">Nenhum cálculo no histórico</div>';
}

function recuperarDoHistorico(index) {
    const item = estado.historico[index];
    if (!item) return;

    // Restaura medidas
    elementos.inputsBanco.largura.value = item.estado.medidas.largura;
    elementos.inputsBanco.altura.value = item.estado.medidas.altura;
    elementos.inputsBanco.comprimento.value = item.estado.medidas.comprimento;

    // Restaura tubos
    elementos.containerTubos.innerHTML = '';
    estado.tuboCount = 0;
    item.estado.tubos.forEach(tubo => adicionarTubo(tubo));

    mostrarFeedback('Cálculo recuperado do histórico', 'success');
}

function removerDoHistorico(index) {
    estado.historico.splice(index, 1);
    localStorage.setItem(config.chaves.historico, JSON.stringify(estado.historico));
    atualizarHistoricoUI();
    mostrarFeedback('Item removido do histórico', 'success');
}

// =============================================
// FUNÇÕES UTILITÁRIAS
// =============================================

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

window.abrirCalculadora = function(tela) {
    if (tela === 'banco-duto') {
        window.location.href = 'calculadora.html?tela=banco-duto';
    } else if (tela === 'viga') {
        window.location.href = 'viga.html';
    } else if (tela === 'escada') {
        window.location.href = 'escada.html';
    } else if (tela === 'historico') {
        window.location.href = 'historico.html';
    } else if (tela === 'ajuda') {
        window.location.href = 'ajuda.html';
    } else if (tela === 'sobre') {
        window.location.href = 'sobre.html';
    } else {
        alert("Funcionalidade em desenvolvimento!");
    }
};

function carregarEstadoSalvo() {
    const dados = localStorage.getItem(config.chaves.dadosAtuais);
    if (!dados) return;

    try {
        const estadoSalvo = JSON.parse(dados);
        
        // Carrega medidas
        if (estadoSalvo.medidas) {
            elementos.inputsBanco.largura.value = estadoSalvo.medidas.largura || '';
            elementos.inputsBanco.altura.value = estadoSalvo.medidas.altura || '';
            elementos.inputsBanco.comprimento.value = estadoSalvo.medidas.comprimento || '';
        }

        // Carrega tubos
        if (estadoSalvo.tubos?.length > 0) {
            elementos.containerTubos.innerHTML = '';
            estadoSalvo.tubos.forEach(tubo => adicionarTubo(tubo));
        }
    } catch (e) {
        console.error("Erro ao carregar estado:", e);
        mostrarFeedback('Erro ao carregar dados salvos', 'error');
    }
}

// =============================================
// CORE DA CALCULADORA
// =============================================

function calcularBancoDuto() {
    try {
        // Validação
        if (!validarEntradasBanco()) return;

        // Coleta dados
        const medidasBanco = obterMedidasBanco();
        const dadosTubos = obterDadosTubos();

        // Cálculos
        const resultados = {
            volumeBruto: calcularVolumeBruto(medidasBanco),
            volumeTubos: calcularVolumeTotalTubos(dadosTubos)
        };
        resultados.volumeConcreto = resultados.volumeBruto - resultados.volumeTubos;

        // Valida resultados
        if (resultados.volumeConcreto < 0) {
            mostrarFeedback('Volume dos tubos excede o volume do banco!', 'error');
            return;
        }

        // Atualiza UI
        atualizarInterface(resultados, medidasBanco, dadosTubos);

        // Persistência
        salvarEstadoAtual(medidasBanco, dadosTubos);
        adicionarAoHistorico(resultados);

    } catch (error) {
        console.error('Erro no cálculo:', error);
        mostrarFeedback('Erro durante o cálculo', 'error');
    }
}

function validarEntradasBanco() {
    const validacoes = [
        { campo: elementos.inputsBanco.largura, nome: 'Largura' },
        { campo: elementos.inputsBanco.altura, nome: 'Altura' },
        { campo: elementos.inputsBanco.comprimento, nome: 'Comprimento' }
    ];

    for (const { campo, nome } of validacoes) {
        const valor = parseFloat(campo.value);
        if (isNaN(valor)) {
            mostrarFeedback(`${nome} inválida! Digite um número válido.`, 'error');
            campo.focus();
            return false;
        }
        if (valor <= 0) {
            mostrarFeedback(`${nome} deve ser maior que zero!`, 'error');
            campo.focus();
            return false;
        }
    }
    return true;
}

function obterMedidasBanco() {
    return {
        largura: parseFloat(elementos.inputsBanco.largura.value),
        altura: parseFloat(elementos.inputsBanco.altura.value),
        comprimento: parseFloat(elementos.inputsBanco.comprimento.value)
    };
}

function obterDadosTubos() {
    return Array.from(document.querySelectorAll('.tubo-item')).map((_, index) => {
        const id = index + 1;
        return {
            raio: parseFloat(document.getElementById(`raio-tubo-${id}`).value),
            quantidade: parseInt(document.getElementById(`quantidade-tubo-${id}`).value),
            comprimento: parseFloat(document.getElementById(`comprimento-tubo-${id}`).value)
        };
    });
}

function calcularVolumeBruto({ largura, altura, comprimento }) {
    return largura * altura * comprimento;
}

function calcularVolumeTotalTubos(tubos) {
    return tubos.reduce((total, { raio, quantidade, comprimento }) => {
        return total + (Math.PI * Math.pow(raio, 2) * comprimento * quantidade);
    }, 0);
}

function atualizarInterface(resultados, medidas, tubos) {
    // Dimensões
    elementos.resultado.dimensoes.largura.textContent = medidas.largura.toFixed(2);
    elementos.resultado.dimensoes.altura.textContent = medidas.altura.toFixed(2);
    elementos.resultado.dimensoes.comprimento.textContent = medidas.comprimento.toFixed(2);

    // Lista de tubos
    elementos.resultado.listaTubos.innerHTML = tubos.map((tubo, i) => `
        <div class="resumo-item">
            <span>Tubo ${i + 1}:</span>
            <span class="resumo-valor">
                ∅ ${(tubo.raio * 2).toFixed(2)}m (raio ${tubo.raio.toFixed(2)}m) | 
                Qtd: ${tubo.quantidade} | 
                Comp.: ${tubo.comprimento.toFixed(2)}m
            </span>
        </div>
    `).join('');

    // Volumes
    elementos.resultado.volumes.bruto.textContent = resultados.volumeBruto.toFixed(2);
    elementos.resultado.volumes.tubos.textContent = resultados.volumeTubos.toFixed(2);
    elementos.resultado.volumes.concreto.textContent = resultados.volumeConcreto.toFixed(2);

    // Exibe resultados
    elementos.resultado.container.style.display = 'block';
}

function salvarEstadoAtual(medidas, tubos) {
    const estadoAtual = {
        medidas,
        tubos,
        timestamp: Date.now()
    };
    localStorage.setItem(config.chaves.dadosAtuais, JSON.stringify(estadoAtual));
}

function adicionarAoHistorico(resultados) {
    const novoItem = {
        data: new Date().toLocaleString(),
        resultados,
        estado: {
            medidas: obterMedidasBanco(),
            tubos: obterDadosTubos()
        }
    };

    estado.historico = [novoItem, ...estado.historico.slice(0, config.limites.historico - 1)];
    localStorage.setItem(config.chaves.historico, JSON.stringify(estado.historico));
    atualizarHistoricoUI();
}

// =============================================
// INICIALIZAÇÃO
// =============================================

function inicializarAplicacao() {
    // Carrega dados salvos
    carregarEstadoSalvo();
    carregarHistorico();

    // Configuração inicial
    if (!document.querySelector('.tubo-item')) adicionarTubo();

    // Event listeners
    document.querySelectorAll('.input-tubo').forEach(input => {
        input.addEventListener('change', validarEntradasBanco);
    });
}

document.addEventListener('DOMContentLoaded', inicializarAplicacao);