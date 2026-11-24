let listaGlobalEventos = []; // Guarda os eventos vindos do banco para o filtro

document.addEventListener("DOMContentLoaded", () => {
    carregarDadosECriarPainel();
    configurarBarraBusca();
});

// Valida a sessão e busca os eventos do banco
function carregarDadosECriarPainel() {
    fetch('./API/sessao_atual.php?t=' + new Date().getTime(), { cache: 'no-store' })
        .then(res => res.json())
        .then(dadosSessao => {
            if (dadosSessao.logado) {
                const elementoNome = document.getElementById('nomeUsuario');
                if (elementoNome) elementoNome.textContent = dadosSessao.nome;

                const avatarTopo = document.getElementById('avatarTopo');
                if (avatarTopo && dadosSessao.foto) {
                    avatarTopo.src = dadosSessao.foto;
                }

                buscarEventosDoBanco(dadosSessao);
            } else {
                window.location.replace('index.html');
            }
        })
        .catch(() => {
            window.location.replace('index.html');
        });
}

function buscarEventosDoBanco(usuarioAtual) {
    fetch('./API/listar_evento_prof.php?t=' + new Date().getTime(), { cache: 'no-store' })
        .then(res => res.json())
        .then(eventos => {
            if (!Array.isArray(eventos)) {
                eventos = [];
            }
            listaGlobalEventos = eventos;
            renderizarEventos(usuarioAtual, listaGlobalEventos);
        })
        .catch(err => {
            console.error("Erro ao carregar eventos:", err);
            const container = document.getElementById('listaEventos');
            if (container) {
                container.innerHTML = `<p style="color: #ef4444; text-align: center;">Erro ao carregar os eventos do banco de dados.</p>`;
            }
        });
}

// Configura o evento de digitação na barra de busca
function configurarBarraBusca() {
    const inputBusca = document.getElementById('buscaEventos') || document.getElementById('inputBusca');
    
    if (inputBusca) {
        inputBusca.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase().trim();
            
            const eventosFiltrados = listaGlobalEventos.filter(evento => {
                const titulo = (evento.titulo || evento.nome_evento || '').toLowerCase();
                const local = (evento.local || '').toLowerCase();
                const descricao = (evento.descricao || '').toLowerCase();
                const categoria = (evento.categoria || '').toLowerCase();

                return titulo.includes(termo) || local.includes(termo) || descricao.includes(termo) || categoria.includes(termo);
            });

            fetch('./API/sessao_atual.php?t=' + new Date().getTime())
                .then(res => res.json())
                .then(dadosSessao => {
                    renderizarEventos(dadosSessao, eventosFiltrados);
                });
        });
    }
}

// Renderiza os blocos de eventos dinamicamente na página
function renderizarEventos(usuarioAtual, eventos) {
    const container = document.getElementById('listaEventos');
    if (!container) return;
    
    container.innerHTML = '';

    if (!eventos || eventos.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Nenhum evento encontrado.</p>`;
        return;
    }

    eventos.forEach(evento => {
        const eventoId = evento.id;
        let comentariosHTML = '';

        if (evento.comentarios && Array.isArray(evento.comentarios) && evento.comentarios.length > 0) {
            evento.comentarios.forEach(c => {
                // Trata a foto do comentário e evita cache antigo
                const fotoComentario = c.foto ? (c.foto.includes('?') ? c.foto : c.foto + '?t=' + new Date().getTime()) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';

                comentariosHTML += `
                    <div style="display: flex; gap: 0.75rem; margin-top: 1rem; align-items: flex-start;">
                        <img src="${fotoComentario}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
                        <div style="flex: 1; background: rgba(255,255,255,0.03); padding: 0.75rem 1rem; border-radius: 0.5rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                <span style="font-size: 0.875rem; font-weight: 600; color: #f8fafc;">${c.nome_usuario || c.nome || 'Professor'}</span>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">${c.data_criacao || c.tempo || ''}</span>
                            </div>
                            <p style="font-size: 0.875rem; color: #cbd5e1; line-height: 1.4;">${c.texto || c.comentario}</p>
                        </div>
                    </div>
                `;
            });
        } else {
            comentariosHTML = `<p style="font-size: 0.75rem; color: var(--text-muted); font-style: italic; margin-top: 0.5rem;">Nenhum comentário ainda.</p>`;
        }

        const card = document.createElement('div');
        card.className = 'card-panel';
        card.style.cssText = "background: #1e293b; border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem;";
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <div>
                    <h2 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.375rem;">${evento.titulo || evento.nome_evento}</h2>
                    <span style="font-size: 0.75rem; background: rgba(37, 99, 235, 0.15); color: #60a5fa; padding: 0.25rem 0.625rem; border-radius: 1rem; font-weight: 600;">${evento.categoria || 'Agendado'}</span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.25rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 0.75rem;">
                <div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;"><i class="fa-regular fa-calendar"></i> Data</div>
                    <div style="font-size: 0.875rem; color: #f8fafc; font-weight: 600; margin-top: 0.125rem;">${evento.data || 'Não informada'}</div>
                </div>
                <div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;"><i class="fa-regular fa-clock"></i> Horário</div>
                    <div style="font-size: 0.875rem; color: #f8fafc; font-weight: 600; margin-top: 0.125rem;">${evento.horario || [evento.horario_inicio, evento.horario_termino].filter(Boolean).join(' - ') || 'Não informado'}</div>
                </div>
                <div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;"><i class="fa-solid fa-location-dot"></i> Local</div>
                    <div style="font-size: 0.875rem; color: #f8fafc; font-weight: 600; margin-top: 0.125rem;">${evento.local || 'Não definido'}</div>
                </div>
            </div>

            <p style="color: #cbd5e1; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem;">${evento.descricao || 'Sem descrição informada.'}</p>

            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin-bottom: 1.25rem;">

            <div>
                <h3 style="font-size: 0.95rem; font-weight: 600; color: #f8fafc; margin-bottom: 1rem;">
                    <i class="fa-regular fa-comments"></i> Comentários e Observações
                </h3>

                <div style="display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 1.5rem;">
                    <img src="${usuarioAtual.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                    <div style="flex: 1;">
                        <textarea id="inputComentario_${eventoId}" placeholder="Adicione um comentário público..." style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.5rem; padding: 0.75rem; color: #fff; font-size: 0.875rem; outline: none; resize: vertical; min-height: 60px;"></textarea>
                        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;">
                            <button onclick="adicionarComentario(${eventoId})" class="btn-primary" style="padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.8125rem; background: #2563eb; color: #fff; border: none; cursor: pointer; font-weight: 600;">Comentar</button>
                        </div>
                    </div>
                </div>

                <div id="listaComentarios_${eventoId}">
                    ${comentariosHTML}
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function adicionarComentario(eventoId) {
    const textarea = document.getElementById(`inputComentario_${eventoId}`);
    const texto = textarea.value.trim();

    if (!texto) {
        alert("O comentário não pode estar vazio.");
        return;
    }

    fetch('./API/salvar_comentario.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evento_id: eventoId, texto: texto })
    })
    .then(res => res.json())
    .then(data => {
        if (data.sucesso) {
            textarea.value = '';
            fetch('./API/sessao_atual.php?t=' + new Date().getTime())
                .then(res => res.json())
                .then(dadosSessao => {
                    buscarEventosDoBanco(dadosSessao);
                });
        } else {
            alert('Erro ao salvar comentário: ' + (data.mensagem || 'Erro desconhecido'));
        }
    })
    .catch(err => {
        console.error("Erro:", err);
        alert('Erro de conexão ao salvar comentário.');
    });
}