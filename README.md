# 🎵 Muhsic

> Player de música com alma de **vitrola dos anos 80**, feito em HTML, CSS e JavaScript puro.
> Projeto acadêmico do grupo **MPS — MapleProjectSeries**.

![Status](https://img.shields.io/badge/status-BETA-orange)
![Versão](https://img.shields.io/badge/versão-2.0-blue)
![Stack](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20JS-orange)
![Dependências](https://img.shields.io/badge/frameworks-nenhum-lightgrey)
![Licença](https://img.shields.io/badge/licença-MPS-red)

---

## 📖 Sobre o projeto

**Muhsic** é um player de música desenvolvido como trabalho de faculdade por
**Murilo N.B**. Em vez de botões tradicionais, a interface é uma **vitrola**:
o disco gira enquanto a música toca, o braço desce sobre o vinil e o usuário
controla tudo com gestos — girar o disco troca de faixa, rolar o mouse muda o
volume e dois cliques curtem a música.

O sistema tem login, três planos de assinatura, temas de cor e músicas
exclusivas por usuário. O "backend" é **simulado**: os dados ficam em arquivos
`.js` e as preferências de cada usuário no `localStorage` do navegador.

### Identidade visual

O Muhsic tem identidade própria, inspirada nos aparelhos de som dos anos 80 e
com cara de **tela de jogo** — nada de cópia de app de streaming:

| Elemento | Como é |
|----------|--------|
| **Paleta** | Café e madeira, com creme, laranja *sunset*, mostarda, tijolo e verde-água (as faixas listradas clássicas da época) |
| **Botões** | Teclas de teclado antigo, bege amarelado, com relevo, legenda no canto, LED de "ligado" e som de clique |
| **Visores** | LCD âmbar com brilho e scanlines (título da música, tempo, busca, formulários) |
| **Tela** | Três painéis com parafusos nos cantos — **rack** de discos, **tela** central e o **toca-discos hi-fi** à direita |
| **Efeitos** | Scanlines de CRT, vinheta, granulado de papel nas capas, VU meter animado |
| **Tipografia** | Bungee (títulos), VT323 (LCD) e Rubik (texto) |

### Objetivos acadêmicos

- Construir uma aplicação completa **sem frameworks**, dominando o DOM, eventos
  e a Web Audio/HTML5 Audio API.
- Aplicar **arquitetura em camadas** (configuração → dados → núcleo → interface)
  em um projeto front-end.
- Explorar animação com `requestAnimationFrame`, transições CSS e leitura de
  pixels com `<canvas>`.

---

## ✨ Funcionalidades

| Área | O que faz |
|------|-----------|
| 🎧 **Toca-discos hi-fi** | Painel direito com prato, braço, visor LCD e VU meter. O disco gira em tempo real, freia ao pausar e o braço desce antes do play |
| 🖱️ **Gestos** | Clique = play/pause · Girar = próxima/anterior · Scroll = volume · Duplo clique = curtir (sem pausar) · Botão direito = menu |
| 🎚️ **Chave MANUAL / BOTÕES** | Escolha como controlar a vitrola: **Manual** (gestos no disco) ou **Botões** (teclado com anterior, play/pausa, próxima, embaralhar, curtir, modo vitrine e volume −/+). A escolha fica salva no perfil |
| 📥 **Arrastar e soltar** | Segure um disco da prateleira: só o **disco** sai e fica preso ao cursor, girando. Solte na vitrola e ele pousa no prato e toca. No celular, um toque no disco já toca |
| 🔀 **Embaralhar** | Sorteia de novo as **próximas** faixas (da biblioteca inteira, sem repetir) — a música atual continua tocando |
| 📚 **Próximas faixas** | Lista com as 5 próximas faixas abaixo do prato, igual à do modo vitrine; clique em uma para tocá-la |
| ⏸️ **Freio do disco** | Ao pausar, o disco da vitrola **e** o da prateleira avançam um pouco e voltam, como uma freada real |
| 🎮 **Guess the Music** | Jogo no menu lateral: tela título com **SCORE** (e a foto do perfil), placar por gênero e reset. Escolha um gênero (pastas iguais às do Início) ou o **MIX** (capa com 4 capas que trocam a cada 5 s) e a dificuldade: **Fácil 5 s**, **Médio 3 s** ou **Difícil 1 s**. Clique no disco da vitrola (selo "?") para ouvir o trecho de um ponto aleatório; escolha entre **4 discos lado a lado**, confirme em "Tem certeza?" e veja **ACERTOU / ERROU** com a capa revelada na vitrola |
| 🖥️ **Modo vitrine** | Vitrola grande em tela cheia com a lista "A seguir" (7 discos) |
| 🎨 **Pastas de vinil** | Capas com textura de papel; no hover os discos saem da pasta. A cor vem da capa via `<canvas>` |
| ❤️ **Curtidas** | Curta músicas e álbuns — **salvo por usuário** e mantido após recarregar. No modo Botões, a tecla ♥ fica afundada se a música já é curtida; apertar de novo descurte. Todo disco curtido ganha um cartãozinho ♥ (pastas, Buscar, Discos curtidos); clicar nele descurte |
| 🔍 **Busca** | Campo em visor LCD; busca por título, artista, álbum, playlist ou gênero, ignorando acentos |
| 🎨 **12 acabamentos** | Mudam a tela inteira (fundo, painéis, madeira, metal, visor e teclas): Sunset 86, Papel, Grafite, Cacau, Cereja, Mel, Oliva, Litoral 85, Cobalto, Vinil, Fliperama e Menta |
| 👤 **Avatar** | Perfis com foto mostram a foto; os demais ganham a inicial do nome sobre as cores do acabamento (muda com o tema) |
| 💎 **Planos** | Free (com anúncio), Muhsic+ e Premium |
| 🔒 **Conteúdo exclusivo** | Músicas visíveis apenas para usuários específicos |
| ⌨️ **Atalhos** | `Espaço` play/pause · `→` próxima · `←` anterior · `Esc` fecha menus |
| 📱 **Responsivo** | Layout adaptado de 1400px até celulares |

---

## 🚀 Como rodar

### Localmente
1. Clone o repositório:
   ```bash
   git clone https://github.com/SEU-USUARIO/muhsic.git
   ```
2. Abra o `index.html` no navegador — **não precisa instalar nada**.
   (Também funciona com a extensão **Live Server** do VS Code.)

### GitHub Pages
1. Faça o push do projeto.
2. Vá em **Settings → Pages**.
3. Em **Source**, escolha `Deploy from a branch` → `main` → `/ (root)`.
4. Acesse: `https://SEU-USUARIO.github.io/muhsic/`

> ⚠️ É necessário internet para carregar as músicas e capas (Cloudinary),
> os ícones (Font Awesome) e as fontes (Google Fonts — Bungee, VT323 e Rubik).
> Logo, capa de curtidos e carimbo das pastas são SVGs locais em `assets/img/`.

---

## 👥 Usuários de teste

| ID | Login    | Senha   | Nome       | Plano |
|----|----------|---------|------------|-------|
| 1  | Muh.png  | 010918  | Murilo N.B | 🟣 Premium |
| 2  | Raiany   | 1234    | Raiany     | 🟡 Muhsic+ |
| 3  | Carol    | 1234    | Carol      | 🟡 Muhsic+ |
| 4  | Teste    | 1234    | Teste      | 🟢 Free |

> O login não diferencia maiúsculas de minúsculas; a senha diferencia.
> Contas novas podem ser criadas na aba **Novo perfil** (ficam salvas no navegador).
> Os dados de teste ficam só neste README — a tela de login não os exibe.
> Apenas o perfil **Muh.png** tem foto; os outros mostram a inicial do nome.

### Roteiro sugerido para apresentação
1. Na landing, role pelas seções (Recursos, Como tocar, Planos, Ficha técnica).
2. Entre como **Teste** (Free) → mostre o avatar com a inicial, o "comercial" e os acabamentos bloqueados.
3. Desligue (sair) e entre como **Muh.png** (Premium) → foto de perfil e músicas exclusivas.
4. Abra uma pasta, **segure um disco e leve até a vitrola** — ele fica preso ao cursor e pousa no prato.
5. Com a chave em **MANUAL**: gire o vinil para trocar de faixa e use o scroll para o volume.
6. Pause e mostre a **freada** do disco (na vitrola e na prateleira).
7. Vire a chave para **BOTÕES** → aparecem o teclado e o volume −/+.
8. Clique em **embaralhar** → as próximas faixas mudam, a atual continua.
9. Dê duplo clique (ou ♥) para curtir → **Discos curtidos** aparece no topo do rack.
10. Tecla ⤢ (ou botão direito → maximizar) → **modo vitrine** em tela cheia.
11. Menu do perfil → **Acabamento do aparelho** → passe por Grafite, Fliperama e Menta (até o logo muda de cor); recarregue — tudo continua salvo.
12. Menu → **Guess the Music** → mostre o SCORE e o Placar → **MIX** → **Médio** → clique no disco da vitrola (selo "?") → gire para trás para repetir → clique num dos 4 discos → "Tem certeza?" → SIM → a capa aparece na vitrola.

---

## 💎 Planos

| Plano | Anúncios | Temas | Exclusivas | Usuários |
|-------|:--------:|:-----:|:----------:|:--------:|
| 🟢 **Free**    | ✅ | — | — | 1 |
| 🟡 **Muhsic+** | — | ✅ | ✅ | 2 |
| 🟣 **Premium** | — | ✅ | ✅ | 4 |

Os planos são definidos em um único lugar: [`js/config/plans.js`](js/config/plans.js).

---

## 📁 Estrutura

```
muhsic/
├── index.html              ← Página inicial (apresentação + login/cadastro)
├── muhsic.html             ← Player (app principal)
├── README.md
├── ARQUITETURA.txt         ← Documentação técnica completa
├── CHANGELOG.md            ← Histórico de versões
│
├── assets/img/             ← Logo, capa de curtidos e carimbo (SVG)
│
├── css/
│   ├── site.css            ← Entrada da landing (index.html)
│   ├── app.css             ← Entrada do player (muhsic.html)
│   ├── base/               ← tokens, reset, efeitos CRT, responsivo
│   ├── layout/             ← os 3 painéis: app, rack (sidebar), tela (header)
│   ├── components/         ← teclas, pastas, prateleira, faixas, busca, modais, anúncio
│   ├── player/             ← deck hi-fi, toca-discos, fila, overlays, modo vitrine
│   ├── pages/              ← landing, detalhe de pasta e o jogo
│   └── themes/             ← 12 acabamentos (cores da tela inteira)
│
└── js/
    ├── config/             ← constantes, URLs, parâmetros do player, planos
    ├── data/               ← "banco de dados": users.js e songs.js
    ├── core/               ← regras sem interface: storage, sessão, auth, biblioteca
    ├── pages/              ← landing.js (modal de login/cadastro)
    └── app/                ← player: estado, vitrola, fila, curtidas, arraste de discos, jogo, eventos
        └── views/          ← renderização das telas
```

A explicação de cada arquivo, o fluxo de dados e o guia para novas
funcionalidades estão em **[ARQUITETURA.txt](ARQUITETURA.txt)**.

---

## 🧠 Sistema de visibilidade (IDs)

Cada música tem um array `userIds` que define quem pode vê-la:

```javascript
userIds: [0]      // global — todos veem
userIds: [0, 1]   // global (o 1 é redundante, mas permitido)
userIds: [1]      // APENAS o usuário 1 (Murilo) vê
userIds: [1, 2]   // exclusiva de Murilo e Raiany
```

| ID | Significado |
|----|-------------|
| `0` | Global (todos os usuários logados) |
| `1` | Murilo N.B |
| `2` | Raiany |
| `3` | Carol |
| `4` | Teste |

Contas criadas pelo formulário recebem um ID único e veem as músicas globais.

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **HTML5** | Estrutura e `<audio>` |
| **CSS3** | Variáveis, `color-mix()`, grid, flexbox, máscaras, animações, `@import` modular |
| **SVG** | Logo e ilustrações próprias |
| **JavaScript (ES2020)** | Toda a lógica, sem frameworks nem build |
| **Canvas API** | Extração da cor dominante das capas |
| **localStorage** | Sessão, contas criadas, curtidas, tema, modo da vitrola e recordes do jogo |
| **Font Awesome 6** | Ícones |
| **Google Fonts** | Bungee, VT323 e Rubik |
| **Cloudinary** | Hospedagem de áudio e imagens |

---

## 🗺️ Próximos passos

- [ ] Curtir playlists e gêneros pela página de detalhe
- [ ] Controle de volume e progresso por toque (celular)
- [ ] Criar playlists personalizadas
- [ ] Backend real (API + banco de dados) substituindo `js/data/` e `core/storage.js`
- [ ] Senhas com hash (hoje ficam em texto puro — aceitável apenas por ser simulação)

---

## 👤 Autor

**Murilo N.B** — MPS (MapleProjectSeries)

---

## 📄 Licença

Copyright © 2026 Muhsic / MPS — Todos os direitos reservados.
Projeto acadêmico, sem fins comerciais.
