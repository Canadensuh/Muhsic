/* ============================================================
   MUHSIC — APP / GAME.JS
   ------------------------------------------------------------
   Jogo GUESS THE MUSIC (aba "Guess the Music" do menu).

   Telas:
     1. Tela título: SCORE (com a foto do jogador), placar por
        gênero, resetar pontos e a escolha do gênero (pastas
        iguais às do Início; o MIX é uma pasta maior cujas 4
        capas trocam a cada GAME.mixCoverMs).
        Ao escolher o gênero, escolhe-se a dificuldade
        (GAME.levels: Fácil 5 s, Médio 3 s, Difícil 1 s).
     2. Rodada: 4 discos grandes lado a lado. Depois de responder,
        vem a próxima rodada com 4 discos novos.
     3. Placar final.

   O trecho toca na VITROLA do painel direito ("modo jogo"):
     - o selo do disco vira um "?" e o visor mostra ??? / ???,
       só com a duração real da música;
     - o trecho só toca quando o jogador clica no disco (ou
       Play/Espaço); clicar de novo pausa/continua e, depois que
       o trecho acaba, clicar toca de novo. Girar para trás
       também repete;
     - próxima, anterior, embaralhar, curtir e vitrine ficam
       desligados; a lista "Próximas" vira "Opções";
     - ao responder, a vitrola revela a capa, o título e o artista.

   O áudio do jogo é um <audio> próprio (audioJogo); a música da
   vitrola é pausada ao entrar no jogo e volta a aparecer ao sair.
   ============================================================ */

const audioJogo = new Audio();
audioJogo.preload = 'metadata';

let modoJogo = false;          // rodada aberta: a vitrola controla o jogo

const jogo = {
    genero:      null,   // nome do gênero ou GAME.mixId
    nivel:       GAME.levels[0],
    rodadas:     [],     // [{ resposta, opcoes[4], inicio, escolha, acertou }]
    atual:       0,
    pontos:      0,      // acertos nesta partida
    ouviu:       false,  // o trecho desta rodada já tocou?
    travado:     false,  // durante a animação de resultado
    escolhaPendente: null,
    generoPendente:  null,   // gênero aguardando a escolha da dificuldade

    /* Trecho: parado | carregando | tocando | pausado | fim */
    fase:        'parado',
    restanteMs:  0,
    fimEm:       0,
    girando:     false,
    timerTrecho: null,
    timerResultado: null,
    token:       0
};

/* ============================================================
   DADOS
   ============================================================ */
function musicasDoJogo() {
    return getVisibleSongs(currentUserId).filter(s => s.url);
}

/** Gêneros disponíveis: { nome, total, tracks } */
function generosDoJogo() {
    const mapa = new Map();
    musicasDoJogo().forEach(s => {
        if (!s.genre) return;
        if (!mapa.has(s.genre)) mapa.set(s.genre, []);
        mapa.get(s.genre).push(s);
    });
    return [...mapa.entries()]
        .map(([nome, tracks]) => ({ nome, total: tracks.length, tracks }))
        .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome));
}

function nomeDoGenero(genero) {
    return genero === GAME.mixId ? 'MIX' : genero;
}

function nivelPorId(id) {
    return GAME.levels.find(l => l.id === id) || GAME.levels[0];
}

/** Monta as rodadas: resposta certa + 3 discos "isca" */
function montarRodadas(genero) {
    const todas = musicasDoJogo();
    const doGenero = genero === GAME.mixId ? todas : todas.filter(s => s.genre === genero);

    const respostas = shuffleArray(doGenero);
    const escolhidas = genero === GAME.mixId ? respostas.slice(0, GAME.mixRounds) : respostas;

    return escolhidas.map(resposta => {
        const mesmoTitulo = s => normalizeText(s.title) === normalizeText(resposta.title);
        const iscas = shuffleArray(doGenero.filter(s => !mesmoTitulo(s)));
        if (iscas.length < GAME.choices - 1) {
            iscas.push(...shuffleArray(todas.filter(s => !mesmoTitulo(s) && !iscas.includes(s))));
        }
        const opcoes = shuffleArray([resposta, ...iscas.slice(0, GAME.choices - 1)]);
        return { resposta, opcoes, inicio: null, escolha: null, acertou: null };
    });
}

/* ============================================================
   PLACAR (localStorage por usuário: STORAGE_KEYS.game)
   { v: 3, generos: { "Pop": { partidas, acertos, rodadas, score,
                               melhor: { facil: {pontos,total}, medio, dificil } } } }
   ============================================================ */
function lerPlacar() {
    const salvo = Store.get(STORAGE_KEYS.game(currentUserId), null) || {};
    if (salvo.v === 3 && salvo.generos) return salvo;

    /* Formatos antigos → v3 (recordes antigos contam como Fácil) */
    const generos = {};
    const antigos = salvo.v === 2 ? salvo.generos || {} : salvo;
    Object.entries(antigos).forEach(([g, r]) => {
        if (!r) return;
        if (salvo.v === 2) {
            generos[g] = { partidas: r.partidas, acertos: r.acertos, rodadas: r.rodadas,
                           score: r.acertos * 100, melhor: r.melhor ? { facil: r.melhor } : {} };
        } else if (typeof r.pontos === 'number') {
            generos[g] = { partidas: 1, acertos: r.pontos, rodadas: r.total, score: r.pontos * 100,
                           melhor: { facil: { pontos: r.pontos, total: r.total } } };
        }
    });
    return { v: 3, generos };
}

function salvarPlacar(placar) {
    Store.set(STORAGE_KEYS.game(currentUserId), placar);
}

/** Registra uma partida; devolve true se for novo recorde (gênero + dificuldade) */
function registrarPartida(genero, nivel, pontos, total) {
    const placar = lerPlacar();
    const g = placar.generos[genero] || { partidas: 0, acertos: 0, rodadas: 0, score: 0, melhor: {} };
    g.partidas++;
    g.acertos += pontos;
    g.rodadas += total;
    g.score   += pontos * nivel.points;

    const pct = total ? pontos / total : 0;
    const ant = g.melhor[nivel.id];
    const novo = !ant || pct > ant.pontos / ant.total || (pct === ant.pontos / ant.total && pontos > ant.pontos);
    if (novo) g.melhor[nivel.id] = { pontos, total };

    placar.generos[genero] = g;
    salvarPlacar(placar);
    return novo;
}

function totaisDoPlacar() {
    const lista = Object.values(lerPlacar().generos);
    const soma = campo => lista.reduce((s, g) => s + (g[campo] || 0), 0);
    return { acertos: soma('acertos'), rodadas: soma('rodadas'), partidas: soma('partidas'), score: soma('score') };
}

function recordeDe(genero, nivelId) {
    const r = lerPlacar().generos[genero]?.melhor?.[nivelId];
    return r ? `${r.pontos}/${r.total}` : null;
}

/** Etiqueta da pasta: "21 rodadas" + "★ 14/21" (recorde da dificuldade mais alta jogada) */
function etiquetaDaPasta(genero, rodadas) {
    const texto = `${rodadas} ${rodadas === 1 ? 'rodada' : 'rodadas'}`;
    const melhor = lerPlacar().generos[genero]?.melhor || {};
    const nivel = [...GAME.levels].reverse().find(l => melhor[l.id]);
    return nivel ? `${texto} · ★ ${melhor[nivel.id].pontos}/${melhor[nivel.id].total}` : texto;
}

/* ============================================================
   TELA 1 — TÍTULO, SCORE E GÊNEROS
   ============================================================ */
function mostrarTelaJogo(id) {
    document.querySelectorAll('#page-game .game-screen').forEach(t => {
        t.classList.toggle('active', t.id === id);
    });
}

function renderScoreJogo() {
    const t = totaisDoPlacar();
    renderAvatar($('gameScoreAvatar'));                    // foto do perfil (ou inicial)
    $('gameScoreName').textContent = (currentUserName || 'P1').toUpperCase();
    $('gameTotalScore').textContent = String(t.score).padStart(6, '0');
    const pct = t.rodadas ? Math.round((t.acertos / t.rodadas) * 100) : 0;
    $('gameTotalSub').textContent =
        `${t.partidas} ${t.partidas === 1 ? 'PARTIDA' : 'PARTIDAS'} · ${t.acertos} ACERTOS · ${pct}%`;
}

function discoDaPastaHTML(song) {
    const img = song.coverImage
        ? `<img src="${song.coverImage}" alt="">`
        : `<div class="placeholder">${escapeHTML(song.title.charAt(0))}</div>`;
    return `<div class="pasta-vinyl"><div class="pasta-vinyl-label">${img}</div></div>`;
}

/** 4 músicas sorteadas com capas diferentes (capa do MIX) */
function sortearCapasMix() {
    const vistas = new Set();
    return shuffleArray(musicasDoJogo().filter(s => s.coverImage)).filter(s => {
        if (vistas.has(s.coverImage)) return false;
        vistas.add(s.coverImage);
        return true;
    }).slice(0, 4);
}

/** Pasta do MIX: 4 capas (2×2) + o mesmo carimbo das outras pastas */
function pastaMixHTML(rodadasMix) {
    const capas = sortearCapasMix();
    return `
        <div class="game-genre game-genre--mix" data-genre="${GAME.mixId}">
            <div class="pasta-card pasta-card--mix">
                <div class="pasta-cover">
                    <div class="pasta-vinyls" data-count="${capas.length}">${capas.map(discoDaPastaHTML).join('')}</div>
                    <div class="pasta-sleeve mix-sleeve has-image">
                        <div class="mix-collage">${capas.map(s => `<img src="${s.coverImage}" alt="">`).join('')}</div>
                        <div class="sleeve-shine"></div>
                        <div class="pasta-logo"><img src="${ASSETS.folderLogo}" alt="MFADE"></div>
                        <span class="mix-tag">MIX</span>
                    </div>
                </div>
                <div class="pasta-info">
                    <h3>MIX · Todos os gêneros</h3>
                    <p>${etiquetaDaPasta(GAME.mixId, rodadasMix)}</p>
                </div>
            </div>
        </div>`;
}

/** A cada GAME.mixCoverMs, troca as 4 capas do MIX (e os discos do hover) */
function trocarCapasMix() {
    const pasta = document.querySelector('.game-genre--mix');
    if (!pasta || !$('page-game')?.classList.contains('active') || !$('gameSelect')?.classList.contains('active')) return;

    const capas = sortearCapasMix();
    const imgs = pasta.querySelectorAll('.mix-collage img');
    const discos = pasta.querySelectorAll('.pasta-vinyl-label');
    capas.forEach((s, i) => {
        const img = imgs[i];
        if (!img) return;
        const nova = new Image();
        nova.onload = () => {
            img.classList.add('is-swapping');
            setTimeout(() => {
                img.src = s.coverImage;
                img.classList.remove('is-swapping');
                if (discos[i]) discos[i].innerHTML = `<img src="${s.coverImage}" alt="">`;
            }, 250 + i * 90);
        };
        nova.src = s.coverImage;
    });
}

let renderGenerosToken = 0;

async function renderGenerosJogo() {
    renderScoreJogo();
    const grid = $('gameGenres');
    if (!grid) return;
    const token = ++renderGenerosToken;

    const todas = musicasDoJogo();
    const total = $('gameTotal');
    if (total) total.textContent = `${todas.length} músicas no jogo`;

    let html = pastaMixHTML(Math.min(GAME.mixRounds, todas.length));
    for (const g of generosDoJogo()) {
        const card = await createCardHTMLAsync(g.nome, g.tracks, 'genre');
        html += `<div class="game-genre" data-genre="${escapeHTML(g.nome)}" data-rounds="${g.total}">${card}</div>`;
    }
    if (token !== renderGenerosToken) return;
    grid.innerHTML = html;

    grid.querySelectorAll('.game-genre:not(.game-genre--mix)').forEach(el => {
        const p = el.querySelector('.pasta-info p');
        if (p) p.textContent = etiquetaDaPasta(el.dataset.genre, parseInt(el.dataset.rounds, 10));
    });
}

/** Janela "Placar por gênero" */
function renderTabelaPlacar() {
    const corpo = $('gameTableBody');
    if (!corpo) return;
    const placar = lerPlacar().generos;
    const generos = [GAME.mixId, ...generosDoJogo().map(g => g.nome).sort((a, b) => a.localeCompare(b))];

    const linhas = generos.map(id => {
        const g = placar[id];
        const recs = GAME.levels.map(l => `<td>${recordeDe(id, l.id) || '—'}</td>`).join('');
        return `
            <tr class="${g ? '' : 'is-empty'}">
                <td class="game-table-genre">${escapeHTML(nomeDoGenero(id))}</td>
                ${recs}
                <td>${g ? g.partidas : 0}</td>
                <td>${g ? g.acertos : 0}</td>
                <td>${g ? g.score : 0}</td>
            </tr>`;
    }).join('');

    const t = totaisDoPlacar();
    corpo.innerHTML = `
        <table class="game-table">
            <thead><tr><th>Gênero</th>${GAME.levels.map(l => `<th>${l.name}</th>`).join('')}<th>Partidas</th><th>Acertos</th><th>Pontos</th></tr></thead>
            <tbody>${linhas}</tbody>
            <tfoot><tr><td>SCORE</td><td colspan="${GAME.levels.length + 3}">${String(t.score).padStart(6, '0')}</td></tr></tfoot>
        </table>`;
}

/** Janela de dificuldade para o gênero escolhido */
function abrirDificuldade(genero) {
    jogo.generoPendente = genero;
    $('gameLevelGenre').textContent = `> ${nomeDoGenero(genero).toUpperCase()}`;
    const cores = ['key--green', 'key--accent', 'key--red'];
    $('gameLevels').innerHTML = GAME.levels.map((l, i) => {
        const rec = recordeDe(genero, l.id);
        return `
            <button class="key game-level ${cores[i] || ''}" data-level="${l.id}">
                <span class="game-level-name">${l.name}</span>
                <span class="game-level-sec">${l.seconds} ${l.seconds === 1 ? 'segundo' : 'segundos'}</span>
                <span class="game-level-info">+${l.points} por acerto · ${rec ? 'REC ' + rec : 'sem recorde'}</span>
            </button>`;
    }).join('');
    abrirJanelaJogo('gameLevel', true);
}

function abrirJanelaJogo(id, abrir) {
    const ov = $(id);
    if (!ov) return;
    ov.classList.toggle('active', abrir);
    ov.setAttribute('aria-hidden', String(!abrir));
}

function janelaJogoAberta() {
    return document.querySelector('.game-overlay.active');
}

/* ============================================================
   MODO JOGO NA VITROLA
   ============================================================ */
const TECLAS_BLOQUEADAS_NO_JOGO = ['deckPrev', 'deckNext', 'deckShuffle', 'deckLike', 'deckMax'];

function modoJogoAtivo() {
    return modoJogo;
}

function entrarModoJogo() {
    if (modoJogo) return;
    if (audio && !audio.paused) { pendingPlay = false; audio.pause(); }
    if (typeof fecharMaxPanel === 'function' && maxPanel?.classList.contains('open')) fecharMaxPanel();
    closeContextMenu();

    modoJogo = true;
    document.body.classList.add('game-mode');
    document.body.classList.remove('game-reveal');
    TECLAS_BLOQUEADAS_NO_JOGO.forEach(id => { const b = $(id); if (b) b.disabled = true; });
    $('deckQueueLabel').textContent = 'Opções';
    $('deckQueueIcon').className = 'fas fa-circle-question';
}

function sairModoJogo() {
    if (!modoJogo) return;
    pararTrechoJogo();
    modoJogo = false;
    document.body.classList.remove('game-mode', 'game-reveal');
    TECLAS_BLOQUEADAS_NO_JOGO.forEach(id => { const b = $(id); if (b) b.disabled = false; });
    $('deckQueueLabel').textContent = 'Próximas';
    $('deckQueueIcon').className = 'fas fa-layer-group';

    /* Devolve à vitrola a música que estava nela */
    const faixa = getCurrentSong();
    if (faixa) exibirFaixa(faixa);
    if (audio && audio.duration) {
        if (progress) progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
        if (durationEl) durationEl.textContent = formatTime(audio.duration);
    }
    renderQueue();
}

/** Visor da vitrola: ??? / ??? e só a duração certa */
function atualizarVisorJogo() {
    if (!modoJogo) return;
    const r = rodadaAtual();
    if (!document.body.classList.contains('game-reveal')) {
        if (titleEl)  titleEl.textContent = '???';
        if (artistEl) artistEl.textContent = '???';
    }
    const mesmo = audioJogo.src === r?.resposta.url;
    const dur = (mesmo && isFinite(audioJogo.duration) && audioJogo.duration > 0)
        ? audioJogo.duration : (r?.resposta.duration || 0);
    const t = mesmo ? audioJogo.currentTime : 0;
    if (durationEl)    durationEl.textContent = formatTime(dur);
    if (currentTimeEl) currentTimeEl.textContent = formatTime(t);
    if (progress)      progress.style.width = dur ? `${(t / dur) * 100}%` : '0%';
}

/** Revela a resposta na vitrola: capa no selo, título e artista no visor */
function revelarNaVitrola(song) {
    document.body.classList.add('game-reveal');
    setCover(song.coverImage, `Capa - ${song.title}`);
    if (titleEl)  titleEl.textContent = song.title;
    if (artistEl) artistEl.textContent = song.artist;
}

/** "Próximas" da vitrola vira "Opções": as 4 músicas da rodada */
function renderOpcoesJogo() {
    if (!queueStack) ensureQueueStack();
    const r = rodadaAtual();
    if (!queueStack || !r) return;

    const letras = 'ABCD';
    queueStack.innerHTML = r.opcoes.map((s, i) => {
        let estado = '';
        if (r.escolha !== null) {
            estado = s.id === r.resposta.id ? 'is-correct' : s.id === r.escolha ? 'is-wrong' : 'is-dim';
        }
        const capa = s.coverImage
            ? `<img src="${s.coverImage}" alt="">`
            : `<span class="placeholder">${escapeHTML(s.title.charAt(0))}</span>`;
        return `
            <div class="track-row game-option ${estado}" data-song-id="${s.id}">
                <span class="track-row-num">${letras[i]}</span>
                <span class="track-row-disc">${capa}</span>
                <span class="track-row-info">
                    <span class="track-row-title">${escapeHTML(s.title)}</span>
                    <span class="track-row-artist">${escapeHTML(s.artist)}</span>
                </span>
                <span class="track-row-time"><i class="fas fa-question"></i></span>
            </div>`;
    }).join('');

    queueStack.querySelectorAll('.game-option').forEach(row => {
        row.addEventListener('click', () => {
            playClickSound();
            escolherDiscoJogo(parseInt(row.dataset.songId, 10));
        });
    });
}

/* ---------- Visual da vitrola e dos 4 discos ---------- */
function visualTrecho(tocando) {
    if (tocando) {
        if (!jogo.girando) {
            clearTimeout(brakeTimeoutId);
            if (vinyl) vinyl.style.transition = 'none';
            startSpin();
            jogo.girando = true;
        }
        baixarBraco();
        document.body.classList.add('is-playing');
    } else {
        if (jogo.girando) { brakeAndStop(); jogo.girando = false; }
        levantarBraco();
        document.body.classList.remove('is-playing');
    }

    document.querySelectorAll('#gameDiscs .game-disc').forEach(d => {
        const estava = d.classList.contains('current');
        d.classList.toggle('current', tocando);
        if (tocando) d.classList.remove('braking');
        else if (estava) { d.classList.remove('braking'); void d.offsetWidth; d.classList.add('braking'); }
    });
    $('gameBoard')?.classList.toggle('is-listening', tocando);
}

function animarBarra(fracao, ms) {
    const barra = $('gameTimer');
    if (!barra) return;
    barra.style.transition = 'none';
    barra.style.width = `${fracao * 100}%`;
    if (ms > 0) {
        void barra.offsetWidth;
        barra.style.transition = `width ${ms}ms linear`;
        barra.style.width = '0%';
    }
}

function congelarBarra() {
    const barra = $('gameTimer');
    if (!barra) return;
    const largura = getComputedStyle(barra).width;
    barra.style.transition = 'none';
    barra.style.width = largura;
}

/* ============================================================
   TRECHO (5, 3 ou 1 segundo, conforme a dificuldade)
   ============================================================ */
function duracaoTrechoMs() {
    return jogo.nivel.seconds * 1000;
}

function carregarMetadadosJogo(url) {
    return new Promise((resolve, reject) => {
        if (audioJogo.src === url && audioJogo.readyState >= 1) { resolve(audioJogo.duration); return; }
        const pronto = () => { limpar(); resolve(audioJogo.duration); };
        const erro = () => { limpar(); reject(new Error('áudio indisponível')); };
        const limpar = () => {
            audioJogo.removeEventListener('loadedmetadata', pronto);
            audioJogo.removeEventListener('error', erro);
        };
        audioJogo.addEventListener('loadedmetadata', pronto);
        audioJogo.addEventListener('error', erro);
        audioJogo.src = url;
        audioJogo.load();
    });
}

/** Toca o trecho desde o começo (o ponto é sorteado uma vez por rodada) */
async function tocarDoInicioJogo() {
    const rodada = rodadaAtual();
    if (!modoJogo || !rodada || jogo.travado || rodada.escolha !== null) return;

    clearTimeout(jogo.timerTrecho);
    const token = ++jogo.token;
    jogo.fase = 'carregando';
    mensagemJogo('CARREGANDO...');

    try {
        const duracao = await carregarMetadadosJogo(rodada.resposta.url);
        if (token !== jogo.token) return;

        if (rodada.inicio === null) {
            const dur = isFinite(duracao) && duracao > 0 ? duracao : (rodada.resposta.duration || 30);
            rodada.inicio = Math.random() * Math.max(0, dur - jogo.nivel.seconds - 0.5);
        }
        audioJogo.currentTime = rodada.inicio;
        jogo.restanteMs = duracaoTrechoMs();
        atualizarVisorJogo();
        await continuarTrechoJogo(token);
    } catch (e) {
        if (token !== jogo.token) return;
        jogo.fase = 'parado';
        visualTrecho(false);
        if (e && e.name === 'NotAllowedError') {
            mensagemJogo('ADIVINHE A MÚSICA');
        } else {
            mensagemJogo('ERRO AO CARREGAR O TRECHO', 'is-error');
            console.error('[Muhsic] Guess the Music:', e);
        }
    }
}

/** Toca o que falta do trecho (começo ou depois de uma pausa) */
async function continuarTrechoJogo(token = jogo.token) {
    audioJogo.volume = state.volume;
    await audioJogo.play();
    if (token !== jogo.token) { audioJogo.pause(); return; }

    jogo.fase = 'tocando';
    jogo.ouviu = true;
    jogo.fimEm = performance.now() + jogo.restanteMs;
    visualTrecho(true);
    mensagemJogo('OUVINDO...', 'is-live');
    animarBarra(jogo.restanteMs / duracaoTrechoMs(), jogo.restanteMs);

    clearTimeout(jogo.timerTrecho);
    jogo.timerTrecho = setTimeout(() => {
        if (token === jogo.token) fimDoTrechoJogo();
    }, jogo.restanteMs);
}

/** O trecho acabou: para e espera o jogador (clicar no disco toca de novo) */
function fimDoTrechoJogo() {
    clearTimeout(jogo.timerTrecho);
    audioJogo.pause();
    visualTrecho(false);
    jogo.fase = 'fim';
    jogo.restanteMs = 0;
    animarBarra(0, 0);
    mensagemJogo('QUAL É A MÚSICA?');
}

function pausarTrechoJogo() {
    jogo.restanteMs = Math.max(0, jogo.fimEm - performance.now());
    jogo.token++;
    clearTimeout(jogo.timerTrecho);
    audioJogo.pause();
    congelarBarra();
    jogo.fase = 'pausado';
    visualTrecho(false);
    mensagemJogo('PAUSADO');
}

/** Clique no disco / Play / Espaço */
function alternarTrechoJogo() {
    if (!modoJogo || jogo.travado || janelaJogoAberta()) return;
    if (jogo.fase === 'tocando') { pausarTrechoJogo(); return; }
    if (jogo.fase === 'carregando') return;
    if (jogo.fase === 'pausado' && jogo.restanteMs > 150) {
        continuarTrechoJogo(++jogo.token).catch(() => tocarDoInicioJogo());
        return;
    }
    tocarDoInicioJogo();                    // parado ou fim: toca o trecho (de novo)
}

/** Girar o disco para trás: ouvir o trecho de novo */
function repetirTrechoJogo() {
    if (!modoJogo || jogo.travado || janelaJogoAberta()) return;
    audioJogo.pause();
    tocarDoInicioJogo();
}

/** Girar para frente não pula nada no jogo: o disco só volta a girar */
function retomarGiroJogo() {
    if (jogo.girando && jogo.fase === 'tocando') startSpin();
}

/** Para tudo (resposta, saída do jogo) */
function pararTrechoJogo() {
    clearTimeout(jogo.timerTrecho);
    jogo.token++;
    if (!audioJogo.paused) audioJogo.pause();
    jogo.fase = 'parado';
    animarBarra(0, 0);
    if (modoJogo) visualTrecho(false);
}

/* ============================================================
   PARTIDA
   ============================================================ */
function rodadaAtual() {
    return jogo.rodadas[jogo.atual] || null;
}

function mensagemJogo(texto, tipo = '') {
    const el = $('gameMsg');
    if (!el) return;
    el.textContent = texto;
    el.className = `game-lcd-msg ${tipo}`.trim();
}

function iniciarJogo(genero, nivelId) {
    pararTrechoJogo();
    const rodadas = montarRodadas(genero);
    if (!rodadas.length) return;

    Object.assign(jogo, {
        genero, nivel: nivelPorId(nivelId), rodadas, atual: 0, pontos: 0,
        ouviu: false, travado: false, escolhaPendente: null
    });

    $('gameGenreName').textContent = nomeDoGenero(genero).toUpperCase();
    $('gameLevelName').textContent = `${jogo.nivel.name.toUpperCase()} · ${jogo.nivel.seconds}S`;
    mostrarTelaJogo('gameBoard');
    entrarModoJogo();
    iniciarRodadaJogo();
}

/** Desenha a rodada; o trecho só toca quando o jogador clica no disco */
function iniciarRodadaJogo() {
    jogo.ouviu = false;
    jogo.fase = 'parado';
    jogo.restanteMs = 0;
    document.body.classList.remove('game-reveal');
    renderRodada(true);
    renderOpcoesJogo();
    atualizarVisorJogo();
    animarBarra(0, 0);
    mensagemJogo('ADIVINHE A MÚSICA');
}

/** Disco grande (igual aos da prateleira) */
function discoJogoHTML(song, rodada) {
    const titulo = escapeHTML(song.title);
    const capa = song.coverImage
        ? `<img src="${song.coverImage}" alt="${titulo}" draggable="false">`
        : `<div class="placeholder">${escapeHTML(song.title.charAt(0))}</div>`;

    let estado = '';
    if (rodada.escolha !== null) {
        if (song.id === rodada.resposta.id) estado = 'is-correct';
        else if (song.id === rodada.escolha) estado = 'is-wrong';
        else estado = 'is-dim';
    }

    return `
        <div class="vinyl-item game-disc ${estado}" data-song="${song.id}">
            <div class="shelf-vinyl"><div class="shelf-spin"><div class="shelf-cover">${capa}</div></div></div>
            <div class="shelf-info">
                <div class="shelf-title">${titulo}</div>
                <div class="shelf-artist">${escapeHTML(song.artist)}</div>
            </div>
        </div>`;
}

/** A rodada atual: 4 discos lado a lado + bolinhas de progresso */
function renderRodada(nova = false) {
    const area = $('gameDiscs');
    const r = rodadaAtual();
    if (!area || !r) return;

    area.innerHTML = r.opcoes.map(s => discoJogoHTML(s, r)).join('');
    area.classList.toggle('is-answered', r.escolha !== null);
    if (nova) {
        area.classList.remove('is-new');
        void area.offsetWidth;
        area.classList.add('is-new');
    }

    const pips = $('gamePips');
    if (pips) {
        pips.innerHTML = jogo.rodadas.map((x, i) => {
            const cls = x.escolha !== null ? (x.acertou ? 'ok' : 'err') : i === jogo.atual ? 'now' : '';
            return `<span class="${cls}"></span>`;
        }).join('');
    }

    $('gameRound').textContent = `${Math.min(jogo.atual + 1, jogo.rodadas.length)}/${jogo.rodadas.length}`;
    $('gameScore').textContent = jogo.pontos;
}

/* ============================================================
   ESCOLHA, CONFIRMAÇÃO E RESULTADO
   ============================================================ */
function escolherDiscoJogo(songId) {
    const rodada = rodadaAtual();
    if (!modoJogo || !rodada || jogo.travado || rodada.escolha !== null) return;

    if (!jogo.ouviu) {
        mensagemJogo('TOQUE O DISCO PRIMEIRO', 'is-error');
        return;
    }

    const song = rodada.opcoes.find(s => s.id === songId);
    if (!song) return;

    jogo.escolhaPendente = song.id;
    $('gameConfirmSong').textContent = song.title;
    $('gameConfirmArtist').textContent = song.artist;
    $('gameConfirmDisc').innerHTML = `<span class="game-dialog-label">${
        song.coverImage ? `<img src="${song.coverImage}" alt="">` : escapeHTML(song.title.charAt(0))
    }</span>`;
    abrirJanelaJogo('gameConfirm', true);
    setTimeout(() => $('gameConfirmYes')?.focus(), 50);
}

function cancelarEscolhaJogo() {
    jogo.escolhaPendente = null;
    abrirJanelaJogo('gameConfirm', false);
}

function confirmarEscolhaJogo() {
    const rodada = rodadaAtual();
    const escolha = jogo.escolhaPendente;
    cancelarEscolhaJogo();
    if (!rodada || escolha === null) return;

    pararTrechoJogo();
    jogo.travado = true;
    rodada.escolha = escolha;
    rodada.acertou = escolha === rodada.resposta.id;
    if (rodada.acertou) jogo.pontos++;

    renderRodada();
    renderOpcoesJogo();
    revelarNaVitrola(rodada.resposta);       // capa no lugar do "?"
    mostrarResultadoJogo(rodada);
}

function mostrarResultadoJogo(rodada) {
    const box = $('gameResult');
    if (!box) return;
    const r = rodada.resposta;

    box.classList.remove('ok', 'err', 'active');
    void box.offsetWidth;
    box.classList.add(rodada.acertou ? 'ok' : 'err', 'active');
    $('gameResultIcon').className = `fas ${rodada.acertou ? 'fa-check' : 'fa-xmark'}`;
    $('gameResultTitle').textContent = rodada.acertou ? 'ACERTOU!' : 'ERROU!';
    $('gameResultSong').textContent = rodada.acertou ? `${r.title} — ${r.artist}` : `Era: ${r.title} — ${r.artist}`;
    mensagemJogo(rodada.acertou ? `ACERTOU! +${jogo.nivel.points}` : 'ERROU!', rodada.acertou ? 'is-ok' : 'is-error');

    clearTimeout(jogo.timerResultado);
    jogo.timerResultado = setTimeout(avancarRodadaJogo, GAME.resultMs);
}

/** Fecha a animação e vai para a próxima rodada (ou para o placar) */
function avancarRodadaJogo() {
    clearTimeout(jogo.timerResultado);
    const box = $('gameResult');
    if (!box || !box.classList.contains('active')) return;
    box.classList.remove('active');

    jogo.atual++;
    jogo.travado = false;

    if (jogo.atual >= jogo.rodadas.length) { mostrarFimDeJogo(); return; }
    iniciarRodadaJogo();
}

function mostrarFimDeJogo() {
    sairModoJogo();
    const total = jogo.rodadas.length;
    const pct = total ? jogo.pontos / total : 0;
    const recorde = registrarPartida(jogo.genero, jogo.nivel, jogo.pontos, total);
    const ganhos = jogo.pontos * jogo.nivel.points;

    const ranks = [
        [1,    'OUVIDO ABSOLUTO'],
        [0.75, 'DJ DE RESPEITO'],
        [0.5,  'BOM DE FAIXA'],
        [0.25, 'AINDA AQUECENDO'],
        [0,    'TROQUE A AGULHA']
    ];
    const onde = `${nomeDoGenero(jogo.genero)} (${jogo.nivel.name})`;
    $('gameEndScore').textContent = `${jogo.pontos}/${total}`;
    $('gameEndRank').textContent = ranks.find(([min]) => pct >= min)[1];
    $('gameEndRecord').textContent = recorde
        ? `★ NOVO RECORDE em ${onde}! · +${ganhos} no SCORE`
        : `Recorde em ${onde}: ${recordeDe(jogo.genero, jogo.nivel.id)} · +${ganhos} no SCORE`;
    $('gameEnd')?.classList.toggle('is-record', recorde);
    mostrarTelaJogo('gameEnd');
}

/** Volta para a tela título (abandona a partida em andamento) */
function voltarAosGenerosJogo() {
    clearTimeout(jogo.timerResultado);
    $('gameResult')?.classList.remove('active');
    cancelarEscolhaJogo();
    jogo.travado = false;
    sairModoJogo();
    renderGenerosJogo();
    mostrarTelaJogo('gameSelect');
}

function jogoEmAndamento() {
    return modoJogo && $('page-game')?.classList.contains('active');
}

/** Saiu da aba do jogo (menu ou pasta do rack): abandona a partida */
function sairDaAbaDoJogo() {
    abrirJanelaJogo('gameLevel', false);
    if (modoJogo || $('gameResult')?.classList.contains('active')) voltarAosGenerosJogo();
}

/* ============================================================
   EVENTOS
   ============================================================ */
function bindGame() {
    renderGenerosJogo();
    setInterval(trocarCapasMix, GAME.mixCoverMs);

    /* Gênero → dificuldade → jogo */
    $('gameGenres')?.addEventListener('click', e => {
        const pasta = e.target.closest('.game-genre');
        if (!pasta) return;
        playClickSound();
        abrirDificuldade(pasta.dataset.genre);
    });
    $('gameLevels')?.addEventListener('click', e => {
        const btn = e.target.closest('.game-level');
        if (!btn || !jogo.generoPendente) return;
        playClickSound();
        abrirJanelaJogo('gameLevel', false);
        iniciarJogo(jogo.generoPendente, btn.dataset.level);
    });
    $('gameLevelClose')?.addEventListener('click', () => abrirJanelaJogo('gameLevel', false));

    $('gameQuit')?.addEventListener('click', voltarAosGenerosJogo);
    $('gameAgain')?.addEventListener('click', () => iniciarJogo(jogo.genero, jogo.nivel.id));
    $('gameBackToGenres')?.addEventListener('click', voltarAosGenerosJogo);

    $('gameDiscs')?.addEventListener('click', e => {
        const disco = e.target.closest('.game-disc[data-song]');
        if (!disco) return;
        playClickSound();
        escolherDiscoJogo(parseInt(disco.dataset.song, 10));
    });

    /* Tem certeza? */
    $('gameConfirmYes')?.addEventListener('click', confirmarEscolhaJogo);
    $('gameConfirmNo')?.addEventListener('click', cancelarEscolhaJogo);
    $('gameResult')?.addEventListener('click', avancarRodadaJogo);

    /* Placar e reset */
    $('gameOpenTable')?.addEventListener('click', () => { renderTabelaPlacar(); abrirJanelaJogo('gameTable', true); });
    $('gameTableClose')?.addEventListener('click', () => abrirJanelaJogo('gameTable', false));
    $('gameResetBtn')?.addEventListener('click', () => abrirJanelaJogo('gameReset', true));
    $('gameResetNo')?.addEventListener('click', () => abrirJanelaJogo('gameReset', false));
    $('gameResetYes')?.addEventListener('click', () => {
        salvarPlacar({ v: 3, generos: {} });
        abrirJanelaJogo('gameReset', false);
        renderGenerosJogo();
    });

    /* Clique no fundo escuro fecha a janela (= "Não") */
    document.querySelectorAll('.game-overlay').forEach(ov => {
        ov.addEventListener('click', e => {
            if (e.target !== ov) return;
            if (ov.id === 'gameConfirm') cancelarEscolhaJogo();
            else abrirJanelaJogo(ov.id, false);
        });
    });

    document.addEventListener('keydown', e => {
        const aberta = janelaJogoAberta();
        if (aberta) {
            if (e.key === 'Escape') {
                e.preventDefault();
                if (aberta.id === 'gameConfirm') cancelarEscolhaJogo();
                else abrirJanelaJogo(aberta.id, false);
            }
            if (e.key === 'Enter' && aberta.id === 'gameConfirm') { e.preventDefault(); confirmarEscolhaJogo(); }
            return;
        }
        if (e.key === 'Escape' && jogoEmAndamento() && !document.querySelector('.settings-overlay.active')) {
            voltarAosGenerosJogo();
        }
    });

    audioJogo.addEventListener('timeupdate', atualizarVisorJogo);
    audioJogo.addEventListener('loadedmetadata', atualizarVisorJogo);
    audioJogo.addEventListener('ended', () => { if (jogo.fase === 'tocando') fimDoTrechoJogo(); });
}
