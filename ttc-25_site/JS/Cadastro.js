async function cadastrar(event) {
    event.preventDefault();
    
    const nome = document.getElementById("nome").value;
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;
    const mensagem = document.getElementById("mensagem");

    if (senha !== confirmarSenha) {
        mensagem.style.color = "red";
        mensagem.textContent = "As senhas não coincidem!";
        return false;
    }

    const form = document.getElementById("formCadastro");
    const formData = new FormData(form);

    try {
        const resposta = await fetch("http://10.0.11.225/API/Cadastrar.php", {
            method: "POST",
            body: formData
        });

        const resultado = await resposta.json();
        
        if (resultado.sucesso) {
            mensagem.style.color = "green";
            mensagem.textContent = resultado.mensagem;
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        } else {
            mensagem.style.color = "red";
            mensagem.textContent = resultado.mensagem;
        }

    } catch (erro) {
        mensagem.style.color = "red";
        mensagem.textContent = "Erro de conexão ou no formato do JSON.";
    }

    return false;
}