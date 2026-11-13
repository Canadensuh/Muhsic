/* ============================================================
   MUHSIC — APP / MEDIA-SESSION.JS
   ------------------------------------------------------------
   Integração com os controles de mídia do sistema
   (Media Session API): a "barra preta" do Windows que aparece
   ao usar as teclas de mídia, a tela de bloqueio do celular,
   o controle de mídia do Chrome etc.

   A imagem mostrada lá é o DISCO da música atual: um vinil
   desenhado em <canvas> com a capa no selo, o anel na cor do
   tema e o furo central. No Guess the Music aparece um disco
   com "?" no lugar da capa (a música é segredo).

   Botões do sistema → mesmas funções do teclado da vitrola:
     play / pause → togglePlay     próxima → nextTrack
     anterior     → prevTrack      (no jogo, próxima/anterior somem)
   ============================================================ */

const MEDIA_ART_PX = 512;          // tamanho da imagem do disco
const temMediaSession = 'mediaSession' in navigator;

let mediaArtUrl   = null;          // blob: da imagem atual (liberado na troca)
let mediaArtToken = 0;             // ignora desenhos de faixas antigas

/* ============================================================
   DESENHO DO DISCO
   ============================================================ */

/** Carrega a capa com CORS para poder desenhá-la no canvas */
function carregarCapaParaDisco(src) {
    return new Promise((resolve) => {
        if (!src) { resolve(null); return; }
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload  = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

function corDoTema(nome, padrao) {
    const v = getComputedStyle(document.body).getPropertyValue(nome).trim();
    return v || padrao;
}

/**
 * Desenha o vinil. capa = <img> (ou null); misterio = selo com "?"
 * Devolve um blob: URL (PNG) ou null se o canvas não puder exportar.
 */
async function desenharDiscoMidia(capa, misterio) {
    const S = MEDIA_ART_PX, c = S / 2;
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const g = cv.getContext('2d');
    const acento = corDoTema('--accent', '#e8a33d');

    /* Vinil preto */
    g.beginPath(); g.arc(c, c, c - 4, 0, Math.PI * 2);
    const base = g.createRadialGradient(c, c, S * 0.1, c, c, c);
    base.addColorStop(0, '#1d1b19'); base.addColorStop(1, '#070707');
    g.fillStyle = base; g.fill();

    /* Sulcos */
    g.lineWidth = 1;
    for (let r = S * 0.2; r < c - 10; r += 4) {
        g.strokeStyle = `rgba(255,255,255,${r % 12 < 4 ? 0.07 : 0.03})`;
        g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.stroke();
    }

    /* Brilho diagonal */
    g.save();
    g.beginPath(); g.arc(c, c, c - 4, 0, Math.PI * 2); g.clip();
    const brilho = g.createLinearGradient(0, 0, S, S);
    brilho.addColorStop(0.30, 'rgba(255,255,255,0)');
    brilho.addColorStop(0.45, 'rgba(255,255,255,0.10)');
    brilho.addColorStop(0.55, 'rgba(255,255,255,0)');
    g.fillStyle = brilho; g.fillRect(0, 0, S, S);
    g.restore();

    /* Selo: capa recortada em círculo (ou "?") */
    const rSelo = S * 0.29;            // selo grande: a miniatura do sistema é pequena
    g.save();
    g.beginPath(); g.arc(c, c, rSelo, 0, Math.PI * 2); g.clip();
    if (capa && !misterio) {
        const lado = Math.min(capa.naturalWidth, capa.naturalHeight);
        g.drawImage(capa,
            (capa.naturalWidth - lado) / 2, (capa.naturalHeight - lado) / 2, lado, lado,
            c - rSelo, c - rSelo, rSelo * 2, rSelo * 2);
    } else {
        g.fillStyle = acento; g.fillRect(c - rSelo, c - rSelo, rSelo * 2, rSelo * 2);
        if (misterio) {
            g.fillStyle = corDoTema('--text-on-accent', '#1a1208');
            g.font = `bold ${Math.round(rSelo * 1.3)}px "Arial Black", Arial, sans-serif`;
            g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillText('?', c, c + rSelo * 0.08);
        }
    }
    g.restore();

    /* Anel do selo na cor do tema + furo central */
    g.lineWidth = S * 0.012; g.strokeStyle = acento;
    g.beginPath(); g.arc(c, c, rSelo, 0, Math.PI * 2); g.stroke();
    if (!misterio) {                    // o furo ficaria em cima do "?"
        g.fillStyle = '#0b0b0b';
        g.beginPath(); g.arc(c, c, S * 0.018, 0, Math.PI * 2); g.fill();
    }

    return new Promise((resolve) => {
        try {
            cv.toBlob(b => resolve(b ? URL.createObjectURL(b) : null), 'image/png');
        } catch (e) {                   // canvas "sujo" (capa sem CORS)
            resolve(null);
        }
    });
}

/* ============================================================
   METADADOS
   ============================================================ */

/**
 * Atualiza o que o sistema mostra.
 *   faixa    → música atual (ou null)
 *   misterio → true no Guess the Music antes de responder
 */
async function atualizarMidiaSistema(faixa, misterio = false) {
    if (!temMediaSession) return;
    const token = ++mediaArtToken;

    const titulo  = misterio ? '???' : (faixa?.title  || 'Muhsic');
    const artista = misterio ? '???' : (faixa?.artist || '');
    const album   = misterio ? 'Guess the Music' : 'Muhsic';

    /* Texto na hora; a imagem do disco chega logo depois */
    const fallback = (!misterio && faixa?.coverImage)
        ? [{ src: faixa.coverImage, sizes: '512x512' }] : [];
    try {
        navigator.mediaSession.metadata = new MediaMetadata({ title: titulo, artist: artista, album, artwork: fallback });
    } catch (e) { return; }

    const capa = misterio ? null : await carregarCapaParaDisco(faixa?.coverImage);
    if (!misterio && faixa?.coverImage && !capa) return;   // capa sem CORS: fica a capa simples
    const url  = await desenharDiscoMidia(capa, misterio);
    if (token !== mediaArtToken) { if (url) URL.revokeObjectURL(url); return; }
    if (!url) return;                   // fica a capa simples (fallback)

    if (mediaArtUrl) URL.revokeObjectURL(mediaArtUrl);
    mediaArtUrl = url;
    navigator.mediaSession.metadata = new MediaMetadata({
        title: titulo, artist: artista, album,
        artwork: [{ src: url, sizes: `${MEDIA_ART_PX}x${MEDIA_ART_PX}`, type: 'image/png' }]
    });
}

/** Play/pause no ícone do sistema */
function estadoMidiaSistema(tocando) {
    if (!temMediaSession) return;
    navigator.mediaSession.playbackState = tocando ? 'playing' : 'paused';
}

/** Próxima/anterior só existem fora do jogo */
function acoesDeFaixaMidia(ativas) {
    if (!temMediaSession) return;
    const def = (acao, fn) => { try { navigator.mediaSession.setActionHandler(acao, fn); } catch (e) {} };
    def('nexttrack',     ativas ? () => nextTrack() : null);
    def('previoustrack', ativas ? () => prevTrack() : null);
}

function bindMediaSession() {
    if (!temMediaSession) return;
    const def = (acao, fn) => { try { navigator.mediaSession.setActionHandler(acao, fn); } catch (e) {} };
    const tocandoAgora = () => modoJogoAtivo()
        ? (typeof audioJogo !== 'undefined' && !audioJogo.paused)
        : (audio && !audio.paused);

    def('play',  () => { if (!tocandoAgora()) togglePlay(); });
    def('pause', () => { if (tocandoAgora())  togglePlay(); });
    def('stop',  () => { if (tocandoAgora())  togglePlay(); });
    acoesDeFaixaMidia(true);

    /* Ícone play/pause acompanha os dois <audio> (player e jogo) */
    [audio, typeof audioJogo !== 'undefined' ? audioJogo : null].forEach(a => {
        if (!a) return;
        a.addEventListener('play',  () => estadoMidiaSistema(true));
        a.addEventListener('pause', () => estadoMidiaSistema(tocandoAgora()));
    });

    /* Trocou o acabamento: redesenha o anel com a nova cor */
    new MutationObserver(() => {
        if (modoJogoAtivo() && !document.body.classList.contains('game-reveal')) atualizarMidiaSistema(null, true);
        else atualizarMidiaSistema(getCurrentSong());
    }).observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
}
