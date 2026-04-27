// ========================================
// VARIÁVEIS GLOBAIS
// ========================================

let produtoEmEdicao = null;

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

// Mostra uma mensagem modal
function mostrarMensagem(mensagem, tipo = 'info') {
    const modal = document.getElementById('modalMessage');
    const modalText = document.getElementById('modalText');
    
    modalText.textContent = mensagem;
    modal.style.display = 'flex';
    
    // Define a cor baseado no tipo
    if (tipo === 'sucesso') {
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    } else if (tipo === 'erro') {
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    }
}

// Fecha o modal de mensagens
function fecharModal() {
    document.getElementById('modalMessage').style.display = 'none';
}

// Limpa o formulário
function limparFormulario() {
    document.getElementById('clientForm').reset();
    produtoEmEdicao = null;
    document.querySelector('.form-section h2').textContent = 'Adicionar ou Editar produto';
}

// ========================================
// OPERAÇÕES COM A API
// ========================================

// Busca todos os produtos
async function carregarprodutos() {
    const loadingMessage = document.getElementById('loadingMessage');
    const emptyMessage = document.getElementById('emptyMessage');
    const clientsList = document.getElementById('clientsList');
    
    loadingMessage.style.display = 'block';
    clientsList.innerHTML = '';
    
    try {
        const resposta = await fetch('/produtos');
        
        if (!resposta.ok) {
            throw new Error('Erro ao buscar produtos');
        }
        
        const produtos = await resposta.json();
        loadingMessage.style.display = 'none';
        
        if (produtos.length === 0) {
            emptyMessage.style.display = 'block';
            clientsList.innerHTML = '';
        } else {
            emptyMessage.style.display = 'none';
            exibirTabela(produtos);
        }
    } catch (erro) {
        loadingMessage.style.display = 'none';
        emptyMessage.style.display = 'block';
        console.error('Erro:', erro);
        mostrarMensagem('Erro ao carregar os produtos. Tente novamente.', 'erro');
    }
}

// Cria um novo produto
async function criarproduto(dados) {
    try {
        const resposta = await fetch('/produtos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.error || 'Erro ao criar produto');
        }
        
        const novoproduto = await resposta.json();
        mostrarMensagem('produto cadastrado com sucesso!', 'sucesso');
        limparFormulario();
        carregarprodutos();
        
    } catch (erro) {
        console.error('Erro:', erro);
        mostrarMensagem('Erro: ' + erro.message, 'erro');
    }
}

// Atualiza um produto
async function atualizarproduto(id, dados) {
    try {
        const resposta = await fetch(`/produtos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.error || 'Erro ao atualizar produto');
        }
        
        const produtoAtualizado = await resposta.json();
        mostrarMensagem('produto atualizado com sucesso!', 'sucesso');
        limparFormulario();
        carregarprodutos();
        
    } catch (erro) {
        console.error('Erro:', erro);
        mostrarMensagem('Erro: ' + erro.message, 'erro');
    }
}

// Deleta um produto
async function deletarproduto(id) {
    if (!confirm('Tem certeza que deseja deletar este produto?')) {
        return;
    }
    
    try {
        const resposta = await fetch(`/produtos/${id}`, {
            method: 'DELETE'
        });
        
        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.error || 'Erro ao deletar produto');
        }
        
        mostrarMensagem('produto removido com sucesso!', 'sucesso');
        carregarprodutos();
        
    } catch (erro) {
        console.error('Erro:', erro);
        mostrarMensagem('Erro: ' + erro.message, 'erro');
    }
}

// ========================================
// EXIBIÇÃO DE DADOS
// ========================================

// Exibe a tabela de produtos
function exibirTabela(produtos) {
    const clientsList = document.getElementById('clientsList');
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>preco</th>
                    <th>estoque</th>
                    <th>categoria</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    produtos.forEach(produto => {
        html += `
            <tr>
                <td>#${produto.id}</td>
                <td>${produto.nome}</td>
                <td>${produto.preco}</td>
                <td>${produto.estoque}</td>
                <td>${produto.categoria}</td>
                <td class="">
                    <button class="btn btn-edit" onclick="editarproduto(${produto.id}, '${produto.nome}', '${produto.preco}', '${produto.estoque}', '${produto.categoria}')">✏️ Editar</button>
                    <button class="btn btn-danger" onclick="deletarproduto(${produto.id})">🗑️ Deletar</button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    clientsList.innerHTML = html;
}

// Carrega os dados do produto no formulário para edição
function editarproduto(id, nome, preco, estoque, categoria) {
    produtoEmEdicao = id;
    
    document.getElementById('nome').value = nome;
    document.getElementById('preco').value = preco;
    document.getElementById('estoque').value = estoque;
    document.getElementById('categoria').value = categoria;
    
    document.querySelector('.form-section h2').textContent = `Editando produto #${id}`;
    
    // Scroll até o formulário
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// BUSCA E FILTRO
// ========================================

// Busca produtos no backend
async function buscarprodutos(tipo, valor) {
    const loadingMessage = document.getElementById('loadingMessage');
    const emptyMessage = document.getElementById('emptyMessage');
    const clientsList = document.getElementById('clientsList');
   
    loadingMessage.style.display = 'block';
    clientsList.innerHTML = '';
   
    try {
        let url = '';

        if (tipo === 'nome') {
            url = `/produtos/categoria/${encodeURIComponent(valor)}`;
        } else if (tipo === 'id') {
            url = `/produtos/${valor}`;
        }

        const resposta = await fetch(url);
       
        if (!resposta.ok) {
            throw new Error('Erro ao buscar produtos');
        }
       
        let produtos = await resposta.json();

        if (!Array.isArray(produtos)) {
            produtos = produtos ? [produtos] : [];
        }

        loadingMessage.style.display = 'none';
       
        if (produtos.length === 0) {
            emptyMessage.style.display = 'block';
            clientsList.innerHTML = '';
        } else {
            emptyMessage.style.display = 'none';
            exibirTabela(produtos);
        }
    } catch (erro) {
        loadingMessage.style.display = 'none';
        emptyMessage.style.display = 'block';
        console.error('Erro:', erro);
        mostrarMensagem('Erro ao buscar os produtos. Tente novamente.', 'erro');
    }
}

// Filtra produtos pela busca (agora busca no backend)
function filtrarprodutos() {
    const searchInput = document.getElementById('searchInput');
    const searchType = document.getElementById('searchType');
    const valor = searchInput.value.trim();
    
    if (valor === '') {
        // Se vazio, carrega todos
        carregarprodutos();
    } else {
        // Busca no backend
        buscarprodutos(searchType.value, valor);
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Carrega os produtos ao abrir a página
    carregarprodutos();
    
    // Formulário de envio
    document.getElementById('clientForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value.trim();
        const preco = document.getElementById('preco').value.trim();
        const estoque = document.getElementById('estoque').value.trim();
        const categoria = document.getElementById('categoria').value.trim();
        
        // Validação básica
        if (!nome || !preco || !estoque || !categoria) {
            mostrarMensagem('Por favor, preencha todos os campos!', 'erro');
            return;
        }
        
        const dados = { nome, preco, estoque, categoria };
        
        if (produtoEmEdicao) {
            atualizarproduto(produtoEmEdicao, dados);
        } else {
            criarproduto(dados);
        }
    });
    
    // Botão Limpar Formulário
    document.getElementById('btnLimpar').addEventListener('click', limparFormulario);
    
    // Botão Recarregar Lista
    document.getElementById('btnRecarregar').addEventListener('click', carregarprodutos);
    
    // Botão Buscar
    document.getElementById('btnBuscar').addEventListener('click', filtrarprodutos);
    
    // Busca em tempo real (opcional, pode ser removido se quiser apenas botão)
    document.getElementById('searchInput').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            filtrarprodutos();
        }
    });
    
    // Fechar modal ao clicar fora
    document.getElementById('modalMessage').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModal();
        }
    });
});
