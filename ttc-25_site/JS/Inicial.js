document.addEventListener("DOMContentLoaded", () => {
    carregarEventosGeral();
    carregarSessaoUsuario();
});

function formatarData(dataString) {
    if (!dataString) return '';
    const partes = dataString.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataString;
}

function carregarEventosGeral() {
    fetch('./API/buscar_evento.php')
        .then(response => response.json())
        .then(dados => {
            const container = document.getElementById('lista-eventos-corpo');
            if (!container) return;
            container.innerHTML = '';

            if (!Array.isArray(dados) || dados.length === 0) {
                container.innerHTML = `<div class="sem-eventos">Nenhum evento registado.</div>`;
                return;
            }

            dados.forEach(ev => {
                const dataFormatada = formatarData(ev.data);
                const horarioFormatado = [
                    ev.horario_inicio ? ev.horario_inicio.substring(0, 5) : '',
                    ev.horario_termino ? ev.horario_termino.substring(0, 5) : ''
                ].filter(Boolean).join(' - ');

                const card = document.createElement('div');
                card.className = 'evento-card-modelo';
                card.innerHTML = `
                    <div class="evento-card-header">
                        <div>
                            <h3 class="evento-titulo">${ev.nome_evento}</h3>
                            <span class="badge-categoria">${ev.categoria || 'Geral'}</span>
                        </div>
                        <div class="acoes-btn">
                            <a href="Calendário.html?editar_id=${ev.id}" class="btn-acao btn-editar" title="Editar">
                                <i class="fa-solid fa-pen"></i> Editar
                            </a>
                            <button class="btn-acao btn-excluir" onclick="excluirEvento(${ev.id})" title="Excluir">
                                <i class="fa-solid fa-trash"></i> Excluir
                            </button>
                        </div>
                    </div>

                    <div class="evento-info-grid">
                        <div class="info-bloco">
                            <span class="info-label"><i class="fa-regular fa-calendar"></i> Data</span>
                            <span class="info-valor">${dataFormatada || 'Não informada'}</span>
                        </div>
                        <div class="info-bloco">
                            <span class="info-label"><i class="fa-regular fa-clock"></i> Horário</span>
                            <span class="info-valor">${horarioFormatado || 'Não informado'}</span>
                        </div>
                        <div class="info-bloco">
                            <span class="info-label"><i class="fa-solid fa-location-dot"></i> Local</span>
                            <span class="info-valor">${ev.local || 'Não definido'}</span>
                        </div>
                    </div>

                    <div class="evento-descricao">
                        ${ev.descricao && ev.descricao.trim() !== '' ? ev.descricao : 'Sem descrição informada.'}
                    </div>

                    <!-- SEÇÃO DE COMENTÁRIOS DOS PROFESSORES -->
                    <div class="secao-comentarios" data-evento-id="${ev.id}">
                        <div class="comentarios-titulo">
                            <i class="fa-regular fa-comments"></i> Comentários e Observações dos Professores
                        </div>
                        <div class="lista-comentarios">
                            <span style="font-size: 0.75rem; color: var(--text-muted);">A carregar comentários...</span>
                        </div>
                    </div>
                `;
                container.appendChild(card);
                
                // Carrega os comentários específicos deste evento
                carregarComentariosDoEvento(ev.id, card);
            });
        })
        .catch(erro => {
            console.error("Erro ao buscar eventos:", erro);
            const container = document.getElementById('lista-eventos-corpo');
            if (container) {
                container.innerHTML = `<div class="sem-eventos" style="color: #f87171;">Erro ao comunicar com a API.</div>`;
            }
        });
}

function carregarComentariosDoEvento(idEvento, cardElement) {
    const secao = cardElement 
        ? cardElement.querySelector('.secao-comentarios') 
        : document.querySelector(`.secao-comentarios[data-evento-id="${idEvento}"]`);
        
    if (!secao) return;
    const listaContainer = secao.querySelector('.lista-comentarios');
    if (!listaContainer) return;

    fetch(`./API/buscar_comentarios.php?evento_id=${idEvento}`)
        .then(res => res.json())
        .then(res => {
            listaContainer.innerHTML = '';
            
            if (res.sucesso && Array.isArray(res.comentarios) && res.comentarios.length > 0) {
                res.comentarios.forEach(c => {
                    const item = document.createElement('div');
                    item.className = 'comentario-item';
                    item.style.cssText = "display: flex; flex-direction: column; gap: 8px; padding: 10px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 8px;";

                    // Bloco da resposta da coordenação (se houver)
                    let blocoResposta = '';
                    if (c.resposta_coordenacao && c.resposta_coordenacao.trim() !== '') {
                        blocoResposta = `
                            <div style="margin-left: 35px; padding: 8px 12px; background: rgba(153, 0, 0, 0.15); border-left: 3px solid #990000; border-radius: 4px; font-size: 0.8rem; color: #f8fafc;">
                                <strong style="color: #f87171;"><i class="fa-solid fa-reply"></i> Resposta da Coordenação:</strong> ${c.resposta_coordenacao}
                            </div>
                        `;
                    }

                    item.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                            <div style="display: flex; gap: 10px; flex: 1;">
                                <img src="${c.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}" alt="Avatar" class="comentario-avatar" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                                <div class="comentario-conteudo" style="flex: 1;">
                                    <div class="comentario-cabecalho" style="display: flex; gap: 8px; align-items: center;">
                                        <span class="comentario-autor" style="font-weight: 600; font-size: 0.85rem; color: #fff;">${c.nome_usuario || 'Professor'}</span>
                                        <span class="comentario-data" style="font-size: 0.7rem; color: var(--text-muted);">${c.data_criacao || ''}</span>
                                    </div>
                                    <p class="comentario-texto" style="font-size: 0.85rem; color: #cbd5e1; margin-top: 4px;">${c.texto}</p>
                                </div>
                            </div>
                            <button type="button" 
                                    onclick="excluirComentario(${c.id}, ${idEvento})" 
                                    title="Excluir comentário" 
                                    style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; padding: 5px 8px; cursor: pointer;">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>

                        ${blocoResposta}

                        <!-- Área para responder -->
                        <div style="margin-left: 35px; display: flex; gap: 6px; margin-top: 4px;">
                            <input type="text" id="resp_${c.id}" placeholder="Escrever resposta da coordenação..." value="${c.resposta_coordenacao || ''}" style="flex: 1; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 5px 10px; font-size: 0.8rem; color: #fff;">
                            <button type="button" onclick="salvarResposta(${c.id}, ${idEvento})" style="background: #990000; color: #fff; border: none; border-radius: 6px; padding: 5px 10px; font-size: 0.8rem; cursor: pointer; font-weight: 600;">
                                Responder
                            </button>
                        </div>
                    `;
                    listaContainer.appendChild(item);
                });
            } else {
                listaContainer.innerHTML = `<span style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">Nenhum comentário ou observação registada ainda.</span>`;
            }
        })
        .catch(err => {
            console.error("Erro ao carregar comentários:", err);
        });
}

function salvarResposta(idComentario, idEvento) {
    const inputResp = document.getElementById(`resp_${idComentario}`);
    if (!inputResp) return;

    const respostaTexto = inputResp.value.trim();

    fetch('./API/responder_comentario.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idComentario, resposta: respostaTexto })
    })
    .then(res => res.json())
    .then(data => {
        if (data.sucesso) {
            carregarComentariosDoEvento(idEvento);
        } else {
            alert('Erro ao salvar resposta: ' + (data.mensagem || 'Erro desconhecido'));
        }
    })
    .catch(err => {
        console.error('Erro na requisição:', err);
        alert('Erro na comunicação com o servidor.');
    });
}

function excluirComentario(idComentario, idEvento) {
    if (!confirm("Deseja realmente excluir este comentário?")) return;

    fetch('./API/excluir_comentario.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idComentario })
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            carregarComentariosDoEvento(idEvento);
        } else {
            alert('Erro ao excluir comentário: ' + (data.mensagem || 'Erro desconhecido'));
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
        alert('Erro na comunicação com o servidor.');
    });
}

function excluirEvento(idEvento) {
    if (!confirm("Deseja realmente excluir este evento?")) return;

    fetch('./API/excluir_evento.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idEvento })
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            carregarEventosGeral();
        } else {
            alert('Erro ao excluir: ' + (data.mensagem || 'Erro desconhecido'));
        }
    })
    .catch(error => alert('Erro na comunicação com o servidor: ' + error.message));
}

function carregarSessaoUsuario() {
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
}