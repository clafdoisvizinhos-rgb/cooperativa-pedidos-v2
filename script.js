const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwgMp4mUmzexojmFqMHExfL72ykfxFQuXN-W5rKxRJY6D8vbhUQTahVKSH_3WVZgIkh/exec';

// Carrega produtos
async function carregarProdutos() {
    try {
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();
        
        if (data.produtos) {
            const datalist = document.getElementById('listaProdutos');
            datalist.innerHTML = '';
            
            data.produtos.forEach(produto => {
                const option = document.createElement('option');
                option.value = produto;
                datalist.appendChild(option);
            });
            
            console.log('✅ Produtos carregados:', data.produtos.length);
        }
    } catch (erro) {
        console.error('❌ Erro ao carregar produtos:', erro);
    }
}

// Mostra mensagem
function mostrarMensagem(texto, tipo) {
    const mensagem = document.getElementById('mensagem');
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;
    mensagem.classList.remove('oculto');
    
    setTimeout(() => {
        mensagem.classList.add('oculto');
    }, 5000);
}

// Envia pedido
async function enviarPedido(e) {
    e.preventDefault();
    
    const produtor = document.getElementById('produtor').value.trim();
    const produto = document.getElementById('produto').value.trim().toUpperCase();
    const quantidade = document.getElementById('quantidade').value;
    
    if (!produtor || !produto || !quantidade) {
        mostrarMensagem('❌ Preencha todos os campos', 'erro');
        return;
    }
    
    const dados = {
        produtor: produtor,
        produto: produto,
        quantidade: quantidade
    };
    
    console.log('📤 Enviando:', dados);
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados)
        });
        
        // Como é no-cors, assumimos sucesso
        mostrarMensagem('✅ Pedido registrado com sucesso!', 'sucesso');
        document.getElementById('formPedido').reset();
        
    } catch (erro) {
        console.error('❌ Erro:', erro);
        mostrarMensagem('❌ Erro ao registrar pedido', 'erro');
    }
}

// Inicializa
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
    document.getElementById('formPedido').addEventListener('submit', enviarPedido);
});
