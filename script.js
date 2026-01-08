const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwgMp4mUmzexojmFqMHExfL72ykfxFQuXN-W5rKxRJY6D8vbhUQTahVKSH_3WVZgIkh/exec';

// Carrega produtos no SELECT
async function carregarProdutos() {
    const selectProduto = document.getElementById('produto');
    
    try {
        console.log('🔄 Carregando produtos...');
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();
        
        if (data.produtos && data.produtos.length > 0) {
            // Limpa o select
            selectProduto.innerHTML = '<option value="">-- Selecione um produto --</option>';
            
            // Adiciona cada produto como opção
            data.produtos.forEach(produto => {
                const option = document.createElement('option');
                option.value = produto;
                option.textContent = produto;
                selectProduto.appendChild(option);
            });
            
            console.log('✅ Produtos carregados:', data.produtos.length);
        } else {
            selectProduto.innerHTML = '<option value="">Nenhum produto encontrado</option>';
            console.warn('⚠️ Nenhum produto retornado');
        }
    } catch (erro) {
        console.error('❌ Erro ao carregar produtos:', erro);
        selectProduto.innerHTML = '<option value="">Erro ao carregar produtos</option>';
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
    const produto = document.getElementById('produto').value;
    const quantidade = document.getElementById('quantidade').value;
    
    // Validação
    if (!produtor) {
        mostrarMensagem('❌ Digite o nome do produtor', 'erro');
        return;
    }
    
    if (!produto) {
        mostrarMensagem('❌ Selecione um produto', 'erro');
        return;
    }
    
    if (!quantidade || quantidade <= 0) {
        mostrarMensagem('❌ Digite uma quantidade válida', 'erro');
        return;
    }
    
    const dados = {
        produtor: produtor,
        produto: produto,
        quantidade: quantidade
    };
    
    console.log('📤 Enviando:', dados);
    
    // Desabilita botão durante envio
    const btnSubmit = document.querySelector('.btn-submit');
    btnSubmit.disabled = true;
    btnSubmit.textContent = '⏳ Enviando...';
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados)
        });
        
        // Sucesso
        mostrarMensagem('✅ Pedido registrado com sucesso!', 'sucesso');
        
        // Limpa apenas produto e quantidade (mantém o nome do produtor)
        document.getElementById('produto').value = '';
        document.getElementById('quantidade').value = '';
        
        // Foca no campo produto para próximo registro
        document.getElementById('produto').focus();
        
    } catch (erro) {
        console.error('❌ Erro:', erro);
        mostrarMensagem('❌ Erro ao registrar pedido', 'erro');
    } finally {
        // Reabilita botão
        btnSubmit.disabled = false;
        btnSubmit.textContent = '📦 Registrar Pedido';
    }
}

// Inicializa quando página carregar
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
    document.getElementById('formPedido').addEventListener('submit', enviarPedido);
    
    // Foca no primeiro campo
    document.getElementById('produtor').focus();
});
