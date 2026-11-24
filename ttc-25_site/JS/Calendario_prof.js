const gradeDias = document.getElementById("gradeDias");
const mesAno = document.getElementById("mesAno");
const listaEventos = document.getElementById("listaEventos");

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

function renderizarCalendario() {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    const diasAnterior = new Date(ano, mes, 0).getDate();
    const hoje = dataLocal(new Date());

    if (mesAno) {
        mesAno.textContent = dataAtual.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    }
    const mesListaEl = document.getElementById("mesLista");
    if (mesListaEl && mesAno) {
        mesListaEl.textContent = mesAno.textContent;
    }
    
    if (!gradeDias) return;
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
        celula.style.cursor = "default"; // Indica visualmente que não é clicável para edição

        const spanNumero = document.createElement("span");
        spanNumero.className = "day-number" + (chaveData === hoje ? " today" : "");
        spanNumero.textContent = numero;
        celula.appendChild(spanNumero);

        eventos.filter(ev => ev.data === chaveData).forEach(ev => {
            const etiqueta = document.createElement("div");
            etiqueta.className = `event-tag ${obterClasseCategoria(ev.categoria)}`;
            etiqueta.textContent = ev.nome_evento;
            
            // Tooltip rico ao passar o mouse sobre o evento no calendário
            const infoTooltip = [
                ev.horario_inicio ? `Horário: ${ev.horario_inicio}${ev.horario_termino ? ' às ' + ev.horario_termino : ''}` : '',
                ev.local ? `Local: ${ev.local}` : '',
                ev.descricao ? `Descrição: ${ev.descricao}` : ''
            ].filter(Boolean).join('\n');
            
            etiqueta.title = infoTooltip ? `${ev.nome_evento}\n${infoTooltip}` : ev.nome_evento;
            celula.appendChild(etiqueta);
        });

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
    const totalMesEl = document.getElementById("totalMes");
    const totalFuturosEl = document.getElementById("totalFuturos");
    
    if (totalMesEl) totalMesEl.textContent = doMes.length;
    if (totalFuturosEl) totalFuturosEl.textContent = eventos.filter(ev => ev.data >= hoje).length;
}

function renderizarLista() {
    if (!listaEventos) return;

    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();

    const doMes = eventos.filter(ev => {
        const d = new Date(`${ev.data}T00:00:00`);
        return d.getFullYear() === ano && d.getMonth() === mes;
    }).sort((a, b) => (a.data + (a.horario_inicio || '')).localeCompare(b.data + (b.horario_inicio || '')));

    listaEventos.innerHTML = "";

    if (doMes.length === 0) {
        listaEventos.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 1rem 0; text-align: center;">Nenhum evento agendado para este mês.</p>';
        return;
    }

    doMes.forEach(ev => {
        const item = document.createElement("div");
        item.className = "event-item";

        const dataBonita = new Date(`${ev.data}T00:00:00`).toLocaleDateString("pt-BR");
        const horarioFormatado = [ev.horario_inicio, ev.horario_termino].filter(Boolean).join(" às ");
        const detalhes = [dataBonita, horarioFormatado, ev.local, `[${ev.categoria}]`, ev.turmas_participantes].filter(Boolean).join(" • ");

        const informacao = document.createElement("div");
        informacao.style.width = "100%";

        const nome = document.createElement("p");
        nome.style.cssText = "font-size: 0.9rem; font-weight: 600; color: #fff;";
        nome.textContent = ev.nome_evento;
        
        const detalhe = document.createElement("p");
        detalhe.style.cssText = "font-size: 0.78rem; color: var(--text-muted); margin-top: 3px;";
        detalhe.textContent = detalhes;
        
        informacao.append(nome, detalhe);

        // Exibe a descrição na lista para o professor ter visão completa sem precisar abrir modal
        if (ev.descricao) {
            const desc = document.createElement("p");
            desc.style.cssText = "font-size: 0.78rem; color: #cbd5e1; margin-top: 6px; font-style: italic;";
            desc.textContent = ev.descricao;
            informacao.appendChild(desc);
        }

        // Apenas a tag de categoria no canto direito (sem botões de Editar/Excluir)
        const badgeCategoria = document.createElement("span");
        badgeCategoria.className = `event-tag ${obterClasseCategoria(ev.categoria)}`;
        badgeCategoria.style.cssText = "white-space: nowrap; margin-left: 12px;";
        badgeCategoria.textContent = ev.categoria;

        item.append(informacao, badgeCategoria);
        listaEventos.appendChild(item);
    });
}

// Controles de navegação entre meses
const btnMesAnterior = document.getElementById("mesAnterior");
if (btnMesAnterior) {
    btnMesAnterior.addEventListener("click", () => {
        dataAtual.setMonth(dataAtual.getMonth() - 1);
        renderizarCalendario();
    });
}

const btnMesProximo = document.getElementById("mesProximo");
if (btnMesProximo) {
    btnMesProximo.addEventListener("click", () => {
        dataAtual.setMonth(dataAtual.getMonth() + 1);
        renderizarCalendario();
    });
}

// Inicialização e carregamento da sessão do professor
document.addEventListener("DOMContentLoaded", () => {
    carregarEventosDoBanco();

    fetch('./API/sessao_atual.php')
        .then(res => res.json())
        .then(dados => {
            if (dados.logado) {
                const elementoNome = document.getElementById('nomeUsuario');
                if (elementoNome) elementoNome.textContent = dados.nome;

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
});