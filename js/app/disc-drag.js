/* ============================================================
   MUHSIC — APP / DISC-DRAG.JS
   ------------------------------------------------------------
   Arrastar um disco da prateleira até a vitrola.
   Só o DISCO sai da prateleira e fica "preso" ao cursor,
   girando; a etiqueta com o título continua no lugar.

     mouse  → segurar e arrastar; soltar sobre a vitrola toca
              a música, soltar fora devolve o disco à prateleira
     toque  → um toque no disco toca a música (arrastar com o
              dedo atrapalharia a rolagem da tela)
   ============================================================ */

const DRAG_START_PX = 6;      // movimento mínimo para virar arraste
const TAP_MAX_PX    = 10;     // tolerância de um "toque" no celular

let discDrag = null;

function bindDiscDrag() {
    document.addEventListener('pointerdown', onDiscPointerDown);
}

function onDiscPointerDown(e) {
    if (e.button !== 0) return;
    const disc = e.target.closest('.vinyl-item .shelf-vinyl');
    if (!disc || e.target.closest('.vinyl-like-btn')) return;
    if (disc.closest('#page-game')) return;          // discos do jogo não são arrastáveis

    const item = disc.closest('.vinyl-item');
    const songId = parseInt(item.dataset.id, 10);
    if (isNaN(songId)) return;

    discDrag = {
        item, disc, songId,
        pointerId: e.pointerId,
        touch: e.pointerType === 'touch',
        startX: e.clientX,
        startY: e.clientY,
        started: false,
        ghost: null,
        size: 0
    };

    if (!discDrag.touch) e.preventDefault();      // evita seleção de texto
    document.addEventListener('pointermove', onDiscPointerMove);
    document.addEventListener('pointerup', onDiscPointerUp);
    document.addEventListener('pointercancel', encerrarArraste);
}

function onDiscPointerMove(e) {
    const d = discDrag;
    if (!d || e.pointerId !== d.pointerId) return;
    const dist = Math.hypot(e.clientX - d.startX, e.clientY - d.startY);

    if (d.touch) {                                 // no celular, mexer = rolar a tela
        if (dist > TAP_MAX_PX) encerrarArraste();
        return;
    }

    if (!d.started) {
        if (dist < DRAG_START_PX) return;
        levantarDisco(d);
    }

    posicionarFantasma(d, e.clientX, e.clientY);
    if (vinylWrapper) vinylWrapper.classList.toggle('drop-target', estaSobreVitrola(e.clientX, e.clientY));
}

function onDiscPointerUp(e) {
    const d = discDrag;
    if (!d || e.pointerId !== d.pointerId) return;

    if (d.touch) {                                 // toque simples: toca a música
        const songId = d.songId;
        encerrarArraste();
        playClickSound();
        playFromShelf(songId);
        return;
    }

    if (!d.started) { encerrarArraste(); return; } // foi só um clique

    if (estaSobreVitrola(e.clientX, e.clientY)) soltarNaVitrola(d);
    else devolverAPrateleira(d);
}

/* ---------- Etapas do arraste ---------- */

/** Cria o disco "fantasma" que segue o cursor */
function levantarDisco(d) {
    d.started = true;
    const r = d.disc.getBoundingClientRect();
    d.size = r.width;
    d.origem = { x: r.left + r.width / 2, y: r.top + r.height / 2 };

    const ghost = document.createElement('div');
    ghost.className = 'vinyl-item disc-ghost';
    ghost.style.width = ghost.style.height = `${d.size}px`;
    ghost.appendChild(d.disc.cloneNode(true));
    document.body.appendChild(ghost);
    d.ghost = ghost;

    d.item.classList.add('disc-lifted');
    document.body.classList.add('is-dragging-disc');
}

/** Centraliza o disco no cursor */
function posicionarFantasma(d, x, y, escala = 1) {
    if (!d.ghost) return;
    d.ghost.style.transform = `translate(${x - d.size / 2}px, ${y - d.size / 2}px) scale(${escala})`;
}

/** O disco foi solto na vitrola: voa até o prato e começa a tocar */
function soltarNaVitrola(d) {
    const alvo = vinylWrapper.getBoundingClientRect();
    const escala = alvo.width / d.size;
    d.ghost.classList.add('is-landing');
    posicionarFantasma(d, alvo.left + alvo.width / 2, alvo.top + alvo.height / 2, escala);

    const songId = d.songId;
    finalizarDepois(d, 320, () => playFromShelf(songId));
}

/** Soltou fora: o disco volta para o lugar dele na prateleira */
function devolverAPrateleira(d) {
    d.ghost.classList.add('is-returning');
    posicionarFantasma(d, d.origem.x, d.origem.y);
    finalizarDepois(d, 300);
}

function finalizarDepois(d, ms, depois) {
    document.removeEventListener('pointermove', onDiscPointerMove);
    document.removeEventListener('pointerup', onDiscPointerUp);
    document.removeEventListener('pointercancel', encerrarArraste);
    if (vinylWrapper) vinylWrapper.classList.remove('drop-target');
    document.body.classList.remove('is-dragging-disc');

    setTimeout(() => {
        d.ghost?.remove();
        d.item.classList.remove('disc-lifted');
        if (depois) depois();
    }, ms);
    discDrag = null;
}

/** Cancela tudo imediatamente (toque que virou rolagem, pointercancel...) */
function encerrarArraste() {
    const d = discDrag;
    if (!d) return;
    if (d.ghost) { finalizarDepois(d, 0); return; }
    document.removeEventListener('pointermove', onDiscPointerMove);
    document.removeEventListener('pointerup', onDiscPointerUp);
    document.removeEventListener('pointercancel', encerrarArraste);
    discDrag = null;
}

/** A área de soltar é a vitrola inteira (prato + base) */
function estaSobreVitrola(x, y) {
    const tt = document.querySelector('.turntable');
    if (!tt) return false;
    const r = tt.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}
