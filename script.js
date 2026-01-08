const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwgMp4mUmzexojmFqMHExfL72ykfxFQuXN-W5rKxRJY6D8vbhUQTahVKSH_3WVZgIkh/exec';

// Define data de hoje como padrão
document.addEventListener('DOMContentLoaded', () => {
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('data').value = hoje;
    carregarProdutos();
    document.getElementById('formPedido').addEventListener('submit', enviarPedidos);
});

// Carrega produtos e cria lista com checkboxes
async function carregarProdutos() {
    const listaProdutos = document.getElementById('listaProdutos');
    
    try {
        console.log('🔄 Carregando produtos...');
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();
        
        if (data.produtos && data.produtos.length > 0) {
            listaProdutos.innerHTML = '';
            
            data.produtos.forEach((produto, index) => {
                const div = document.createElement('div');
                div.className = 'produto-item';
                div.innerHTML = `
                    <div class="produto-checkbox">
                        <input type="checkbox" id="check_${index}" onchange="toggleQuantidade(${index})">
                        <label for="check_${index}">${produto}</label>
                    </div>
                    <input type="number" 
                           id="qtd_${index}" 
                           min="0.1" 
                           step="0.1" 
                           placeholder="0" 
                           disabled
                           data-produto="${produto}">
                `;
                listaProdutos.appendChild(div);
            });
            
            console.log('✅ Produtos carregados:', data.produtos.length);
        } else {
            listaProdutos.innerHTML = '<p class="carregando">Nenhum produto encontrado</p>';
        }
    } catch (erro) {
        console.error('❌ Erro ao carregar produtos:', erro);
        listaProdutos.innerHTML = '<p class="carregando">Erro ao carregar produtos</p>';
    }
}

// Habilita/desabilita campo de quantidade
function toggleQuantidade(index) {
    const checkbox = document.getElementById(`check_${index}`);
    const quantidade = document.getElementById(`qtd_${index}`);
    
    quantidade.disabled = !checkbox.checked;
    
    if (checkbox.checked) {
        quantidade.focus();
    } else {
        quantidade.value = '';
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

// Envia todos os pedidos selecionados
async function enviarPedidos(e) {
    e.preventDefault();
    
    const produtor = document.getElementById('produtor').value.trim();
    const data = document.getElementById('data').value;
    
    if (!produtor) {
        mostrarMensagem('❌ Digite o nome do produtor', 'erro');
        return;
    }
    
    // Coleta produtos marcados
    const pedidos = [];
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
        const index = checkbox.id.split('_')[1];
        const qtdInput = document.getElementById(`qtd_${index}`);
        const quantidade = parseFloat(qtdInput.value);
        
        if (quantidade > 0) {
            pedidos.push({
                produtor: produtor,
                produto: qtdInput.dataset.produto,
                quantidade: quantidade
            });
        }
    });
    
    if (pedidos.length === 0) {
        mostrarMensagem('❌ Selecione pelo menos um produto e informe a quantidade', 'erro');
        return;
    }
    
    console.log('📤 Enviando pedidos:', pedidos);
    
    const btnSubmit = document.querySelector('.btn-submit');
    btnSubmit.disabled = true;
    btnSubmit.textContent = '⏳ Enviando...';
    
    try {
        // Envia cada pedido
        for (const pedido of pedidos) {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pedido)
            });
            
            // Pequeno delay entre requisições
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        mostrarMensagem(`✅ ${pedidos.length} pedido(s) registrado(s) com sucesso!`, 'sucesso');
        
        // Limpa formulário
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.value = '';
            input.disabled = true;
        });
        
    } catch (erro) {
        console.error('❌ Erro:', erro);
        mostrarMensagem('❌ Erro ao registrar pedidos', 'erro');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = '📦 Registrar Pedidos';
    }
}
