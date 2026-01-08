// URL do Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwgMp4mUmzexojmFqMHExfL72ykfxFQuXN-W5rKxRJY6D8vbhUQTahVKSH_3WVZgIkh/exec';

// Elementos do DOM
let produtoInput;
let produtoList;
let produtosSuggestions = [];
let formulario;

// Quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Pegar elementos do DOM
    produtoInput = document.getElementById('produto');
    produtoList = document.getElementById('produto-list');
    formulario = document.getElementById('pedido-form');
    
    // Carregar produtos
    carregarProdutos();
    
    // Event listener para o input de produto
    produtoInput.addEventListener('input', filtrarProdutos);
    
    // Event listener para o formulário
    formulario.addEventListener('submit', registrarPedido);
});

// Carregar produtos da planilha
async function carregarProdutos() {
    try {
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();
        
        if (data.status === 'success') {
            produtosSuggestions = data.produtos;
            mostrarMensagem('Produtos carregados com sucesso!', 'success');
        } else {
            mostrarMensagem('Erro ao carregar produtos', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao conectar com o servidor', 'error');
    }
}

// Filtrar produtos conforme digitação
function filtrarProdutos() {
    const texto = produtoInput.value.toUpperCase();
    produtoList.innerHTML = '';
    
    if (texto.length === 0) {
        produtoList.style.display = 'none';
        return;
    }
    
    const produtosFiltrados = produtosSuggestions.filter(produto => 
        produto.toUpperCase().includes(texto)
    );
    
    if (produtosFiltrados.length === 0) {
        produtoList.style.display = 'none';
        return;
    }
    
    produtosFiltrados.forEach(produto => {
        const div = document.createElement('div');
        div.className = 'produto-item';
        div.textContent = produto;
        div.onclick = () => selecionarProduto(produto);
        produtoList.appendChild(div);
    });
    
    produtoList.style.display = 'block';
}

// Selecionar produto da lista
function selecionarProduto(produto) {
    produtoInput.value = produto;
    produtoList.style.display = 'none';
    document.getElementById('quantidade').focus();
}

// Registrar pedido
async function registrarPedido(e) {
    e.preventDefault();
    
    const produtor = document.getElementById('produtor').value;
    const produto = document.getElementById('produto').value;
    const quantidade = document.getElementById('quantidade').value;
    const unidade = document.getElementById('unidade').value;
    
    if (!produtor || !produto || !quantidade) {
        mostrarMensagem('Preencha todos os campos!', 'error');
        return;
    }
    
    const botao = document.querySelector('button[type="submit"]');
    botao.disabled = true;
    botao.textContent = '⏳ Salvando...';
    
    try {
        const dados = {
            action: 'save',
            produtor: produtor,
            produto: produto,
            quantidade: quantidade,
            unidade: unidade
        };
        
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(dados)
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            mostrarMensagem('✅ Pedido registrado com sucesso!', 'success');
            formulario.reset();
            produtoInput.focus();
        } else {
            mostrarMensagem('❌ Erro ao registrar pedido', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('❌ Erro ao conectar com o servidor', 'error');
    } finally {
        botao.disabled = false;
        botao.textContent = '📦 Registrar Pedido';
    }
}

// Mostrar mensagem
function mostrarMensagem(texto, tipo) {
    // Remove mensagem anterior se existir
    const msgAnterior = document.querySelector('.mensagem');
    if (msgAnterior) {
        msgAnterior.remove();
    }
    
    const mensagem = document.createElement('div');
    mensagem.className = `mensagem ${tipo}`;
    mensagem.textContent = texto;
    
    document.querySelector('.container').insertBefore(
        mensagem, 
        document.querySelector('.form-card')
    );
    
    setTimeout(() => {
        mensagem.remove();
    }, 3000);
}

// Fechar lista ao clicar fora
document.addEventListener('click', function(e) {
    if (e.target !== produtoInput && e.target.className !== 'produto-item') {
        if (produtoList) {
            produtoList.style.display = 'none';
        }
    }
});
