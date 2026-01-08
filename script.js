// Função para enviar o formulário
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nome = nomeInput.value.trim();
    
    if (!nome) {
        mostrarMensagem('Por favor, digite o nome do produtor!', 'erro');
        return;
    }
    
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
    
    try {
        // Cria URL com parâmetros
        const params = new URLSearchParams({
            action: 'save',
            nome: nome,
            dados: JSON.stringify(produtos)
        });
        
        const response = await fetch(`${API_URL}?${params.toString()}`);
        const data = await response.json();
        
        if (data.status === 'success') {
            mostrarMensagem('✅ ' + data.message, 'sucesso');
            form.reset();
            inputs.forEach(input => input.value = '');
        } else {
            mostrarMensagem('❌ Erro: ' + data.message, 'erro');
        }
    } catch (error) {
        mostrarMensagem('❌ Erro ao enviar dados: ' + error.message, 'erro');
    }
});
