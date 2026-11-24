async function realizarLogin(event) {
    event.preventDefault();

    const mensagem = document.getElementById("mensagem");
    const cpfInput = document.getElementById("cpf").value.trim();
    const senhaInput = document.getElementById("senha").value.trim();

    // Remove classes ocultas ou anteriores da div de mensagem
    mensagem.classList.remove("hidden");

    // Validação local rápida se os campos estiverem vazios
    if (!cpfInput || !senhaInput) {
        mensagem.className = "text-sm font-medium p-4.5 rounded-xl text-center transition-all duration-300 mt-3 flex items-center justify-center gap-2 border bg-redBrand-950/60 border-redBrand-800/60 text-redBrand-400";
        mensagem.innerHTML = `<span>Preencha todos os campos!</span>`;
        return false;
    }

    try {
        // Usar caminho relativo para evitar problemas de IP fixo
        const resposta = await fetch("./API/login.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cpf: cpfInput,
                senha: senhaInput
            })
        });

        const resultado = await resposta.json();

        if (resultado.sucesso) {
            mensagem.className = "text-sm font-medium p-4.5 rounded-xl text-center transition-all duration-300 mt-3 flex items-center justify-center gap-2 border bg-emerald-950/60 border-emerald-800/60 text-emerald-400";
            mensagem.innerHTML = `<span>${resultado.mensagem} Redirecionando...</span>`;
            
            setTimeout(() => {
                window.location.href = resultado.redirecionar || 'Professor.html';
            }, 800);
        } else {
            mensagem.className = "text-sm font-medium p-4.5 rounded-xl text-center transition-all duration-300 mt-3 flex items-center justify-center gap-2 border bg-redBrand-950/60 border-redBrand-800/60 text-redBrand-400";
            mensagem.innerHTML = `<span>${resultado.mensagem || 'CPF ou senha incorretos.'}</span>`;
        }

    } catch (erro) {
        mensagem.className = "text-sm font-medium p-4.5 rounded-xl text-center transition-all duration-300 mt-3 flex items-center justify-center gap-2 border bg-redBrand-950/60 border-redBrand-800/60 text-redBrand-400";
        mensagem.innerHTML = `<span>Erro de conexão com o servidor.</span>`;
    }

    return false;
}