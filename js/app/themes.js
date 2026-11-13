/* ============================================================
   MUHSIC — APP / THEMES.JS
   ------------------------------------------------------------
   Acabamentos do aparelho (planos Muhsic+ e Premium).
   O acabamento é aplicado como <body data-theme="..." data-tone="...">
   e as cores ficam em css/themes/themes.css. A escolha é salva
   por usuário.

   Para criar um acabamento novo:
     1. Adicione um item em THEMES (js/config/app.config.js)
     2. Crie o bloco body[data-theme="id"] em themes.css
   O botão no seletor é gerado automaticamente.
   ============================================================ */

function getThemeConfig(id) {
    return THEMES.find(t => t.id === id) || THEMES.find(t => t.id === DEFAULT_THEME);
}

function getSavedTheme() {
    const t = Store.get(STORAGE_KEYS.theme(currentUserId), DEFAULT_THEME);
    return THEME_IDS.includes(t) ? t : DEFAULT_THEME;
}

function setBodyTheme(theme) {
    const cfg = getThemeConfig(theme);
    document.body.dataset.theme = cfg.id;
    document.body.dataset.tone  = cfg.tone;
}

/** Aplica e salva o acabamento escolhido */
function applyTheme(theme) {
    if (!currentPlanCfg.hasThemes) return;
    setBodyTheme(theme);
    Store.set(STORAGE_KEYS.theme(currentUserId), document.body.dataset.theme);
}

/** Na abertura do app: acabamento salvo (ou o padrão, se o plano não permite) */
function loadTheme() {
    setBodyTheme(currentPlanCfg.hasThemes ? getSavedTheme() : DEFAULT_THEME);
}

function markActiveTheme() {
    const atual = document.body.dataset.theme || DEFAULT_THEME;
    document.querySelectorAll('.theme-swatch').forEach(sw => {
        sw.classList.toggle('active', sw.dataset.theme === atual);
    });
}

/** Gera um botão (tecla) para cada acabamento de THEMES */
function renderThemeGrid() {
    const grid = $('themeGrid');
    if (!grid) return;
    grid.innerHTML = THEMES.map(t => `
        <button class="key theme-swatch" data-theme="${t.id}">
            <span class="swatch-colors">
                ${t.preview.map(c => `<span style="background:${c}"></span>`).join('')}
            </span>
            <span class="swatch-name">${escapeHTML(t.name)}</span>
        </button>
    `).join('');
}

/* ---------- Modal de acabamentos ---------- */
function bindSettings() {
    const modal = $('settingsModal');
    if (!modal) return;

    renderThemeGrid();

    const abrir  = () => { modal.classList.add('active'); markActiveTheme(); };
    const fechar = () => modal.classList.remove('active');

    $('openSettings')?.addEventListener('click', abrir);
    $('closeSettings')?.addEventListener('click', fechar);
    modal.addEventListener('click', e => { if (e.target === modal) fechar(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') fechar(); });

    document.querySelectorAll('.theme-swatch').forEach(sw => {
        sw.addEventListener('click', () => {
            if (!currentPlanCfg.hasThemes) return;
            playClickSound();
            applyTheme(sw.dataset.theme);
            markActiveTheme();
        });
    });
}
