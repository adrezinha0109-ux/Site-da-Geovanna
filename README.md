# 🎂 Site da Geo — guia rápido

Este site se **atualiza sozinho** quando está no GitHub: o próprio GitHub busca os dados novos a cada 30 minutos
(jogos do Ceará, shows, álbuns, parcerias) e republica a página. Você não precisa fazer nada depois de configurar.

---

## 1) Colocar no ar (só uma vez) — ~10 minutos

1. Entre em **github.com** e crie uma conta (se ainda não tiver).
2. Clique em **New repository** (botão verde). Escolha um nome (ex.: `site-da-geo`), deixe **Public** e clique em **Create repository**.
   > O GitHub Pages grátis só funciona com repositório público.
3. Na tela do repositório, clique em **uploading an existing file**. Arraste **tudo que está DENTRO da pasta** do site
   (não a pasta em si): os `.html`, `script.js`, `style.css`, `carta.js`, e as pastas `data`, `scripts` e `.github`.
   Depois clique em **Commit changes**.
   - ⚠️ A pasta `.github` é "escondida" no Windows. Se ela não subir, clique em **Add file → Create new file**,
     digite no nome `.github/workflows/atualizar.yml`, cole o conteúdo do arquivo `atualizar.yml` e clique em **Commit**.
4. Vá em **Settings → Pages**. Em **Build and deployment → Source**, escolha **GitHub Actions**.
5. Vá na aba **Actions**, clique em **Atualizar e publicar** → **Run workflow** → **Run workflow**.
   Espere ficar verde ✅ (leva uns 3 a 5 minutos).
6. Pronto! O endereço do site aparece em **Settings → Pages** (algo como `https://SEU-USUARIO.github.io/site-da-geo/`).

---

## 2) O que se atualiza sozinho

| O quê | Como |
|---|---|
| Próximo jogo e último resultado do Ceará | ESPN + TheSportsDB (e ao vivo no navegador durante o jogo) |
| Álbuns, capas e músicas (Jão, BK, Anavitória, Lagum) | iTunes + Deezer |
| Lançamentos novos e parcerias/feats | iTunes |
| Próximo show | Bandsintown + seu arquivo `data/manual.json` |

> Essas são fontes gratuitas, sem garantia. Se alguma falhar, o site mostra o que tem de reserva e avisa a hora da última atualização.

---

## 3) Quando precisar corrigir algo à mão — `data/manual.json`

Abra o arquivo no GitHub (clique nele → ícone do lápis ✏️). Lá você pode:

- **Adicionar um show** que ainda não apareceu (copie uma linha existente em `"shows"` e troque os dados).
- **Adicionar um jogo do Ceará** que as fontes ainda não têm (em `"ceara" → "jogos"`).
- **Listar as músicas de um álbum** que apareça sem faixas (em `"faixas"`).

Salve com **Commit changes**. O site republica sozinho em alguns minutos.
Cuidado com vírgulas: se faltar ou sobrar uma, o GitHub avisa em vermelho.

---

## 4) Mudar a carta 💌 — `editar-carta.html`

1. No seu computador, abra o arquivo **`editar-carta.html`** (dois cliques).
2. Escreva a carta nova, a senha e a dica. Deixe **🔒 Esconder a carta no código** marcado.
3. Clique em **Gerar carta.js** e depois em **Copiar**.
4. No GitHub, abra o arquivo **`carta.js`** → ✏️ → apague tudo → cole → **Commit changes**.

> Por que esconder? Como o repositório é público, qualquer pessoa pode abrir o `carta.js`.
> Com a proteção ligada, a carta fica embaralhada e só abre com a senha.
> A senha continua sendo um cadeado de brincadeira: se alguém adivinhar, abre. Escolha uma que não seja óbvia.

Para editar a carta que já existe: no `editar-carta.html`, digite a senha atual em **Carregar carta atual**.

---

## 5) Se um dia parar de atualizar

- Aba **Actions**: se aparecer um aviso de que o agendamento foi desativado, clique em **Enable workflow**.
- Clique em **Run workflow** pra forçar uma atualização.
- Se ficar vermelho ❌, abra a execução: o erro costuma ser uma vírgula em `data/manual.json`.

## Arquivos

- `index.html`, `ceara.html`, `jao.html`, `bk.html`, `anavitoria.html`, `macaco.html`, `mensagem.html`: o site (cada arquivo abre na sua página).
- `style.css`, `script.js`: visual e funcionamento.
- `carta.js` + `editar-carta.html`: a carta.
- `data/`: dados gerados + `manual.json` (seu).
- `scripts/atualizar.mjs` e `.github/workflows/atualizar.yml`: o "robô" que atualiza tudo.
