/* ============================================================
   MUHSIC — APP / QUEUE.JS
   ------------------------------------------------------------
   Fila automática ("próximos discos").
     - Modo normal: as próximas faixas da lista ativa
     - Modo aleatório: sorteio na biblioteca inteira
   Renderiza a pilha ao lado da vitrola e a lista "A seguir".
   ============================================================ */

/** Cria o contêiner da pilha caso ele não exista no HTML */
function ensureQueueStack() {
    queueStack = $('queueStack');
    if (queueStack) return queueStack;

    const turntable = document.querySelector('.turntable');
    if (!turntable) return null;

    const stack = document.createElement('div');
    stack.className = 'queue-stack';
    stack.id = 'queueStack';
    const vinylW = turntable.querySelector('.vinyl-wrapper');
    if (vinylW) turntable.insertBefore(stack, vinylW);
    else turntable.appendChild(stack);

    queueStack = stack;
    return queueStack;
}

function renderizarFilas() {
    renderQueue();
    renderMaxNext();
}

/* ============================================================
   MONTAGEM DA FILA
   ============================================================ */

/** Recria a fila do zero */
function buildQueue() {
    autoQueue = [];
    const listLen = state.playlist.length;

    if (!listLen || (listLen <= 1 && !state.isShuffled)) {
        renderizarFilas();
        return;
    }

    if (state.isShuffled) {
        /* Sorteio sem repetir faixas */
        const pool = getVisibleSongs(currentUserId).filter(s => s.id !== currentPlayingSongId);
        autoQueue = shuffleArray(pool).slice(0, QUEUE_SIZE).map(s => ({ ...s }));
    } else {
        /* Em listas curtas, não repete a própria faixa atual */
        const total = Math.min(QUEUE_SIZE, listLen - 1);
        for (let i = 1; i <= total; i++) {
            autoQueue.push({ ...state.playlist[(state.currentIndex + i) % listLen] });
        }
    }
    renderizarFilas();
}

/** Remove o primeiro da fila e completa no final */
function shiftQueue() {
    if (!autoQueue.length) return;
    autoQueue.shift();
    pushToEnd();
}

/** Completa a fila até QUEUE_SIZE */
function pushToEnd() {
    if (!state.playlist.length && !state.isShuffled) return;
    const listLen = state.playlist.length;
    if (listLen === 1 && !state.isShuffled) return;

    const alvo = state.isShuffled ? QUEUE_SIZE : Math.min(QUEUE_SIZE, listLen - 1);
    if (autoQueue.length >= alvo) return;

    while (autoQueue.length < alvo) {
        if (state.isShuffled) {
            const bib = getVisibleSongs(currentUserId);
            const ids = autoQueue.map(s => s.id);
            const semRepetir = bib.filter(s => s.id !== currentPlayingSongId && !ids.includes(s.id));
            const pool = semRepetir.length > 0 ? semRepetir : bib.filter(s => s.id !== currentPlayingSongId);
            if (pool.length === 0) break;
            autoQueue.push({ ...pickRandom(pool) });
        } else {
            const ultima = autoQueue.length ? autoQueue[autoQueue.length - 1] : state.playlist[state.currentIndex];
            const idxU = state.playlist.findIndex(s => s.id === ultima.id);
            autoQueue.push({ ...state.playlist[(idxU + 1) % listLen] });
        }
    }
    renderizarFilas();
}

/** Animação de "embaralhar" nas duas filas */
function animarShuffleVisual() {
    [queueStack, $('maxNextList')].forEach(el => {
        if (!el) return;
        el.classList.add('shuffling');
        setTimeout(() => el.classList.remove('shuffling'), 800);
    });
}

/* ============================================================
   RENDERIZAÇÃO
   ============================================================ */

/**
 * Uma "faixa" da fila: número, mini disco, título e artista.
 * Usada tanto na vitrola quanto no modo vitrine
 * (estilo em css/components/track-rows.css).
 */
function faixaHTML(song, posicao) {
    const titulo = escapeHTML(song.title);
    const cover = song.coverImage
        ? `<img src="${song.coverImage}" alt="">`
        : `<span class="placeholder">${escapeHTML(song.title.charAt(0))}</span>`;
    return `
        <div class="track-row" data-song-id="${song.id}">
            <span class="track-row-num">${String(posicao).padStart(2, '0')}</span>
            <span class="track-row-disc">${cover}</span>
            <span class="track-row-info">
                <span class="track-row-title">${titulo}</span>
                <span class="track-row-artist">${escapeHTML(song.artist)}</span>
            </span>
            <span class="track-row-time">${formatTime(song.duration || 0)}</span>
        </div>`;
}

/** Desenha uma lista de faixas e liga o clique (tocar a faixa) */
function renderListaDeFaixas(container, lista, vazio) {
    if (!container) return;
    if (!lista.length) {
        container.innerHTML = `<p class="track-rows-empty">${vazio}</p>`;
        return;
    }
    container.innerHTML = lista.map((song, i) => faixaHTML(song, i + 1)).join('');
    container.querySelectorAll('.track-row').forEach(row => {
        row.addEventListener('click', () => {
            const id = parseInt(row.dataset.songId, 10);
            if (!isNaN(id)) tocarDiscoPorId(id);
        });
    });
}

/** "Próximas" na vitrola: as faixas reais da fila */
function renderQueue() {
    if (typeof modoJogoAtivo === 'function' && modoJogoAtivo()) { renderOpcoesJogo(); return; }  // jogo: "Opções"
    if (!queueStack) ensureQueueStack();
    renderListaDeFaixas(queueStack, autoQueue.slice(0, QUEUE_SIZE), 'FILA VAZIA');
}

/** Fila + discos sorteados para completar MAX_VISIBLE_QUEUE itens */
function getDiscosASeguir() {
    const lista = [...autoQueue];
    if (lista.length >= MAX_VISIBLE_QUEUE) return lista.slice(0, MAX_VISIBLE_QUEUE);

    const usados = new Set(lista.map(s => s.id));
    if (currentPlayingSongId) usados.add(currentPlayingSongId);

    const extras = shuffleArray(getVisibleSongs(currentUserId).filter(s => !usados.has(s.id)));
    while (lista.length < MAX_VISIBLE_QUEUE && extras.length) lista.push(extras.shift());
    return lista;
}

/** "A seguir" no modo vitrine */
function renderMaxNext() {
    renderListaDeFaixas(maxNextList, getDiscosASeguir(), 'Nenhum disco na fila.');
}
