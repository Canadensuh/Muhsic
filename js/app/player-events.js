/* ============================================================
   MUHSIC — APP / PLAYER-EVENTS.JS
   ------------------------------------------------------------
   Interações com o vinil compacto (barra inferior):
     clique ............ play / pause
     girar (arrastar) .. próxima / anterior
     scroll ............ volume
     duplo clique ...... curtir
     botão direito ..... menu (aleatório / maximizar)
     (arrastar discos até a vitrola: js/app/disc-drag.js)
   ============================================================ */

let isDragging        = false;
let dragStartMouseAng = 0;
let dragStartDiskAng  = 0;
let dragTotalRotation = 0;
let dragMoved         = false;

/* ============================================================
   MODO DE CONTROLE  (chave MANUAL / BOTÕES na vitrola)
     manual  → gestos no disco: girar troca a faixa, scroll = volume
     buttons → teclado e volume −/+ visíveis; giro e scroll desligados
   Clique (tocar/pausar), duplo clique (curtir) e botão direito
   (menu) funcionam nos dois modos. A escolha é salva por usuário.
   ============================================================ */
let controlMode = CONTROL_MODES.manual;

function isManualMode() {
    return controlMode === CONTROL_MODES.manual;
}

function setControlMode(mode, salvar = true) {
    controlMode = mode === CONTROL_MODES.buttons ? CONTROL_MODES.buttons : CONTROL_MODES.manual;
    const botoes = controlMode === CONTROL_MODES.buttons;
    document.body.classList.toggle('controls-buttons', botoes);
    document.body.classList.toggle('controls-manual', !botoes);
    $('controlModeSwitch')?.setAttribute('aria-checked', String(botoes));
    if (salvar) Store.set(STORAGE_KEYS.controls(currentUserId), controlMode);
}

/** Modo salvo; sem escolha salva, telas de toque começam em BOTÕES */
function loadControlMode() {
    const salvo = Store.get(STORAGE_KEYS.controls(currentUserId), null);
    const toque = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    setControlMode(salvo || (toque ? CONTROL_MODES.buttons : CONTROL_MODES.manual), false);
}

function bindControlModeSwitch() {
    $('controlModeSwitch')?.addEventListener('click', (e) => {
        e.currentTarget.blur();
        playClickSound();
        setControlMode(isManualMode() ? CONTROL_MODES.buttons : CONTROL_MODES.manual);
    });
}

/* ============================================================
   CLIQUE SIMPLES × DUPLO CLIQUE NO DISCO
   Um clique = tocar/pausar; dois cliques = curtir. O clique simples
   espera PLAYER.dblClickMs: se vier um segundo clique nesse tempo,
   era um duplo clique (o evento "dblclick" curte) e a música NÃO pausa.
   Usado pelo disco da vitrola e pelo do modo vitrine.
   ============================================================ */
let timerCliqueDisco = null;

function cliqueNoDisco() {
    if (timerCliqueDisco) {                 // 2º clique: é duplo clique
        clearTimeout(timerCliqueDisco);
        timerCliqueDisco = null;
        return;
    }
    /* No Guess the Music o duplo clique não curte: responde na hora */
    if (typeof modoJogoAtivo === 'function' && modoJogoAtivo()) { togglePlay(); return; }

    timerCliqueDisco = setTimeout(() => {
        timerCliqueDisco = null;
        togglePlay();
    }, PLAYER.dblClickMs);
}

/* ---------- Menu de contexto ---------- */
function isContextMenuOpen() {
    return !!(contextMenu && contextMenu.classList.contains('visible'));
}

function openContextMenu() {
    if (modoJogoAtivo()) return;
    if (contextMenu) contextMenu.classList.add('visible');
    if (ctxRandomBtn) ctxRandomBtn.classList.toggle('active', state.isShuffled);
}

function closeContextMenu() {
    if (contextMenu) contextMenu.classList.remove('visible');
}

/* ============================================================
   BIND
   ============================================================ */
function bindPlayerEvents() {
    if (!audio || !vinylWrapper) return;

    bindAudioEvents();
    bindProgressBar();
    bindVinylGestures();

    if (ctxRandomBtn) ctxRandomBtn.addEventListener('click', (e) => {
        e.stopPropagation(); closeContextMenu(); embaralharProximas();
    });
    if (ctxMaximizeBtn) ctxMaximizeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); closeContextMenu(); abrirMaxPanel();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeContextMenu();
    });

    /* O áudio só começa quando o braço termina de descer */
    if (tonearmArm) {
        tonearmArm.addEventListener('transitionend', (e) => {
            if (e.propertyName !== 'transform') return;
            if (tonearm && tonearm.classList.contains('active') && pendingPlay) {
                pendingPlay = false;
                audio.play().catch(() => {});
            }
        });
    }
}

/* ---------- Eventos do <audio> ---------- */
function bindAudioEvents() {
    audio.addEventListener('play', () => {
        clearTimeout(brakeTimeoutId);
        if (vinyl) vinyl.style.transition = 'none';
        startSpin();
        state.isPlaying = true;
        updateHighlight();
        baixarBraco();
        if (maxPanel && maxPanel.classList.contains('open')) startMaxSpin();
        if (currentPlayingSongId) Store.set(STORAGE_KEYS.lastSong, currentPlayingSongId);
        document.body.classList.add('is-playing');      // LEDs, VU e botão play no CSS
    });

    audio.addEventListener('pause', () => {
        brakeAndStop();
        levantarBraco();
        if (maxVinyl) maxBrakeAndStop();
        state.isPlaying = false;
        updateHighlight();
        document.body.classList.remove('is-playing');
    });

    audio.addEventListener('loadedmetadata', () => {
        const d = audio.duration;
        if (!isFinite(d) || d <= 0) return;
        if (durationEl) durationEl.textContent = formatTime(d);
        const track = getCurrentSong();
        if (!track) return;
        track.duration = d;
        const el = document.querySelector(`.vinyl-item[data-id="${track.id}"] .shelf-duration`);
        if (el) el.innerHTML = `<i class="far fa-clock"></i> ${formatTime(d)}`;
    });

    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        if (progress) progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
        if (audio.currentTime > PLAYER.restartThreshold) musicaReiniciada = false;
    });

    audio.addEventListener('ended', () => nextTrack());
}

/* ---------- Barra de progresso (clique para pular) ---------- */
function bindProgressBar() {
    if (!progressBar) return;
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        if (modoJogoAtivo()) return;            // não dá para pular o trecho do jogo
        const pct = (e.clientX - rect.left) / rect.width;
        if (!isNaN(audio.duration)) audio.currentTime = pct * audio.duration;
    });
}

/* ---------- Gestos no vinil ---------- */
function bindVinylGestures() {
    vinylWrapper.addEventListener('wheel', (e) => {
        if (!isManualMode()) return;               // modo BOTÕES: scroll normal
        e.preventDefault(); e.stopPropagation();
        if (isContextMenuOpen()) return;
        applyVolume(state.volume + (e.deltaY > 0 ? -PLAYER.volumeStep : PLAYER.volumeStep));
        showVolumeOverlay();
    }, { passive: false });

    vinylWrapper.addEventListener('contextmenu', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (isContextMenuOpen()) closeContextMenu();
        else openContextMenu();
    });

    vinylWrapper.addEventListener('dblclick', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (isContextMenuOpen()) return;
        toggleLikeCurrent();
    });

    vinylWrapper.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || isContextMenuOpen()) return;
        isDragging = true;
        dragStartMouseAng = getMouseAngleFor(vinylWrapper, e);
        dragStartDiskAng = accumulatedAngle;
        dragTotalRotation = 0;
        dragMoved = false;
        clearTimeout(brakeTimeoutId);
        if (vinyl) vinyl.style.transition = 'none';
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const cur = getMouseAngleFor(vinylWrapper, e);
        dragTotalRotation += angleDiff(cur, dragStartMouseAng);
        dragStartMouseAng = cur;

        /* Modo BOTÕES: o disco não gira com o mouse (só detecta o clique) */
        if (!isManualMode()) {
            if (Math.abs(dragTotalRotation) > CLICK_TOLERANCE) dragMoved = true;
            return;
        }

        if (!dragMoved && Math.abs(dragTotalRotation) > CLICK_TOLERANCE) {
            dragMoved = true;
            cancelAnimationFrame(rafId);
            vinylWrapper.classList.add('dragging');
        }
        if (dragMoved) applyAngle(dragStartDiskAng + dragTotalRotation);
    });

    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        vinylWrapper.classList.remove('dragging');
        const total = dragTotalRotation;

        if (!isManualMode()) {                     // modo BOTÕES: só clique
            if (!dragMoved) cliqueNoDisco();
            dragTotalRotation = 0;
            return;
        }

        if (total >= SWAP_THRESHOLD) {             // girou para frente
            accumulatedAngle = dragStartDiskAng + total;
            nextTrack();
        } else if (total <= -SWAP_THRESHOLD) {     // girou para trás
            accumulatedAngle = dragStartDiskAng + total;
            prevTrack();
        } else if (!dragMoved) {                   // foi só um clique
            cliqueNoDisco();
        } else {                                   // giro curto: volta ao lugar
            accumulatedAngle = dragStartDiskAng;
            if (vinyl) vinyl.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)';
            applyAngle(accumulatedAngle);
            setTimeout(() => {
                if (vinyl) vinyl.style.transition = 'none';
                if (audio && !audio.paused) startSpin();
                else if (modoJogoAtivo()) retomarGiroJogo();
            }, 420);
        }
        dragTotalRotation = 0;
    });
}

/* ---------- Teclado físico da vitrola (botões do deck) ---------- */
function bindDeckControls() {
    const acoes = {
        deckPrev:    () => prevTrack(),
        deckPlay:    () => togglePlay(),
        deckNext:    () => nextTrack(),
        deckShuffle: () => embaralharProximas(),
        deckLike:    () => toggleLikeCurrent(),
        deckMax:     () => abrirMaxPanel(),
        deckVolDown: () => { applyVolume(state.volume - PLAYER.volumeStep * 2); showVolumeOverlay(); },
        deckVolUp:   () => { applyVolume(state.volume + PLAYER.volumeStep * 2); showVolumeOverlay(); }
    };

    Object.entries(acoes).forEach(([id, acao]) => {
        $(id)?.addEventListener('click', (e) => {
            e.currentTarget.blur();     // Espaço não "clica" de novo no botão focado
            playClickSound();
            acao();
        });
    });

    /* Som de tecla em todos os outros botões .key do app */
    document.querySelectorAll('.key').forEach(k => {
        if (k.id && acoes[k.id]) return;
        k.addEventListener('click', playClickSound);
    });
}

