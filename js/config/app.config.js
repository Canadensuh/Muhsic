/* ============================================================
   MUHSIC — CONFIG / APP.CONFIG.JS
   ------------------------------------------------------------
   Configuração central do projeto. Qualquer valor "mágico"
   usado em mais de um lugar deve morar aqui.

   Carregado PRIMEIRO em todas as páginas.
   ============================================================ */

/* ---------- Identidade do projeto ---------- */
const APP = {
    name:    'Muhsic',
    stage:   'BETA',
    version: '2.0',
    author:  'Murilo N.B',
    org:     'MPS — MapleProjectSeries'
};

/* ---------- Chaves do localStorage ----------
   Chaves com função recebem o ID do usuário, para que
   cada conta tenha seus próprios dados no mesmo navegador. */
const STORAGE_KEYS = {
    session:  'muhsic_session',
    users:    'muhsic_users',
    lastSong: 'muhsic_lastSongId',
    theme:    (userId) => `muhsic_theme_${userId}`,
    likes:    (userId) => `muhsic_likes_${userId}`,
    controls: (userId) => `muhsic_controls_${userId}`,
    game:     (userId) => `muhsic_game_${userId}`      // recordes do Guess the Music
};

/* ---------- ID reservado ----------
   Músicas com userIds contendo 0 aparecem para todos. */
const GLOBAL_USER_ID = 0;

/* ---------- Mídias (identidade local em assets/img, sons no Cloudinary) ---------- */
const ASSETS = {
    logo:          'assets/img/muhsic-mark.svg',
    logoFade:      'assets/img/muhsic-mark.svg',
    folderLogo:    'assets/img/mark-bars.svg',
    likedCover:    'assets/img/liked-cover.svg',
    sounds: {
        click: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786688312/TapClick.wav',
        intro: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786685196/StartTypo.wav'
    }
};

/* ---------- Comportamento do player ---------- */
const PLAYER = {
    queueSize:         5,     // faixas listadas em "Próximas" na vitrola
    maxVisibleQueue:   7,     // itens em "A seguir" no painel maximizado
    maxHistory:        50,    // músicas lembradas pelo botão "anterior"
    dblClickMs:        300,   // espera antes do clique simples no disco virar play/pausa
    restartThreshold:  3,     // segundos: antes disso "anterior" volta a faixa
    degreesPerSecond:  90,    // velocidade do vinil (1 volta a cada 4s)
    swapThreshold:     60,    // graus de giro manual para trocar de faixa
    clickTolerance:    6,     // graus tolerados antes de virar "arraste"
    defaultVolume:     0.7,
    volumeStep:        0.05,  // incremento por "scroll" no vinil
    ringCircumference: 289,   // 2πr do anel SVG de volume (r = 46)
    searchDebounceMs:  300,
    durationTimeoutMs: 8000   // tempo máximo para ler a duração real do áudio
};

/* ---------- Modos de controle da vitrola ----------
   manual  → gestos no disco (girar, scroll, duplo clique...)
   buttons → teclado da vitrola visível; gestos de giro e scroll desligados */
const CONTROL_MODES = { manual: 'manual', buttons: 'buttons' };

/* ---------- Acabamentos do aparelho (cores em css/themes/themes.css) ----------
   id      → valor de <body data-theme="..."> (os antigos foram mantidos)
   tone    → 'dark' ou 'light' (temas claros recebem ajustes de contraste)
   preview → 4 cores mostradas no seletor: fundo, painel, madeira, acento */
const THEMES = [
    { id: 'default',  name: 'Sunset 86',  tone: 'dark',  preview: ['#160f0b', '#2e1f17', '#7b482a', '#e8702a'] },
    { id: 'light',    name: 'Papel',      tone: 'light', preview: ['#d9c8a4', '#f6ecd4', '#9a6c45', '#c4452c'] },
    { id: 'graphite', name: 'Grafite',    tone: 'dark',  preview: ['#0e0f10', '#242528', '#3a3c40', '#d0574a'] },
    { id: 'cocoa',    name: 'Cacau',      tone: 'dark',  preview: ['#140c09', '#2c1c14', '#73412a', '#c98b4a'] },
    { id: 'red',      name: 'Cereja',     tone: 'dark',  preview: ['#1a0d0f', '#351a1e', '#7a3236', '#d2364b'] },
    { id: 'orange',   name: 'Mel',        tone: 'dark',  preview: ['#1a1206', '#352510', '#8f5c25', '#e09a1f'] },
    { id: 'green',    name: 'Oliva',      tone: 'dark',  preview: ['#10140c', '#242c1c', '#5e5730', '#8fa858'] },
    { id: 'coast',    name: 'Litoral 85', tone: 'dark',  preview: ['#0b1716', '#182f2d', '#73593d', '#e8806a'] },
    { id: 'blue',     name: 'Cobalto',    tone: 'dark',  preview: ['#0c1220', '#1b2640', '#2a3b5e', '#3f7fc4'] },
    { id: 'purple',   name: 'Vinil',      tone: 'dark',  preview: ['#160d17', '#2f1b31', '#5c335f', '#a65597'] },
    { id: 'arcade',   name: 'Fliperama',  tone: 'dark',  preview: ['#0f0b1a', '#221a34', '#2e2544', '#d9488f'] },
    { id: 'mint',     name: 'Menta',      tone: 'light', preview: ['#c8d8cc', '#eef4ec', '#b8946c', '#2f8f86'] }
];
const THEME_IDS = THEMES.map(t => t.id);
const DEFAULT_THEME = 'default';

/* ---------- Jogo GUESS THE MUSIC (js/app/game.js) ---------- */
const GAME = {
    /* Dificuldade: duração do trecho e pontos por acerto no SCORE */
    levels: [
        { id: 'facil',   name: 'Fácil',   seconds: 5, points: 100 },
        { id: 'medio',   name: 'Médio',   seconds: 3, points: 200 },
        { id: 'dificil', name: 'Difícil', seconds: 1, points: 300 }
    ],
    choices:     4,      // discos (alternativas) por rodada, lado a lado
    mixRounds:   12,     // rodadas do MIX (os gêneros usam todas as faixas)
    mixCoverMs:  5000,   // a capa do MIX troca as 4 capas a cada 5 s
    resultMs:    2200,   // tempo da animação de acerto/erro
    mixId:       '__mix__'
};

/* ---------- Nome fixo da coleção de músicas curtidas ---------- */
const LIKED_COLLECTION = 'Discos curtidos';
