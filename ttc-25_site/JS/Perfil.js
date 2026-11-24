document.addEventListener("DOMContentLoaded", () => {
    carregarDadosPerfil();

    // Pré-visualização instantânea da foto ao selecionar ficheiro
    const inputFoto = document.getElementById('inputFoto');
    const previewFoto = document.getElementById('previewFoto');

    if (inputFoto) {
        inputFoto.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    previewFoto.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Enviar formulário
    const formPerfil = document.getElementById('formPerfil');
    if (formPerfil) {
        formPerfil.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(formPerfil);

            fetch('./API/atualizar_perfil.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(resposta => {
                if (resposta.sucesso) {
                    alert("Perfil atualizado com sucesso!");
                    window.location.reload();
                } else {
                    alert("Erro ao atualizar perfil: " + (resposta.mensagem || 'Falha no servidor.'));
                }
            })
            .catch(err => console.error("Erro na atualização:", err));
        });
    }
});

function carregarDadosPerfil() {
    fetch('./API/sessao_atual.php?t=' + new Date().getTime(), { cache: 'no-store' })
        .then(res => res.json())
        .then(dados => {
            if (dados.logado) {
                // Atualizar nomes
                const elementoNome = document.getElementById('nomeUsuario');
                if (elementoNome) elementoNome.textContent = dados.nome;

                const elementoBadge = document.getElementById('nomeUsuarioBadge');
                if (elementoBadge) elementoBadge.textContent = dados.nome;

                const inputNome = document.getElementById('nome');
                if (inputNome) inputNome.value = dados.nome;

                // Atualizar avatares
                if (dados.foto) {
                    const previewFoto = document.getElementById('previewFoto');
                    if (previewFoto) previewFoto.src = dados.foto;

                    const avatares = document.querySelectorAll('.avatar, #avatarTopo, .user-actions img');
                    avatares.forEach(img => {
                        img.src = dados.foto;
                    });
                }
            } else {
                window.location.replace('index.html');
            }
        })
        .catch(err => console.error("Erro ao carregar perfil:", err));
}

// Proteção rigorosa contra cache apenas para o botão "Voltar" real
window.addEventListener('pageshow', function (event) {
    // Verifica se a página foi restaurada do cache (histórico back/forward)
    // Usamos event.persisted ou checamos se o tipo de navegação foi back_forward
    const navEntries = performance.getEntriesByType("navigation");
    const isBackForward = navEntries.length > 0 && navEntries[0].type === "back_forward";

    if (event.persisted || isBackForward) {
        fetch('./API/sessao_atual.php?t=' + new Date().getTime(), {
            cache: 'no-store'
        })
        .then(res => res.json())
        .then(dados => {
            if (!dados.logado) {
                alert("A sua sessão expirou!");
                window.location.replace('index.html');
            }
        })
        .catch(() => {
            alert("A sua sessão expirou!");
            window.location.replace('index.html');
        });
    }
});

// Verificação extra de segurança logo ao carregar a página
fetch('./API/sessao_atual.php?t=' + new Date().getTime(), { cache: 'no-store' })
    .then(res => res.json())
    .then(dados => {
        if (!dados.logado) {
            window.location.replace('index.html');
        }
    });

    // ==========================================
// Alerta de sessão expirada ao clicar em "Voltar"
// ==========================================
window.addEventListener('pageshow', function (event) {
    // Verifica se a página veio do cache (botão voltar/avançar) ou se a sessão já não existe
    fetch('./API/sessao_atual.php?t=' + new Date().getTime(), {
        cache: 'no-store'
    })
    .then(res => res.json())
    .then(dados => {
        if (!dados.logado) {
            alert("A sua sessão expirou!");
            window.location.replace('index.html');
        }
    })
    .catch(() => {
        alert("A sua sessão expirou!");
        window.location.replace('index.html');
    });
});