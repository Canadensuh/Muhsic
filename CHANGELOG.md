# Changelog

Todas as mudanças relevantes do Muhsic são registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [v1.0] — 2026-11-25 · MUHSIC v1.0 (versão oficial)

### Lançamento oficial
- O Muhsic saiu do BETA: a numeração recomeça em **v1.0**, sucedendo a BETA 2.0.
- O selo de versão (`.version-badge`) agora mostra **v1.0** ao lado da marca MUHSIC
  (`APP.stage = 'OFICIAL'`, `APP.version = '1.0'`); a ficha técnica da landing exibe
  "MS-86 · MUHSIC v1.0". README e ARQUITETURA atualizados.
- Cache dos scripts e do CSS renovado (`?v=3`) para carregar o novo catálogo.

### Catálogo: 44 músicas novas (IDs 1200–1243)
- Títulos e créditos conferidos por pesquisa. Participações (feat.) ficam no campo de
  artista. Correções em relação aos nomes enviados: *Pink + White*, *So Fresh, So Clean*,
  *Can't Take My Eyes Off You*, *A Man Without Love*, *Wat's Wrong* (artista principal:
  Isaiah Rashad), *Jugaste y Sufrí*, *Se Encendió el Beeper*, **LANDMVRKS**,
  **Eslabon Armado**, **Hikaru Utada**, **Supermerk2**, **Brandão85**.
- **Novos gêneros:** **Regional Mexicano** (Eslabon Armado), **Cumbia** (Supermerk2,
  La Sonora Dinamita) e **Merengue** (Oro Sólido, Elvis Crespo).
- **Metal (+11):** People = Shit, Arsenal (Slipknot), Kingslayer, Shadow Moses,
  The House of Wolves (Bring Me The Horizon), Ball Tongue (Korn), Flores (LVCAS),
  Joseph (Falling In Reverse, Corey Taylor, Serj Tankian), Nothing Else Matters
  (Metallica), Sulfur (LANDMVRKS), Behelit (Slaughter To Prevail).
- **Hip Hop (+7):** Like That, Money Trees, Swimming Pools (Drank), Wat's Wrong,
  Roses, All Mine, So Fresh, So Clean.
- **Pop (+6):** Born Again (LISA, Doja Cat, RAYE), Gabriela (KATSEYE),
  idontwannabeyouanymore (Billie Eilish), Can't Take My Eyes Off You e A Man Without
  Love (Engelbert Humperdinck), Put Your Head on My Shoulder (Paul Anka).
- **Trap (+5):** 100% MOLHO, D&G, EM DIREÇÃO DO SOL, BLUNT DE GOIABA (Brandão85) e
  Isso é Sério (Matuê, Brandão85).
- **Outros:** ICONIC BY MISTAKE (K-POP), 死神 e JANE DOE (J-POP), Pink + White e
  BITCHES BREW (R&B), Mice City (Indie), Cryogen (Rock), L-O-V-E (Jazz).

## [2.0] — 2026-11-13 · BETA 2.0

### Catálogo revisado (gêneros e créditos)
- Gêneros reorganizados com base em pesquisa. Novos gêneros: **Alternativo** (Gorillaz),
  **Rap Nacional** (Baco, BK, 2ZDinizz, Matchola, LEALL), **Funk** (JETSKI, Dupê)
  e **Dancehall** (Sean Paul). O gênero "Underground" foi absorvido pelo Rap Nacional.
- Músicas trocadas de gênero: Master Of Puppets → Metal; Go Bananas, The Largest e
  Beautiful → Hip Hop; After The Storm e Miami → R&B.
- Participações (feat.) saíram do título e foram para o campo de artista
  (ex.: *Monster*, *STRATEGY*, *SPAGHETTI*, *Yellowjacket*, *COME SAY SUM*).
- Nomes corrigidos: Engine No. 9, Arctic Monkeys, The Night Begins to Shine,
  Cheios do Espírito Santo.

### Novo: jogo GUESS THE MUSIC
- A aba **Coleção** saiu do menu (a **Buscar** já mostra todos os discos e ainda
  filtra) e deu lugar ao jogo **Guess the Music** (`js/app/game.js`, `css/pages/game.css`).
- **Tela título de jogo:** visor de **SCORE** com a **foto do perfil** (ou a inicial),
  tecla **Placar** (tabela por gênero: recorde em cada dificuldade, partidas, acertos
  e pontos) e tecla **Resetar pontos** (com confirmação).
- **Gêneros como pastas**, iguais às capas do Início, com o mesmo carimbo. O **MIX** é a
  pasta maior: 4 capas sorteadas que **trocam a cada 5 segundos** e, no hover, 4 discos
  girando.
- **Dificuldade** ao escolher o gênero: **Fácil** (trecho de 5 s, +100 por acerto),
  **Médio** (3 s, +200) e **Difícil** (1 s, +300).
- **Rodada:** 4 discos grandes lado a lado `( ) ( ) ( ) ( )`; respondeu, vem a próxima
  rodada com 4 discos novos. Gênero: uma rodada por música. MIX: 12 rodadas.
- **O trecho toca na vitrola do painel direito**, só quando o jogador clica no disco
  (ou Play/Espaço). O selo vira um **"?"** e o visor mostra "??? / ???" e só a
  **duração real** da música. Clicar de novo pausa/continua; quando o trecho acaba,
  clicar toca de novo; girar para trás também repete. O volume funciona (scroll ou
  −/+). Próxima, anterior, embaralhar, curtir e modo vitrine ficam desligados.
- A lista **"Próximas" vira "Opções"**: as 4 músicas da rodada (A–D), clicáveis.
- **"Tem certeza?"** com o logo do Muhsic no canto (nas cores do acabamento, como em todas as janelas do jogo), o disco girando, o nome da música
  e o artista; **NÃO** (vermelho) à esquerda e **SIM** (verde) à direita.
- Ao responder, a **vitrola revela a capa** no lugar do "?" e mostra título e artista.
  O carimbo **ACERTOU! / ERROU!** cobre só a tela central, sem tampar a vitrola.
- Placar final com classificação e recorde por gênero e dificuldade (`muhsic_game_<id>`).

### Interface mais limpa
- Saíram textos de explicação ("Perfil carregado", "Escolha uma pasta, puxe um
  disco...", "Arraste um disco até a vitrola", "Clique para tocar") e as dicas que
  apareciam ao parar o mouse sobre botões e discos (viraram `aria-label`, lidas só por
  leitores de tela).

### Player
- **Chave MANUAL / BOTÕES** na vitrola. *Manual*: gestos no disco (girar troca a
  faixa, scroll muda o volume). *Botões*: aparecem o teclado
  e o volume −/+, e o giro e o scroll do disco ficam desligados. A escolha é salva
  por usuário. No **celular** (layout até 900px) fica travada em **Botões**, porque
  segurar e arrastar não funciona bem no toque.
- **Clicar para tocar** no modo Botões: um clique no disco da prateleira já o leva
  voando até a vitrola. No modo Manual continua sendo preciso arrastar.
- **Barra de mídia do sistema** (Media Session API): ao usar as teclas de mídia, a
  barra do Windows mostra o **disco** da música atual (capa no selo, anel na cor do
  tema), título, artista e tocar/pausar/próxima/anterior. No Guess the Music aparece
  um disco "?" com título "???" e sem próxima/anterior.
- **Embaralhar** agora sorteia de novo só as **próximas** faixas (sem repetir) e não
  troca a música que está tocando. Cada clique gera uma nova sequência.
- **Próximas faixas** em lista, uma embaixo da outra (número, disco, título, artista,
  duração), igual ao "A seguir" do modo vitrine. A fila passou de 3 para 5 faixas.
- **Disco preso ao cursor:** ao segurar um disco da prateleira, só o disco sai e
  acompanha o mouse girando; a etiqueta fica no lugar. Solto na vitrola, ele pousa no
  prato e toca; solto fora, volta para a prateleira. No toque, um toque no disco toca.
- **Freio ao pausar** também nos discos da prateleira (avança um pouco e volta), e o
  disco fica parado no ângulo em que estava, em vez de voltar ao início.
- **Discos Curtidos** passou a ser a primeira seção do rack lateral.
- **Duplo clique para curtir não pausa mais a música:** o clique simples espera um
  instante (300 ms) para saber se vem um segundo clique.
- Todo **disco curtido** ganha o cartãozinho **♥** em cima, em qualquer prateleira
  (pastas, Buscar e Discos curtidos); clicar nele tira a curtida.
- No modo Botões, a tecla **♥** fica **afundada** (com LED aceso) quando a música
  já é curtida; apertar de novo descurte e o disco sai de Discos Curtidos.
- O **logo** do rack (e da tela de carregamento) agora acompanha as cores do
  acabamento.

### Acabamentos
- De 7 para **12 acabamentos**, que agora mudam a **tela inteira**: fundo e brilhos,
  painéis, parafusos, madeira, metal, texto, acento, as 4 faixas, visor LCD e, no
  Grafite, as teclas: **Sunset 86, Papel, Grafite, Cacau, Cereja, Mel, Oliva,
  Litoral 85, Cobalto, Vinil, Fliperama e Menta**.
- O seletor é gerado a partir de `THEMES` (`js/config/app.config.js`) e mostra
  4 cores de cada acabamento.
- Acabamentos claros (Papel, Menta) recebem ajustes de contraste via `data-tone`.

### Perfil
- Só o perfil **Muh.png (Murilo N.B)** tem foto. Os outros mostram a **inicial do
  nome** sobre as **cores do acabamento** (muda com o tema), bem desenhada também no
  SCORE do jogo. A foto vem do cadastro (`js/data/users.js`), então
  uma sessão antiga não "herda" a foto de outro perfil.

### Landing
- O disco da vitrola ilustrada estava oval (inclinação 3D) e o logo do selo cortado;
  agora o disco é redondo e o "M" fica inteiro e centralizado.
- A janela de login/cadastro não mostra mais os perfis de teste.
- Textos atualizados (12 acabamentos, embaralhar, chave Manual/Botões).

### Corrigido
- O carimbo "M" das capas e do selo não aparecia ao abrir o site direto do disco
  (`file://`): a máscara agora é embutida no CSS.
- Em listas curtas a fila repetia a própria faixa que estava tocando.
- Curtir depois de abrir outra lista (Buscar, outra pasta) podia curtir a faixa
  errada: a "faixa atual" agora é a que está na vitrola, não a posição na lista.
- Abrir uma pasta do rack estando em Buscar deixava as duas telas visíveis.

## [0.7] — 2026-11-10 · Identidade "Hi-Fi anos 80"

### Visual (nova identidade)
- O verde e cinza no estilo Spotify deram lugar a uma paleta própria dos anos 80:
  café, madeira, creme, laranja *sunset*, mostarda, tijolo e verde-água.
- Todos os botões viraram **teclas de teclado antigo** (bege amarelado, com relevo,
  legenda no canto, LED de "ligado" e som de clique) — `components/keycaps.css`.
- Visores **LCD âmbar** para título da música, tempo, busca, formulários e selos.
- Efeitos de "tela de jogo": scanlines de CRT, vinheta e granulado (`base/effects.css`).
- Logo, capa de curtidos e carimbo das capas refeitos em SVG (`assets/img/`).
- Fontes Bungee (títulos), VT323 (LCD) e Rubik (texto).

### Landing page
- Refeita como "tela título" de jogo e apresentação completa do produto:
  hero com vitrola ilustrada animada, letreiro de LCD, recursos, "Como tocar"
  (passos e tabela de controles), "Selecione seu plano" com valores fictícios,
  ficha técnica e chamada final.
- Modal de login/cadastro virou a janela "Seleção de perfil".
- Os cards de plano abrem o cadastro com o plano já selecionado.

### App (pós-login)
- Novo layout de 3 painéis: **rack** de discos, **tela** central e um
  **toca-discos hi-fi** completo no lado direito, que agora é o player.
- O toca-discos tem prato com marcas estroboscópicas, braço com contrapeso,
  visor LCD com VU meter, fila clicável, teclado de controle e medidor de volume.
- A mecânica de **arrastar o disco até a vitrola** continua; agora o prato pulsa
  e mostra "SOLTE O DISCO AQUI" durante o arraste.
- Pastas com textura de papel e faixa sunset; prateleira de madeira com etiquetas.
- "Modo maximizado" virou **modo vitrine** em tela cheia, com botão de fechar.
- Temas renomeados para "acabamentos": Sunset, Papel, Cereja, Cobalto, Vinil,
  Oliva e Âmbar. O tema Papel (claro) foi refeito.
- Celular: o rack vira barra superior e a vitrola uma faixa compacta embaixo.

### Corrigido
- Botão "anterior" logo após avançar pela fila não voltava para a faixa
  anterior (a faixa nova ia para o histórico). Problema existente desde a 0.5.

## [0.6] — 2026-11-10

### Reestruturado
- O CSS saiu de um arquivo único de 2.639 linhas (`style.css`) para 20 módulos
  organizados em `base/`, `layout/`, `components/`, `player/`, `pages/` e `themes/`,
  carregados por `css/app.css` na mesma ordem de cascata de antes.
- O JavaScript saiu de um `script.js` de 1.687 linhas para módulos em camadas:
  `config/`, `data/`, `core/`, `pages/` e `app/` (com `app/views/`).
- Configurações centralizadas em `js/config/app.config.js`: versão, chaves do
  localStorage, URLs de mídia e parâmetros do player.
- Planos definidos em um único lugar (`js/config/plans.js`).
- Acesso ao localStorage centralizado no objeto `Store` (`js/core/storage.js`).
- Regras de login e cadastro separadas da interface (`js/core/auth.js`).

### Corrigido
- A troca de tema não funcionava: `applyTheme()` e `loadTheme()` eram chamadas
  mas não existiam. Agora o tema é aplicado e salvo por usuário.
- `getPlanConfig()` estava definida duas vezes com cores diferentes.
- Nomes de usuário inseridos via `innerHTML` agora são escapados (`escapeHTML`).
- Uma falha em qualquer etapa da inicialização aparece no console em vez de ser
  silenciada.

### Adicionado
- As curtidas (músicas e álbuns) são salvas por usuário e permanecem após
  recarregar a página.
- O selo de versão (`BETA 0.6`) é preenchido a partir de `APP.version`.
- `ARQUITETURA.txt` com a documentação técnica completa.
- `.editorconfig`, `.gitattributes` e `.gitignore`.

### Removido
- `js/register.js`: não era carregado por nenhuma página.
- Cópia duplicada do código de cadastro que estava no final de `musics.js`.
- Uso de `eval()` na leitura dos usuários.
- Variáveis e funções sem uso (`shuffleQueue`, `DBLCLICK_DELAY`, `clickTimeout`,
  `findUserById`, `getSongOrigin`).

### Renomeado
| Antes | Depois |
|-------|--------|
| `js/musics.js` | `js/data/songs.js` |
| `js/users.js` | `js/data/users.js` |
| `js/login.js` | `js/core/session.js` + `js/core/auth.js` + `js/pages/landing.js` |
| `js/script.js` | `js/app/*.js` |
| `css/style.css` | `css/app.css` + módulos |
| `css/landing.css` | `css/pages/landing.css` |
| `css/perso.css` | `css/themes/themes.css` |

## [0.5] — Identidade de vinil
- Vitrola animada, fila em pilha, painel maximizado e pastas de vinil.
- Login, planos, músicas exclusivas por usuário e busca sem acentos.
