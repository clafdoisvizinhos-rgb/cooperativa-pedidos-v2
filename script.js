// URL do Web App (Apps Script)
const API_URL = 'https://script.google.com/macros/s/AKfycbwFILkBvW2-hSZpwWDfKdopClDzkDMKbiOKtG6rC4xiI8dnjKTalEwejT5keqI97wD_/exec';

// Elementos do DOM
const form = document.getElementById('pedidoForm');
const nomeInput = document.getElementById('nomeProdutor');
const produtosContainer = document.getElementById('produtosContainer');
const mensagemDiv = document.getElementById('mensagem');

// Carrega a lista de produtos ao iniciar
document.addEventListener('DOMContentLoaded', carregarProdutos);

// Função para carregar produtos da planilha
async function carregarProdutos() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.status === 'success') {
            renderizarProdutos(data.produtos);
        } else {
            mostrarMensagem('Erro ao carregar produtos: ' + data.message, 'erro');
        }
    } catch (error) {
        mostrarMensagem('Erro ao conectar com o servidor: ' + error.message, 'erro');
    }
}

// Função para renderizar os produtos na tela
function renderizarProdutos(produtos) {
    produtosContainer.innerHTML = '';
    
    produtos.forEach(produto => {
        const produtoDiv = document.createElement('div');
        produtoDiv.className = 'produto-item';
        
        produtoDiv.innerHTML = `
            <span class="produto-nome">${produto}</span>
            <input 
                type="number" 
                class="produto-input" 
                data-produto="${produto}"
                min="0" 
                step="0.01"
                placeholder="0"
            >
        `;
        
        produtosContainer.appendChild(produtoDiv);
    });
}

// Função para enviar o formulário
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nome = nomeInput.value.trim();
    
    if (!nome) {
        mostrarMensagem('Por favor, digite o nome do produtor!', 'erro');
        return;
    }
    
    // Coleta os produtos com quantidade > 0
    const inputs = document.querySelectorAll('.produto-input');
    const produtos = [];
    
    inputs.forEach(input => {
        const quantidade = parseFloat(input.value) || 0;
        if (quantidade > 0) {
            produtos.push({
                nome: input.dataset.produto,
                quantidade: quantidade
            });
        }
    });
    
    if (produtos.length === 0) {
        mostrarMensagem('Por favor, informe a quantidade de pelo menos um produto!', 'erro');
        return;
    }
    
    // Envia os dados
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: nome,
                produtos: produtos
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            mostrarMensagem('✅ ' + data.message, 'sucesso');
            form.reset();
            
            // Limpa os inputs de quantidade
            inputs.forEach(input => input.value = '');
        } else {
            mostrarMensagem('❌ Erro: ' + data.message, 'erro');
        }
    } catch (error) {
        mostrarMensagem('❌ Erro ao enviar dados: ' + error.message, 'erro');
    }
});

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo) {
    mensagemDiv.textContent = texto;
    mensagemDiv.className = `mensagem ${tipo}`;
    mensagemDiv.classList.remove('hidden');
    
    // Oculta a mensagem após 5 segundos
    setTimeout(() => {
        mensagemDiv.classList.add('hidden');
    }, 5000);
}
