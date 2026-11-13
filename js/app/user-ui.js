/* ============================================================
   MUHSIC — APP / USER-UI.JS
   Dados do usuário na tela e recursos liberados pelo plano.
   ============================================================ */

function applyUserToUI() {
    const userNameEl = $('userName');
    const greetingEl = $('greetingUser');
    const avatarEl   = $('userAvatar');
    const planInfoEl = $('planInfo');

    if (userNameEl) userNameEl.textContent = currentUserName;
    if (greetingEl) greetingEl.textContent = currentUserName;
    renderAvatar(avatarEl);
    if (planInfoEl) planInfoEl.textContent = currentPlanCfg.label;

    const planInfoRow = $('planInfoRow');
    if (planInfoRow) {
        planInfoRow.innerHTML = `<i class="fas fa-crown"></i> Plano: ${escapeHTML(currentPlanCfg.label)}`;
        planInfoRow.style.color = currentPlanCfg.color;
    }

    /* Recursos por plano */
    const adBanner = $('adBanner');
    if (adBanner) adBanner.style.display = currentPlanCfg.showAds ? 'block' : 'none';

    const grid   = $('themeGrid');
    const locked = $('settingsLocked');
    if (grid)   grid.classList.toggle('locked', !currentPlanCfg.hasThemes);
    if (locked) locked.style.display = currentPlanCfg.hasThemes ? 'none' : 'block';
}

/* ============================================================
   AVATAR
   A foto vem do cadastro do usuário (js/data/users.js), que é a
   fonte da verdade — assim uma sessão antiga não "herda" a foto
   de outro perfil. Sem foto, mostra a inicial do nome sobre uma
   cor fixa para aquele nome.
   ============================================================ */
function getAvatarUrl() {
    const cadastro = (typeof users !== 'undefined') ? users.find(u => u.id === currentUserId) : null;
    if (cadastro) return cadastro.avatar || null;
    return session.avatar || null;            // contas criadas no navegador
}

/**
 * Foto do perfil ou, sem foto, a inicial do nome.
 * A cor de fundo da inicial vem do acabamento (.avatar-initial em
 * css/layout/header.css), então muda junto com o tema.
 */
function renderAvatar(el) {
    if (!el) return;
    const url = getAvatarUrl();
    if (url) {
        el.classList.remove('avatar-initial');
        el.style.background = '';
        el.innerHTML = `<img src="${url}" alt="Foto de ${escapeHTML(currentUserName)}">`;
        return;
    }
    const inicial = (currentUserName.trim().charAt(0) || '?').toUpperCase();
    el.classList.add('avatar-initial');
    el.style.background = '';
    el.textContent = inicial;
}

/** Logo animado + som ao entrar */
function showLoginAnimation() {
    const anim = $('loginAnimation');
    if (!anim) return;
    anim.classList.add('active');
    void anim.offsetWidth;
    setTimeout(() => {
        new Audio(ASSETS.sounds.intro).play().catch(() => {});
    }, 100);
    setTimeout(() => anim.classList.remove('active'), 2200);
}
