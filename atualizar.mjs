#!/usr/bin/env node
/* ============================================================
   scripts/atualizar.mjs  —  roda NO GITHUB (Actions), sem instalar nada.
   Busca os dados "vivos" (jogos do Ceará, shows, discografias, feats)
   e grava data/dados.json + data/dados.js, que o site lê.
   Requer Node 20+ (já vem no GitHub Actions).

   Uso local (opcional):  node scripts/atualizar.mjs
                          node scripts/atualizar.mjs --offline   (só usa data/manual.json)
   ============================================================ */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OFFLINE = process.argv.includes('--offline');
const GAP = +(process.env.ITUNES_GAP ?? 3200); // o iTunes aceita ~20 chamadas/min: vamos devagar
const dorme = ms => new Promise(r => setTimeout(r, ms));
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
const capa = (u, n = 600) => (u || '').replace(/\d+x\d+bb/, n + 'x' + n + 'bb');

async function get(url, { itunes = false, ms = 20000 } = {}) {
  if (itunes && GAP) await dorme(GAP);
  const r = await fetch(url, { signal: AbortSignal.timeout(ms), headers: { 'user-agent': 'presente-da-geo/1.0', accept: 'application/json' } });
  if (!r.ok) throw new Error(`${r.status} ${url.slice(0, 80)}`);
  return JSON.parse(await r.text());
}
const it = url => get(url, { itunes: true });
const tenta = async (nome, fn, padrao) => { try { return await fn(); } catch (e) { console.log(`⚠️  ${nome}: ${e.message}`); return padrao; } };

/* ---------- arquivo editável à mão ---------- */
const manual = await fs.readFile(path.join(RAIZ, 'data/manual.json'), 'utf8').then(JSON.parse).catch(() => ({}));

/* ---------- CEARÁ ---------- */
const LIGAS = { 'bra.2': 'Série B', 'bra.1': 'Série A', 'bra.copa_do_brasil': 'Copa do Brasil', 'bra.copa_do_nordeste': 'Copa do Nordeste', 'bra.camp.cearense': 'Campeonato Cearense' };
const SEM_TIME = /\(w\)|feminino|women|sub-?\d|\bu-?\d\d/i;
async function jogosEspn() {
  const f = d => d.toISOString().slice(0, 10).replace(/-/g, ''), ini = new Date(Date.now() - 45 * 864e5), fim = new Date(Date.now() + 180 * 864e5);
  const rs = await Promise.allSettled(Object.keys(LIGAS).map(async slug => {
    const d = await get(`https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard?dates=${f(ini)}-${f(fim)}&limit=500`);
    return (d.events || []).map(e => {
      const c = e.competitions?.[0], cp = c?.competitors || [], h = cp.find(x => x.homeAway === 'home'), a = cp.find(x => x.homeAway === 'away'); if (!h || !a) return null;
      const nome = x => x.team?.displayName || x.team?.name || '';
      if (!/cear[aá]/i.test(nome(h) + '|' + nome(a)) || SEM_TIME.test(nome(h) + nome(a))) return null;
      const sc = x => { const s = x.score; return s == null ? null : (typeof s === 'object' ? (s.displayValue ?? s.value) : s); };
      const t = (c.status || e.status)?.type || {}, pre = t.state === 'pre';
      return { casa: nome(h), fora: nome(a), liga: LIGAS[slug], rodada: '', local: c.venue?.fullName || '', hora: true, quando: new Date(e.date).toISOString(), estado: t.state, detalhe: t.shortDetail || t.detail || '', pc: pre ? null : sc(h), pf: pre ? null : sc(a) };
    }).filter(Boolean);
  }));
  if (!rs.some(r => r.status === 'fulfilled')) throw new Error('ESPN não respondeu');
  return rs.flatMap(r => r.status === 'fulfilled' ? r.value : []);
}
async function jogosTsdb() {
  const API = 'https://www.thesportsdb.com/api/v1/json/3/';
  const t = await get(API + 'searchteams.php?t=' + encodeURIComponent('Ceará'));
  const time = (t.teams || []).find(x => x.strSport === 'Soccer' && /cear[aá]/i.test(x.strTeam) && !SEM_TIME.test(x.strTeam + (x.strGender || '')) && /brazil/i.test(x.strCountry || '')); if (!time) return [];
  const [n, u] = await Promise.all([get(API + 'eventsnext.php?id=' + time.idTeam), get(API + 'eventslast.php?id=' + time.idTeam)]);
  return [...(n.events || []), ...(u.results || [])].map(e => ({ casa: e.strHomeTeam, fora: e.strAwayTeam, liga: e.strLeague, rodada: e.strRound, hora: !!e.strTime && e.strTime !== '00:00:00', local: e.strVenue, pc: e.intHomeScore, pf: e.intAwayScore,
    quando: (e.strTimestamp ? new Date(e.strTimestamp.replace(' ', 'T') + (/[Zz+]|-\d\d:/.test(e.strTimestamp) ? '' : 'Z')) : new Date(e.dateEvent + 'T' + (e.strTime || '12:00:00') + 'Z')).toISOString() }));
}
function juntarJogos(lista) { // tira repetidos entre fontes (a 1ª da lista ganha)
  const out = [], adv = x => norm(/cear[aá]/i.test(x.casa) ? x.fora : x.casa).slice(0, 4);
  lista.forEach(e => { if (!out.some(o => Math.abs(new Date(o.quando) - new Date(e.quando)) < 30 * 36e5 && adv(o) === adv(e))) out.push(e); });
  return out.sort((a, b) => new Date(a.quando) - new Date(b.quando));
}

/* ---------- ARTISTAS (mantenha igual ao ARTISTAS do script.js) ---------- */
const igual = (...ks) => k => ks.includes(k);
const ARTISTAS = {
  jao: { nome: 'Jão', albuns: [['Lobos', igual('lobos')], ['Anti-Herói', igual('antiheroi'), '3l3LZovnHa1TmtR1V2fxkP'], ['Pirata', igual('pirata'), '2LeCiUHBSmUMyrclDEEBly'], ['Super', igual('super')], ['Memórias Póstumas', igual('memoriaspostumas')], ['Turnê Anti-Herói (Ao Vivo)', k => k.startsWith('turneantiheroi')], ['Supernova', igual('supernova')]], bit: 'Jão' },
  bk: { nome: 'BK', busca: "BK'", albuns: [['Castelos & Ruínas', k => k.startsWith('castelos')], ['Antes dos Gigantes Chegarem, Vol. 2', k => /^antesdos?gigantes/.test(k) && /2$/.test(k), '2s8fQ4CCEtFzebalX0unvp', ['Antes dos Gigantes Chegarem (feat. Juyè & Luccas Carlos)', 'Adeus (feat. Akira Presidente)', 'Almas (feat. Juyè)']], ['Gigantes', igual('gigantes')], ['O Líder em Movimento', k => k.startsWith('olideremmovimento')], ['ICARUS', k => k.startsWith('icarus')], ['VERÃO CRIMINOSO', k => k.startsWith('veraocriminoso')], ['PRODUTO DO AMBIENTE', k => k.startsWith('produtodoambiente')]], bit: "BK'" },
  anavitoria: { nome: 'Anavitória', albuns: null, bit: 'Anavitória' },
  lagum: { nome: 'Lagum', albuns: null, bit: 'Lagum' }
};
const chaveAlb = n => norm(n.replace(/\s*-\s*(Single|EP)$/i, '').replace(/\s*[\(\[]\s*(deluxe|expanded|remaster|edi[cç][aã]o)[^\)\]]*[\)\]]/ig, ''));
const limpaNome = n => n.replace(/\s*-\s*(Single|EP)$/i, '').replace(/\s*[\(\[]\s*(deluxe|expanded|remaster|edi[cç][aã]o)[^\)\]]*[\)\]]/ig, '');
const FEAT_RE = /[\(\[]\s*(?:feat\.?|ft\.?|featuring|part\.?|participa[cç][aã]o(?: de)?|com|with)\s+([^\)\]]+)[\)\]]/i;
const SEP = /\s*(?:,|&|\bfeat\.?\s|\bft\.?\s|\band\b|\be\b|\bx\b)\s*/i;
const toks = s => String(s).split(SEP).map(x => x.trim()).filter(Boolean);
const tituloLimpo = n => n.replace(FEAT_RE, '').replace(/\s{2,}/g, ' ').trim();
const featsDe = (titulo, artistas, main) => { const set = [], add = n => { if (n.length > 1 && norm(n) !== norm(main) && !set.some(s => norm(s) === norm(n))) set.push(n); }; const m = titulo.match(FEAT_RE); if (m) { toks(m[1]).forEach(add); return set; } toks(artistas || '').forEach(add); return set; };
const faixaDe = (titulo, artistas, A, album, cv, previa) => ({ nome: tituloLimpo(titulo), feats: featsDe(titulo, artistas, A.nome), art: A.nome, album, capa: cv, previa });

async function albumItunes(A, r) {
  const faixas = await tenta('faixas ' + r.collectionName, async () => (await it(`https://itunes.apple.com/lookup?id=${r.collectionId}&entity=song&country=BR&limit=200`)).results.filter(x => x.wrapperType === 'track').map(x => faixaDe(x.trackName, x.artistName, A, r.collectionName, capa(x.artworkUrl100), x.previewUrl)), []);
  return { nome: limpaNome(r.collectionName), capa: capa(r.artworkUrl100), ano: new Date(r.releaseDate).getFullYear(), data: r.releaseDate, faixas };
}
const deezerFaixas = (A, id, titulo, cv) => tenta('deezer faixas', async () => ((await get(`https://api.deezer.com/album/${id}/tracks?limit=100`)).data || []).map(x => faixaDe(x.title, x.artist?.name, A, titulo, cv, x.preview)), []);
async function achaAlbum(A, nome, ok, spId, todos) {
  let ach = todos.filter(x => ok(chaveAlb(x.collectionName)));
  for (const termo of [A.busca || A.nome, A.nome]) { if (ach.length) break; ach = await tenta('busca ' + nome, async () => (await it(`https://itunes.apple.com/search?term=${encodeURIComponent(termo + ' ' + nome)}&entity=album&country=BR&limit=15`)).results.filter(x => norm(x.artistName).includes(norm(A.nome).slice(0, 2)) && ok(chaveAlb(x.collectionName))), []); }
  const r = ach.find(x => !/deluxe/i.test(x.collectionName)) || ach[0]; if (r) return albumItunes(A, r);
  for (const q of [`artist:"${A.nome}" album:"${nome}"`, `${A.nome} ${nome}`]) {
    const hit = await tenta('deezer ' + nome, async () => ((await get(`https://api.deezer.com/search/album?q=${encodeURIComponent(q)}&limit=15`)).data || []).find(x => ok(chaveAlb(x.title)) && norm(x.artist?.name || '').includes(norm(A.nome).slice(0, 2))), null);
    if (hit) { const cv = hit.cover_xl || hit.cover_big || hit.cover_medium; return { nome: limpaNome(hit.title), capa: cv, faixas: await deezerFaixas(A, hit.id, hit.title, cv) }; }
  }
  if (spId) { const d = await tenta('spotify oembed', () => get(`https://open.spotify.com/oembed?url=${encodeURIComponent('https://open.spotify.com/album/' + spId)}`), null); if (d?.thumbnail_url) return { nome, capa: d.thumbnail_url, faixas: [] }; }
  return null;
}
async function carregaArtista(k) {
  const A = ARTISTAS[k]; let todos = [];
  const art = await tenta('artista ' + A.nome, async () => { for (const termo of new Set([A.busca || A.nome, A.nome])) { const a = (await it(`https://itunes.apple.com/search?term=${encodeURIComponent(termo)}&entity=musicArtist&country=BR&limit=10`)).results.find(r => norm(r.artistName) === norm(A.nome)); if (a) return a; } return null; }, null);
  if (art) todos = await tenta('álbuns ' + A.nome, async () => (await it(`https://itunes.apple.com/lookup?id=${art.artistId}&entity=album&country=BR&limit=200`)).results.filter(r => r.wrapperType === 'collection'), []);
  let lista;
  if (A.albuns) lista = await Promise.all(A.albuns.map(async ([nome, ok, id, fixas]) => {
    let a = await achaAlbum(A, nome, ok, id, todos); const base = (manual.faixas?.[k] || {})[nome] || fixas;
    if (base && !a?.faixas?.length) a = { ...(a || { nome }), faixas: base.map(t => faixaDe(t, '', A, nome, a?.capa, null)) };
    return { ...(a || { nome }), art: k, spId: id };
  }));
  else {
    const vis = new Set(), sel = todos.filter(r => !/\s-\s*(Single|EP)$/i.test(r.collectionName) && (r.trackCount || 0) >= 4).sort((a, b) => (/deluxe/i.test(a.collectionName) - /deluxe/i.test(b.collectionName)) || (new Date(b.releaseDate) - new Date(a.releaseDate)))
      .filter(r => { const c = chaveAlb(r.collectionName); if (vis.has(c)) return false; vis.add(c); return true; }).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    lista = []; for (const r of sel) lista.push({ ...(await albumItunes(A, r)), art: k });
  }
  const cats = todos.map(r => ({ collectionName: r.collectionName, releaseDate: r.releaseDate, artworkUrl100: r.artworkUrl100 }));
  return { lista, cats };
}

/* ---------- PARCERIAS ---------- */
async function parcerias() {
  const siteNorm = Object.values(ARTISTAS).map(a => norm(a.nome)), porArtista = {}, site = [], visSite = new Set();
  for (const [k, A] of Object.entries(ARTISTAS)) {
    const r = await tenta('parcerias ' + A.nome, () => it(`https://itunes.apple.com/search?term=${encodeURIComponent(A.nome)}&entity=song&attribute=artistTerm&country=BR&limit=200`), { results: [] });
    const vis = new Set(); porArtista[k] = [];
    (r.results || []).filter(x => x.trackName).forEach(x => {
      const m = x.trackName.match(FEAT_RE), arts = [...new Set([...toks(x.artistName || ''), ...(m ? toks(m[1]) : [])])], nn = arts.map(norm);
      const item = { nome: tituloLimpo(x.trackName), arts, capa: capa(x.artworkUrl100), data: x.releaseDate }, chave = norm(item.nome) + [...nn].sort().join('');
      if (arts.length >= 2 && nn.includes(norm(A.nome)) && !vis.has(chave)) { vis.add(chave); porArtista[k].push(item); }
      if (siteNorm.filter(s => nn.includes(s)).length >= 2 && !visSite.has(chave)) { visSite.add(chave); site.push(item); }
    });
    porArtista[k].sort((a, b) => new Date(b.data) - new Date(a.data)); porArtista[k] = porArtista[k].slice(0, 15);
  }
  site.sort((a, b) => new Date(b.data) - new Date(a.data));
  return { ...porArtista, site: site.slice(0, 15) };
}

/* ---------- SHOWS ---------- */
async function showsDe(A) {
  const d = await get(`https://rest.bandsintown.com/artists/${encodeURIComponent(A.bit)}/events?app_id=presente-da-geo&date=upcoming`);
  if (!Array.isArray(d)) throw new Error('resposta inesperada');
  return d.map(e => ({ dia: (e.datetime || '').slice(0, 10), hora: (e.datetime || '').slice(11, 16) === '00:00' ? '' : (e.datetime || '').slice(11, 16), cidade: [e.venue?.city, e.venue?.region || e.venue?.country].filter(Boolean).join(', '), local: e.venue?.name || '', url: e.url || (e.offers || []).find(o => o.url)?.url || '' })).filter(e => e.dia);
}

/* ---------- MONTA TUDO ---------- */
const saida = { atualizadoEm: new Date().toISOString(), ceara: { jogos: [] }, shows: {}, artistas: {}, parcerias: {}, faixasManuais: manual.faixas || {} };
const jogosManuais = (manual.ceara?.jogos || []);
let jogos = [];
if (!OFFLINE) {
  const [a, b] = await Promise.all([tenta('ESPN', jogosEspn, []), tenta('TheSportsDB', jogosTsdb, [])]);
  jogos = [...a, ...b];
  console.log(`Ceará: ${a.length} jogos (ESPN), ${b.length} (TheSportsDB)`);
}
saida.ceara.jogos = juntarJogos([...jogos, ...jogosManuais]);   // ESPN > TheSportsDB > manual

for (const [k, A] of Object.entries(ARTISTAS)) {
  const ao = OFFLINE ? [] : await tenta('shows ' + A.nome, () => showsDe(A), []);
  const vis = new Set();
  saida.shows[k] = [...ao, ...(manual.shows?.[k] || [])].filter(e => e.dia && e.dia >= new Date().toISOString().slice(0, 10)).filter(e => { const c = e.dia + norm(e.cidade || '').slice(0, 4); if (vis.has(c)) return false; vis.add(c); return true; }).sort((a, b) => a.dia.localeCompare(b.dia));
}
if (!OFFLINE) {
  for (const k of Object.keys(ARTISTAS)) { const r = await tenta('artista ' + k, () => carregaArtista(k), null); if (r && r.lista.length) { saida.artistas[k] = r; console.log(`${k}: ${r.lista.length} álbuns`); } }
  saida.parcerias = await tenta('parcerias', parcerias, {});
}

/* ---------- grava (só se algo mudou, pra não fazer barulho) ---------- */
const dirData = path.join(RAIZ, 'data'); await fs.mkdir(dirData, { recursive: true });
const anterior = await fs.readFile(path.join(dirData, 'dados.json'), 'utf8').then(JSON.parse).catch(() => null);
const igualAoAnterior = anterior && JSON.stringify({ ...anterior, atualizadoEm: 0 }) === JSON.stringify({ ...saida, atualizadoEm: 0 });
if (igualAoAnterior) { saida.atualizadoEm = anterior.atualizadoEm; console.log('Nada mudou desde a última vez.'); }
const json = JSON.stringify(saida);
await fs.writeFile(path.join(dirData, 'dados.json'), json);
await fs.writeFile(path.join(dirData, 'dados.js'), `/* gerado por scripts/atualizar.mjs — não edite à mão */\nwindow.DADOS=${json};\n`);
console.log(`✅ dados.json/dados.js gravados (${(json.length / 1024).toFixed(0)} KB) · ${saida.atualizadoEm}`);
