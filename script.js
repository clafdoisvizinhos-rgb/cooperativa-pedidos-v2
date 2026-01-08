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
    
    const btnSubmit = document.querySelector('.btn-submit');
    btnSubmit.disabled = true;
    btnSubmit.textContent = '⏳ Enviando...';
    
    try {
        // Envio para a planilha
        for (const pedido of pedidos) {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pedido)
            });
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        mostrarMensagem(`✅ ${pedidos.length} pedido(s) registrado(s) com sucesso!`, 'sucesso');
        
        // --- PROCESSO DO CUPOM (CORRIGIDO) ---
        montarCupomPDF(produtor, data, pedidos);
        const elemento = document.getElementById('pdf-cupom');
        const viaOriginal = elemento.innerHTML;

        // Criação das duas vias
        elemento.innerHTML = viaOriginal + 
            '<div style="border-top: 2px dashed #000; margin: 40px 0; padding-top: 40px;"></div>' + 
            viaOriginal;

        const nomeArquivo = `Pedido_CLAF_${produtor.replace(/\s+/g, '_')}_${data}.pdf`;

        const opcoesPDF = {
            margin: 10,
            filename: nomeArquivo,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, backgroundColor: '#ffffff', useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Delay crucial para evitar cupom vazio
        setTimeout(() => {
            html2pdf().set(opcoesPDF).from(elemento).save().then(() => {
                window.print();
                // Limpeza após impressão
                setTimeout(() => { location.reload(); }, 1500);
            });
        }, 1000);

    } catch (erro) {
        console.error('❌ Erro:', erro);
        mostrarMensagem('❌ Erro ao registrar pedidos', 'erro');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = '📦 Registrar Pedidos';
    }
}

// Mantive esta função para que o código não quebre
function montarCupomPDF(produtor, data, pedidos) {
    const pdfProdutor = document.getElementById('pdfProdutor');
    const pdfData = document.getElementById('pdfData');
    const pdfHora = document.getElementById('pdfHora');
    const itensDiv = document.getElementById('pdfItens');

    if (pdfProdutor) pdfProdutor.innerText = produtor;
    if (pdfData) pdfData.innerText = data;
    if (pdfHora) pdfHora.innerText = new Date().toLocaleString('pt-BR');

    if (itensDiv) {
        itensDiv.innerHTML = '';
        pedidos.forEach(p => {
            const linha = document.createElement('div');
            linha.style.display = 'flex';
            linha.style.justifyContent = 'space-between';
            linha.style.fontSize = '12px';
            linha.style.marginBottom = '2px';
            linha.innerHTML = `<span>${p.produto}</span><span>${p.quantidade}</span>`;
            itensDiv.appendChild(linha);
        });
    }
}

// Atalho de segurança
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') location.reload();
});
