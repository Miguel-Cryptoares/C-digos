const gradeDias = document.getElementById("gradeDias");
const mesAno = document.getElementById("mesAno");
const listaEventos = document.getElementById("listaEventos");
const fundoModal = document.getElementById("fundoModal");
const formEvento = document.getElementById("formEvento");

let dataAtual = new Date();
let eventos = [];

function dataLocal(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function obterClasseCategoria(categoria) {
    switch (categoria) {
        case "Ciência": return "tag-ciencia";
        case "Tecnologia": return "tag-tecnologia";
        case "Esportes": return "tag-esportes";
        case "Cultura": return "tag-cultura";
        case "Reunião Pedagógica": return "tag-reuniao-pedagogica";
        default: return "tag-outro";
    }
}

function carregarEventosDoBanco() {
    fetch('./API/buscar_evento.php')
        .then(response => response.text())
        .then(texto => {
            let dados = [];
            if (texto && texto.trim() !== "") {
                try {
                    dados = JSON.parse(texto);
                } catch (e) {
                    console.warn("Aviso: O PHP não retornou um JSON válido:", texto);
                }
            }

            if (Array.isArray(dados)) {
                eventos = dados.map(ev => ({
                    id: String(ev.id),
                    nome_evento: ev.nome_evento,
                    categoria: ev.categoria || "Outro",
                    local: ev.local || "",
                    data: ev.data,
                    horario_inicio: ev.horario_inicio ? ev.horario_inicio.substring(0, 5) : "",
                    horario_termino: ev.horario_termino ? ev.horario_termino.substring(0, 5) : "",
                    publico_alvo: ev.publico_alvo || "",
                    turmas_participantes: ev.turmas_participantes || "",
                    descricao: ev.descricao || ""
                }));
            }
            renderizarCalendario();
        })
        .catch(error => {
            console.warn("Aviso na conexão com o banco. Renderizando interface:", error);
            renderizarCalendario();
        });
}

function salvarEventoNoBanco(novoEvento, id) {
    // Garante que o horário fique sempre no formato HH:MM:SS válido para o MySQL
    const formatarHoraBanco = (hora) => {
        if (!hora) return null;
        return hora.substring(0, 5) + ":00";
    };

    const payload = {
        id: id || null,
        nome_evento: novoEvento.nome_evento,
        categoria: novoEvento.categoria,
        local: novoEvento.local,
        data: novoEvento.data,
        horario_inicio: formatarHoraBanco(novoEvento.horario_inicio),
        horario_termino: formatarHoraBanco(novoEvento.horario_termino),
        publico_alvo: novoEvento.publico_alvo,
        turmas_participantes: novoEvento.turmas_participantes,
        descricao: novoEvento.descricao
    };

    fetch('./API/salvar_evento.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            carregarEventosDoBanco();
            fecharModal();
            dataAtual = new Date(`${novoEvento.data}T00:00:00`);
        } else {
            alert('Erro ao salvar no banco: ' + data.mensagem);
        }
    })
    .catch(error => alert('Erro na comunicação com o servidor: ' + error.message));
}

function excluirEventoDoBanco(idEvento, nomeEvento) {
    if (!confirm(`Deseja excluir o evento "${nomeEvento}"?`)) return;

    fetch('./API/excluir_evento.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idEvento })
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            carregarEventosDoBanco();
        } else {
            alert('Erro ao excluir: ' + data.mensagem);
        }
    })
    .catch(error => alert('Erro ao se comunicar com o banco.'));
}

function abrirModal(data = dataLocal(new Date()), evento = null) {
    formEvento.reset();
    document.getElementById("idevento").value = evento ? evento.id : "";
    document.getElementById("nome_evento").value = evento ? evento.nome_evento : "";
    document.getElementById("categoria").value = evento ? evento.categoria : "Cultura";
    document.getElementById("local").value = evento ? evento.local : "";
    document.getElementById("data").value = evento ? evento.data : data;
    document.getElementById("publico_alvo").value = evento ? evento.publico_alvo : "";
    document.getElementById("horario_inicio").value = (evento && evento.horario_inicio) ? evento.horario_inicio.substring(0, 5) : "";
    document.getElementById("horario_termino").value = (evento && evento.horario_termino) ? evento.horario_termino.substring(0, 5) : "";
    document.getElementById("turmas_participantes").value = evento ? evento.turmas_participantes : "";
    document.getElementById("descricao").value = evento ? evento.descricao : "";
    document.getElementById("tituloModal").textContent = evento ? "Editar evento" : "Cadastrar evento";
    
    fundoModal.classList.add("active");
    document.getElementById("nome_evento").focus();
}

function fecharModal() {
    fundoModal.classList.remove("active");
}

function renderizarCalendario() {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    const diasAnterior = new Date(ano, mes, 0).getDate();
    const hoje = dataLocal(new Date());

    mesAno.textContent = dataAtual.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    const mesListaEl = document.getElementById("mesLista");
    if (mesListaEl) mesListaEl.textContent = mesAno.textContent;
    gradeDias.innerHTML = "";

    for (let i = 0; i < 42; i++) {
        let numero;
        let dataCelula;
        let ehOutroMes = false;

        if (i < primeiroDia) {
            numero = diasAnterior - primeiroDia + i + 1;
            dataCelula = new Date(ano, mes - 1, numero);
            ehOutroMes = true;
        } else if (i >= primeiroDia + ultimoDia) {
            numero = i - primeiroDia - ultimoDia + 1;
            dataCelula = new Date(ano, mes + 1, numero);
            ehOutroMes = true;
        } else {
            numero = i - primeiroDia + 1;
            dataCelula = new Date(ano, mes, numero);
        }

        const chaveData = dataLocal(dataCelula);
        const celula = document.createElement("div");
        celula.className = "day-cell" + (ehOutroMes ? " out-month" : "");

        const spanNumero = document.createElement("span");
        spanNumero.className = "day-number" + (chaveData === hoje ? " today" : "");
        spanNumero.textContent = numero;
        celula.appendChild(spanNumero);

        eventos.filter(ev => ev.data === chaveData).forEach(ev => {
            const etiqueta = document.createElement("div");
            etiqueta.className = `event-tag ${obterClasseCategoria(ev.categoria)}`;
            etiqueta.textContent = ev.nome_evento;
            etiqueta.title = ev.horario_inicio ? `${ev.horario_inicio} - ${ev.nome_evento}` : ev.nome_evento;
            
            // Clicar diretamente no evento abre o modal preenchido para edição
            etiqueta.onclick = (e) => {
                e.stopPropagation();
                abrirModal(ev.data, ev);
            };

            celula.appendChild(etiqueta);
        });
        
        celula.onclick = (e) => {
            e.stopPropagation();
            abrirModal(chaveData);
        };

        gradeDias.appendChild(celula);
    }

    atualizarResumo();
    renderizarLista();
}

function atualizarResumo() {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();

    const doMes = eventos.filter(ev => {
        const d = new Date(`${ev.data}T00:00:00`);
        return d.getFullYear() === ano && d.getMonth() === mes;
    });

    const hoje = dataLocal(new Date());
    document.getElementById("totalMes").textContent = doMes.length;
    document.getElementById("totalFuturos").textContent = eventos.filter(ev => ev.data >= hoje).length;
}

function renderizarLista() {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();

    const doMes = eventos.filter(ev => {
        const d = new Date(`${ev.data}T00:00:00`);
        return d.getFullYear() === ano && d.getMonth() === mes;
    }).sort((a, b) => (a.data + (a.horario_inicio || '')).localeCompare(b.data + (b.horario_inicio || '')));

    listaEventos.innerHTML = "";

    if (doMes.length === 0) {
        listaEventos.innerHTML = '<p style="color: var(--text-muted); font-size: 0.75rem; padding: 1rem 0; text-align: center;">Nenhum evento cadastrado neste mês.</p>';
        return;
    }

    doMes.forEach(ev => {
        const item = document.createElement("div");
        item.className = "event-item";

        const dataBonita = new Date(`${ev.data}T00:00:00`).toLocaleDateString("pt-BR");
        const horarioFormatado = [ev.horario_inicio, ev.horario_termino].filter(Boolean).join(" às ");
        const detalhes = [dataBonita, horarioFormatado, ev.local, `[${ev.categoria}]`, ev.turmas_participantes].filter(Boolean).join(" • ");

        const informacao = document.createElement("div");
        const nome = document.createElement("p");
        nome.style.cssText = "font-size: 0.875rem; font-weight: 600; color: #fff;";
        nome.textContent = ev.nome_evento;
        
        const detalhe = document.createElement("p");
        detalhe.style.cssText = "font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;";
        detalhe.textContent = detalhes;
        
        informacao.append(nome, detalhe);

        const acoes = document.createElement("div");
        acoes.style.cssText = "display: flex; align-items: center; gap: 0.5rem;";

        const editar = document.createElement("button");
        editar.className = "btn-action btn-edit";
        editar.textContent = "Editar";
        editar.addEventListener("click", () => abrirModal(ev.data, ev));

        const excluir = document.createElement("button");
        excluir.className = "btn-action btn-delete";
        excluir.textContent = "Excluir";
        excluir.addEventListener("click", () => excluirEventoDoBanco(ev.id, ev.nome_evento));

        acoes.append(editar, excluir);
        item.append(informacao, acoes);
        listaEventos.appendChild(item);
    });
}

formEvento.addEventListener("submit", function(event) {
    event.preventDefault();
    const id = document.getElementById("idevento").value;

    const dadosFormulario = {
        nome_evento: document.getElementById("nome_evento").value.trim(),
        categoria: document.getElementById("categoria").value,
        local: document.getElementById("local").value.trim(),
        data: document.getElementById("data").value,
        horario_inicio: document.getElementById("horario_inicio").value,
        horario_termino: document.getElementById("horario_termino").value,
        publico_alvo: document.getElementById("publico_alvo").value.trim(),
        turmas_participantes: document.getElementById("turmas_participantes").value.trim(),
        descricao: document.getElementById("descricao").value.trim()
    };

    if (!dadosFormulario.nome_evento || !dadosFormulario.data) return;

    salvarEventoNoBanco(dadosFormulario, id);
});

document.getElementById("novoEvento").addEventListener("click", () => abrirModal());
document.getElementById("cancelar").addEventListener("click", fecharModal);
document.getElementById("cancelarTopo").addEventListener("click", fecharModal);

document.getElementById("mesAnterior").addEventListener("click", () => {
    dataAtual.setMonth(dataAtual.getMonth() - 1);
    renderizarCalendario();
});

document.getElementById("mesProximo").addEventListener("click", () => {
    dataAtual.setMonth(dataAtual.getMonth() + 1);
    renderizarCalendario();
});

fundoModal.addEventListener("click", event => {
    if (event.target === fundoModal) fecharModal();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") fecharModal();
});

// Inicialização e carregamento unificado dos dados da sessão e eventos
document.addEventListener("DOMContentLoaded", () => {
    carregarEventosDoBanco();

    fetch('./API/sessao_atual.php')
        .then(res => res.json())
        .then(dados => {
            if (dados.logado) {
                const elementoTopo = document.getElementById('nomeUsuario');
                if (elementoTopo) elementoTopo.textContent = dados.nome;

                const elementoBadge = document.getElementById('nomeUsuarioBadge');
                if (elementoBadge) elementoBadge.textContent = dados.nome;

                if (dados.foto) {
                    const avatares = document.querySelectorAll('.avatar, #avatarTopo, .user-actions img');
                    avatares.forEach(img => {
                        img.src = dados.foto;
                    });
                }
            } else {
                window.location.href = 'index.html';
            }
        })
        .catch(err => console.error("Erro ao carregar a sessão:", err));

    // Tratar parâmetro de edição vindo da URL
    const urlParams = new URLSearchParams(window.location.search);
    const idParaEditar = urlParams.get('editar_id');

    if (idParaEditar) {
        fetch(`./API/buscar_unico.php?id=${idParaEditar}`)
            .then(res => res.json())
            .then(resposta => {
                if (resposta.sucesso && resposta.evento) {
                    abrirModal(resposta.evento.data, resposta.evento);
                } else {
                    alert("Erro ao carregar dados para edição.");
                }
            })
            .catch(err => console.error("Erro na busca do evento:", err));
    }
});