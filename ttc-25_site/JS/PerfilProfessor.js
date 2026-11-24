document.addEventListener("DOMContentLoaded", () => {
    const inputNome = document.getElementById("nome");
    const inputFoto = document.getElementById("inputFoto");
    const previewFoto = document.getElementById("previewFoto");
    const avatarTopo = document.getElementById("avatarTopo");
    const nomeUsuarioTopo = document.getElementById("nomeUsuario");
    const formPerfil = document.getElementById("formPerfil");

    // 1. Carregar os dados do professor logado na sessão atual
    fetch('./API/sessao_atual.php?t=' + new Date().getTime())
        .then(res => res.json())
        .then(dados => {
            if (dados.logado) {
                // Atualiza o nome no cabeçalho (substitui "Professor(a)")
                if (nomeUsuarioTopo && dados.nome) {
                    nomeUsuarioTopo.textContent = dados.nome;
                }

                // Preenche o campo "Nome Completo" do formulário
                if (inputNome && dados.nome) {
                    inputNome.value = dados.nome;
                }

                // Atualiza a foto no cabeçalho e na pré-visualização
                if (dados.foto) {
                    if (previewFoto) previewFoto.src = dados.foto;
                    if (avatarTopo) avatarTopo.src = dados.foto;
                }
            } else {
                window.location.href = 'index.html';
            }
        })
        .catch(err => console.error("Erro ao carregar dados da sessão:", err));

    // 2. Pré-visualizar a nova foto selecionada antes de salvar
    if (inputFoto && previewFoto) {
        inputFoto.addEventListener("change", (e) => {
            const arquivo = e.target.files[0];
            if (arquivo) {
                const leitor = new FileReader();
                leitor.onload = (evento) => {
                    previewFoto.src = evento.target.result;
                };
                leitor.readAsDataURL(arquivo);
            }
        });
    }

    // 3. Enviar as alterações para atualizar o perfil do professor
    if (formPerfil) {
        formPerfil.addEventListener("submit", (e) => {
            e.preventDefault();

            const formData = new FormData(formPerfil);

            fetch('./API/atualizar_perfil_prof.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(resposta => {
                if (resposta.sucesso) {
                    alert("Perfil atualizado com sucesso!");
                    window.location.reload();
                } else {
                    alert("Erro ao atualizar: " + (resposta.mensagem || "Tente novamente."));
                }
            })
            .catch(err => {
                console.error("Erro na requisição:", err);
                alert("Erro de comunicação com o servidor.");
            });
        });
    }
});