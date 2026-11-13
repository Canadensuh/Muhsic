/* ============================================================
   MUHSIC — APP / VIEWS / SHELF.JS
   ------------------------------------------------------------
   "Prateleira de vinil": a lista de discos usada no detalhe,
   e na busca. O arraste de um disco até a
   vitrola fica em js/app/disc-drag.js.
   ============================================================ */

const ICONE_CORACAO = `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;

/**
 * Estado visual dos discos da prateleira:
 *   current  → é a música atual e está tocando (selo gira)
 *   is-loaded→ é a música atual (tocando ou pausada)
 *   braking  → acabou de pausar: "freada" igual à da vitrola
 */
function updateHighlight() {
    document.querySelectorAll('.vinyl-item[data-id]').forEach(el => {
        const id = parseInt(el.dataset.id, 10);
        const ehAtual = currentPlayingSongId !== null && id === currentPlayingSongId;
        const tocando = ehAtual && state.isPlaying;
        const estavaGirando = el.classList.contains('current');

        el.classList.toggle('current', tocando);
        el.classList.toggle('is-loaded', ehAtual);

        if (tocando) {
            el.classList.remove('braking');
        } else if (estavaGirando) {
            el.classList.remove('braking');
            void el.offsetWidth;                // reinicia a animação
            el.classList.add('braking');
        }
    });
}

/** Cartãozinho ♥ em cima do disco: aparece em todo disco curtido; clicar descurte */
function coracaoHTML(songId) {
    return `<button class="vinyl-like-btn liked" data-like-id="${songId}" aria-label="Remover dos curtidos">${ICONE_CORACAO}</button>`;
}

function discoHTML(song) {
    const titulo = escapeHTML(song.title);
    const cover = song.coverImage
        ? `<img src="${song.coverImage}" alt="${titulo}" draggable="false">`
        : `<div class="placeholder">${escapeHTML(song.title.charAt(0))}</div>`;
    const ehAtual = currentPlayingSongId !== null && song.id === currentPlayingSongId;
    const tocando = ehAtual && state.isPlaying;
    const classes = ['vinyl-item', tocando ? 'current' : '', ehAtual ? 'is-loaded' : ''].join(' ').trim();
    const likeBtn = isSongCurtida(song.id) ? coracaoHTML(song.id) : '';

    return `
        <div class="${classes}" data-id="${song.id}">
            ${likeBtn}
            <div class="shelf-vinyl">
                <div class="shelf-spin"><div class="shelf-cover">${cover}</div></div>
            </div>
            <div class="shelf-info">
                <div class="shelf-title">${titulo}</div>
                <div class="shelf-artist">${escapeHTML(song.artist)}</div>
                <div class="shelf-duration"><i class="far fa-clock"></i> ${formatTime(song.duration || 0)}</div>
            </div>
        </div>
    `;
}

function renderVinylShelf(tracks, targetId) {
    const list = $(targetId);
    if (!list) return;

    if (!tracks.length) {
        list.innerHTML = '<p style="color:var(--text-secondary);padding:20px;text-align:center;">Nenhum disco.</p>';
        return;
    }

    list.className = 'vinyl-shelf';
    list.innerHTML = tracks.map(song => discoHTML(song)).join('');
}

/**
 * Curtiu/descurtiu em qualquer lugar (duplo clique, tecla ♥, cartãozinho):
 * põe ou tira o ♥ dos discos que já estão na tela, sem redesenhar a lista.
 */
function atualizarCoracoesPrateleira() {
    document.querySelectorAll('.vinyl-item[data-id]').forEach(el => {
        const id = parseInt(el.dataset.id, 10);
        const btn = el.querySelector('.vinyl-like-btn');
        if (isSongCurtida(id)) {
            if (!btn) el.insertAdjacentHTML('afterbegin', coracaoHTML(id));
        } else if (btn) {
            btn.remove();
        }
    });
}

/** Clique no ♥ de qualquer prateleira (um único ouvinte para todas) */
function bindCoracoesPrateleira() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.vinyl-like-btn');
        if (!btn) return;
        e.stopPropagation();
        playClickSound();
        const songId = parseInt(btn.dataset.likeId, 10);
        if (!isNaN(songId)) removerCurtida(songId);
    });
}

/* ============================================================
   BUSCA
   Define a lista ativa do player (state.playlist).
   ============================================================ */
function renderSearchResults(filtered) {
    const results = $('searchResults');
    if (!results) return;

    const unique = getUniqueSongs(filtered);
    state.playlist = unique;
    state.currentItem = null;
    state.currentItemName = null;
    renderVinylShelf(unique, 'searchResults');
}
