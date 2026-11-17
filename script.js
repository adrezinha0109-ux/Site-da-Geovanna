/* ==========================================================
   Presente da Geo v3 — script.js (site de arquivo único: todas as
   páginas vivem dentro de cada HTML, então os links nunca quebram)
   ========================================================== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rand = (a, b) => Math.random() * (b - a) + a;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
  const spot = q => 'https://open.spotify.com/search/' + encodeURIComponent(q);

  const PAGES = [['home', '🏠', 'Home', 'Presente da Geo'], ['ceara', '⚽', 'Ceará', 'Vai, Vozão!'], ['jao', '🐺', 'Jão', 'Jão'], ['bk', '👑', 'BK', 'BK'], ['ana', '🎶', 'Anavitória & Lagum', 'Anavitória e Lagum'], ['macacos', '🐒', 'Macacos', 'Macacaquinhos'], ['mensagem', '💌', 'Mensagem', 'Para você']];
  let page = 'home';
  const sistema = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  /* ---------- TOPO + DOCK ---------- */
  $('#cabecalho').className = 'site-header';
  $('#cabecalho').innerHTML = `<div class="topbar"><a class="logo" href="#home">🎉 Feliz Aniversário, Geo!</a><button class="tema-btn" id="temaBtn" aria-label="Alternar claro/noturno"></button></div>`;
  $('#dock').className = 'dock';
  $('#dock').innerHTML = PAGES.map(([p, e, t]) => `<a href="#${p}" data-p="${p}"><span>${e}</span><em>${t}</em></a>`).join('');
  document.body.insertAdjacentHTML('beforeend', '<a href="#" class="btn-floating" id="topo">⬆ Topo</a><div id="progresso"></div><div id="brilho"></div>');
  const btnTema = $('#temaBtn');
  const pintaTema = () => btnTema.textContent = document.documentElement.dataset.theme === 'dark' ? '☀️' : '🌙';
  btnTema.onclick = () => { const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = t; store.set('tema-' + page, t); pintaTema(); };
  const topo = $('#topo'); topo.onclick = e => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); };
  const barra = $('#progresso'), brilho = $('#brilho');
  addEventListener('scroll', () => { const m = document.documentElement.scrollHeight - innerHeight; barra.style.width = (m > 0 ? scrollY / m * 100 : 0) + '%'; topo.classList.toggle('mostrar', scrollY > 300); }, { passive: true });
  addEventListener('pointermove', e => { brilho.style.left = e.clientX + 'px'; brilho.style.top = e.clientY + 'px'; }, { passive: true });

  /* ---------- CONFETE / EMOJIS ---------- */
  const canvas = Object.assign(document.createElement('canvas'), { id: 'confete' }); document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d'); let pecas = [], rodando = false;
  const ajusta = () => { canvas.width = innerWidth; canvas.height = innerHeight; }; addEventListener('resize', ajusta); ajusta();
  const CORES = ['#ff3ea5', '#9b59b6', '#b388ff', '#ffd23f', '#3ec6ff', '#ffffff', '#1db954'];
  function confete(x = innerWidth / 2, y = innerHeight / 3, n = 140) {
    if (calmo) return;
    for (let i = 0; i < n; i++) { const a = rand(0, 6.283), v = rand(4, 13); pecas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 5, w: rand(6, 11), h: rand(4, 8), r: rand(0, 6), vr: rand(-.3, .3), cor: CORES[i % CORES.length], vida: rand(90, 170) }); }
    if (!rodando) { rodando = true; requestAnimationFrame(quadro); }
  }
  function quadro() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pecas = pecas.filter(p => p.vida-- > 0 && p.y < canvas.height + 20);
    for (const p of pecas) { p.vy += .25; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = Math.min(1, p.vida / 40); ctx.fillStyle = p.cor; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); }
    if (pecas.length) requestAnimationFrame(quadro); else { rodando = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }
  const chuva = (dur = 2500) => { const fim = Date.now() + dur; (function p() { confete(rand(0, innerWidth), -10, 6); if (Date.now() < fim) setTimeout(p, 60); })(); };
  const pop = (x, y, set, n = 6) => {
    if (calmo) return;
    for (let i = 0; i < n; i++) { const s = document.createElement('span'); s.className = 'emoji-pop'; s.textContent = set[i % set.length]; s.style.cssText = `left:${x}px;top:${y}px;--dx:${rand(-90, 90)}px;--dy:${rand(-150, -40)}px;--rot:${rand(-40, 40)}deg`; document.body.appendChild(s); setTimeout(() => s.remove(), 1100); }
  };
  const EMO = { home: ['💜', '🎉', '✨'], ceara: ['⚽', '🖤', '🤍'], jao: ['🎵', '🎤', '💙'], bk: ['🔥', '🎧', '👑'], ana: ['🎸', '🌻', '💛'], macacos: ['🐒', '🐵', '🍌', '🙈'], mensagem: ['💖', '💌', '🌸'] };
  document.addEventListener('pointerdown', e => { if (!e.target.closest('a,button,input,.modal,audio,.dock')) pop(e.clientX, e.clientY, EMO[page]); });
  const kk = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; let ki = 0;
  addEventListener('keydown', e => { ki = e.keyCode === kk[ki] ? ki + 1 : 0; if (ki === kk.length) { ki = 0; chuva(5000); } });

  /* ---------- REVEAL + TILT ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; const el = en.target; el.classList.add('visivel'); io.unobserve(el);
    setTimeout(() => { el.classList.remove('reveal', 'visivel'); el.style.transitionDelay = ''; }, 900 + (parseInt(el.style.transitionDelay) || 0));
  }), { threshold: .1 }) : null;
  function anima(raiz = document) {
    $$('.card:not(.ok), .tile:not(.ok), .album:not(.ok), .flip:not(.ok), .citacao:not(.ok)', raiz).forEach((el, i) => {
      el.classList.add('ok'); if (!io || calmo) return;
      el.classList.add('reveal'); el.style.transitionDelay = (i % 4) * 80 + 'ms'; io.observe(el);
    });
    if (!calmo && matchMedia('(hover:hover)').matches) $$('.tile:not(.tilt), .album:not(.tilt)', raiz).forEach(c => {
      c.classList.add('tilt');
      c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `perspective(700px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateY(-4px)`; });
      c.addEventListener('pointerleave', () => c.style.transform = '');
    });
  }
  async function digita(el, texto, vel = 40) { el.textContent = ''; el.classList.add('cursor-digita'); for (const ch of texto) { el.textContent += ch; await sleep(vel); } el.classList.remove('cursor-digita'); }

  /* ---------- iTunes via JSONP (funciona até com o arquivo aberto direto) ---------- */
  let jid = 0;
  const itunes = url => new Promise((ok, erro) => {
    const cb = '__it' + (++jid) + Date.now(), s = document.createElement('script');
    const fim = setTimeout(() => { limpa(); erro(new Error('timeout')); }, 12000);
    const limpa = () => { clearTimeout(fim); delete window[cb]; s.remove(); };
    window[cb] = d => { limpa(); ok(d); }; s.onerror = () => { limpa(); erro(new Error('falha')); };
    s.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + cb; document.head.appendChild(s);
  });
  const capa = (u, n = 600) => (u || '').replace(/\d+x\d+bb/, n + 'x' + n + 'bb');

  /* ================= INICIALIZADORES POR PÁGINA (rodam 1x) ================= */
  const inits = {}, entradas = {};

  /* ---------- HOME ---------- */
  inits.home = () => {
    const sd = $('#saudacao'), hr = new Date().getHours();
    sd.textContent = `${hr < 12 ? 'Bom dia' : hr < 18 ? 'Boa tarde' : 'Boa noite'}, aniversariante! 🎂`;
    const f = $('.faixa span'); f.textContent = f.textContent.repeat(2);
    $('#vemver').onclick = () => confete(innerWidth / 2, innerHeight / 2, 80);
    const parc = async () => { const n = await carregaParcerias(Object.values(ARTISTAS).map(a => a.nome), $('#home-parcerias .a-parcerias'), 'site', DB().parcerias?.site || []); $('#home-parcerias').hidden = !n; };
    parc(); entradas.home = () => { if (Date.now() - (entradas.home.t || 0) > 10 * 60e3) { entradas.home.t = Date.now(); parc(); } }; entradas.home.t = Date.now();
    const h1 = $('#v-home h1'); if (!calmo) { const t = h1.textContent.trim(); h1.style.minHeight = h1.offsetHeight + 'px'; digita(h1, t, 32); }
  };

  /* ---------- CEARÁ ---------- */
  /* ================= DADOS AO VIVO (tudo abaixo se atualiza sozinho) ================= */
  const getJson = (url, ms = 10000) => { const c = new AbortController(), t = setTimeout(() => c.abort(), ms); return fetch(url, { signal: c.signal }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).finally(() => clearTimeout(t)); };
  const hhmm = d => new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Fortaleza' }).format(d);
  const mesAno = d => d ? new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(new Date(d)) : '';

  const DB = () => window.DADOS || {};   // dados gerados pelo GitHub (data/dados.js), se existirem

  /* ---------- CEARÁ ---------- */
  const SVG_ESCUDO = `<svg viewBox="0 0 100 120" class="escudo" role="img" aria-label="Escudo do Ceará"><path d="M50 4 92 18v44c0 28-22 46-42 54C30 108 8 90 8 62V18z" fill="#000" stroke="#fff" stroke-width="4"/><path d="M50 14 82 25v37c0 22-16 36-32 43-16-7-32-21-32-43V25z" fill="#fff"/><text x="50" y="66" text-anchor="middle" font-family="Anton,sans-serif" font-size="30" fill="#000">CSC</text><text x="50" y="88" text-anchor="middle" font-size="12" fill="#000" font-family="Poppins,sans-serif" font-weight="700">1914</text></svg>`;
  const LIGAS = { 'bra.2': 'Série B', 'bra.1': 'Série A', 'bra.copa_do_brasil': 'Copa do Brasil', 'bra.copa_do_nordeste': 'Copa do Nordeste', 'bra.camp.cearense': 'Campeonato Cearense' };
  // Reserva: só entra se as fontes ao vivo não responderem. Conferido em 16/11/2026.
  const BASE_JOGOS = [{ src: 'base', casa: 'CRB', fora: 'Ceará', pc: 1, pf: 1, estado: 'post', liga: 'Série B', rodada: '38', quando: new Date('2026-11-14T16:30:00-03:00'), hora: true, local: 'Estádio Rei Pelé, Maceió (AL)' }];
  const SEM_TIME = /\(w\)|feminino|women|sub-?\d|\bu-?\d\d/i;
  async function jogosEspn() {
    const f = d => d.toISOString().slice(0, 10).replace(/-/g, ''), ini = new Date(Date.now() - 30 * 864e5), fim = new Date(Date.now() + 150 * 864e5);
    const rs = await Promise.allSettled(Object.keys(LIGAS).map(async slug => {
      const d = await getJson(`https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard?dates=${f(ini)}-${f(fim)}&limit=500`);
      return (d.events || []).map(e => {
        const c = e.competitions?.[0], cp = c?.competitors || [], h = cp.find(x => x.homeAway === 'home'), a = cp.find(x => x.homeAway === 'away'); if (!h || !a) return null;
        const nome = x => x.team?.displayName || x.team?.name || '';
        if (!/cear[aá]/i.test(nome(h) + '|' + nome(a)) || SEM_TIME.test(nome(h) + nome(a))) return null;
        const sc = x => { const s = x.score; return s == null ? null : (typeof s === 'object' ? (s.displayValue ?? s.value) : s); };
        const t = (c.status || e.status)?.type || {}, pre = t.state === 'pre';
        return { src: 'espn', casa: nome(h), fora: nome(a), liga: LIGAS[slug], rodada: '', local: c.venue?.fullName || '', hora: true, quando: new Date(e.date), estado: t.state, detalhe: t.shortDetail || t.detail || '', pc: pre ? null : sc(h), pf: pre ? null : sc(a) };
      }).filter(Boolean);
    }));
    if (!rs.some(r => r.status === 'fulfilled')) throw new Error('espn');
    return rs.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  }
  async function jogosTsdb() {
    const API = 'https://www.thesportsdb.com/api/v1/json/3/';
    const t = await getJson(API + 'searchteams.php?t=' + encodeURIComponent('Ceará'));
    const time = (t.teams || []).find(x => x.strSport === 'Soccer' && /cear[aá]/i.test(x.strTeam) && !SEM_TIME.test(x.strTeam + (x.strGender || '')) && /brazil/i.test(x.strCountry || '')); if (!time) return [];
    const [n, u] = await Promise.all([getJson(API + 'eventsnext.php?id=' + time.idTeam), getJson(API + 'eventslast.php?id=' + time.idTeam)]);
    const ev = e => ({ src: 'tsdb', casa: e.strHomeTeam, fora: e.strAwayTeam, liga: e.strLeague, rodada: e.strRound, hora: !!e.strTime && e.strTime !== '00:00:00', local: e.strVenue, pc: e.intHomeScore, pf: e.intAwayScore, badge: time.strBadge,
      quando: e.strTimestamp ? new Date(e.strTimestamp.replace(' ', 'T') + (/[Zz+]|-\d\d:/.test(e.strTimestamp) ? '' : 'Z')) : new Date(e.dateEvent + 'T' + (e.strTime || '12:00:00') + 'Z') });
    return [...(n.events || []), ...(u.results || [])].map(ev);
  }
  inits.ceara = () => {
    const img = $('#escudo'), fontes = ['https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Cear%C3%A1_Sporting_Club_logo.svg/1081px-Cear%C3%A1_Sporting_Club_logo.svg.png', 'https://commons.wikimedia.org/wiki/Special:FilePath/Cear%C3%A1_Sporting_Club_logo.svg?width=400']; let fi = 0;
    img.referrerPolicy = 'no-referrer'; img.onerror = () => { if (++fi < fontes.length) img.src = fontes[fi]; else img.outerHTML = SVG_ESCUDO; }; img.src = fontes[0];
    img.onclick = () => { confete(); img.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg) scale(1.2)' }, { transform: 'rotate(360deg)' }], { duration: 800 }); };
    $('#play').onclick = () => confete(innerWidth / 2, innerHeight / 2, 60);
    $$('#v-ceara .curiosidade').forEach((c, i) => {
      const p = $('p', c), alt = ab => { c.classList.toggle('aberta', ab); p.style.maxHeight = ab ? p.scrollHeight + 'px' : '0'; };
      c.tabIndex = 0; c.onclick = () => alt(!c.classList.contains('aberta')); c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.click(); } }); if (i === 0) alt(true);
    });
    const box = $('#proximo'); let timer, ultimo = 0, rodando = false;
    const srvJogos = () => (DB().ceara?.jogos || []).map(e => ({ ...e, src: 'srv', quando: new Date(e.quando) }));
    const fmt = (d, h) => new Intl.DateTimeFormat('pt-BR', h ? { dateStyle: 'full', timeStyle: 'short', timeZone: 'America/Fortaleza' } : { dateStyle: 'full', timeZone: 'America/Fortaleza' }).format(d);
    const cartao = (e, titulo, classe = '', extra = '') => `<div class="card ${classe}"><h3>${titulo}</h3><div class="times"><span>${esc(e.casa)}</span><span class="vs">${e.pc != null && e.pc !== '' ? esc(e.pc) + ' x ' + esc(e.pf) : 'x'}</span><span>${esc(e.fora)}</span></div>
      <small>🏆 ${esc(e.liga || '')}${e.rodada ? ' · rodada ' + esc(e.rodada) : ''}</small><small>📅 ${esc(fmt(e.quando, e.hora))}${e.hora ? ' (Fortaleza)' : ' · horário a definir'}</small>${e.local ? `<small>🏟️ ${esc(e.local)}</small>` : ''}${extra}</div>`;
    const juntar = lista => { // tira jogos repetidos entre fontes (ESPN > TheSportsDB > reserva)
      const rank = { espn: 0, srv: 1, tsdb: 2, base: 3 }, out = [], adv = x => norm(/cear[aá]/i.test(x.casa) ? x.fora : x.casa).slice(0, 4);
      lista.sort((a, b) => rank[a.src] - rank[b.src]).forEach(e => { if (!out.some(o => Math.abs(o.quando - e.quando) < 30 * 36e5 && adv(o) === adv(e))) out.push(e); }); return out;
    };
    function monta(lista, fontesTxt) {
      lista.forEach(e => { e.estado = e.estado || ((e.pc != null && e.pc !== '') ? 'post' : 'pre'); if (e.estado === 'in' && e.quando < Date.now() - 4 * 36e5) e.estado = 'post'; });
      const u = juntar(lista), aovivo = u.find(e => e.estado === 'in'), prox = u.filter(e => e.estado === 'pre' && e.quando > Date.now() - 2 * 36e5).sort((a, b) => a.quando - b.quando)[0], ult = u.filter(e => e.estado === 'post').sort((a, b) => b.quando - a.quando)[0];
      const badge = u.find(e => e.badge)?.badge; if (badge && img.tagName === 'IMG' && fi >= fontes.length) img.src = badge;
      box.innerHTML = (aovivo ? cartao(aovivo, `<span class="ao-vivo">● AO VIVO</span> ${esc(aovivo.detalhe || '')}`, 'aovivo') : '')
        + (prox ? cartao(prox, '⚽ Próximo jogo', '', '<div class="contagem" id="cont"></div>') : `<div class="card"><h3>⚽ Próximo jogo</h3><p class="status">Ainda não tem jogo marcado. A temporada 2026 acabou, e o próximo aparece aqui sozinho assim que o calendário de 2027 sair. 🖤🤍</p></div>`)
        + (ult ? cartao(ult, '📊 Último resultado') : '')
        + `<p class="atualizado" style="grid-column:1/-1">🔄 Atualizado às ${hhmm(new Date())} · fontes: ${esc(fontesTxt)} · <button class="chip" id="atualiza-jogo">Atualizar agora</button></p>`;
      $('#atualiza-jogo').onclick = () => atualiza(true);
      clearInterval(window.__tick);
      if (prox) { const cont = $('#cont'), tick = () => { let d = Math.max(0, prox.quando - Date.now()) / 1000; cont.innerHTML = [['dias', 86400], ['horas', 3600], ['min', 60], ['seg', 1]].map(([n, m]) => { const q = Math.floor(d / m); d -= q * m; return `<div>${String(q).padStart(2, '0')}<br><small>${n}</small></div>`; }).join(''); }; tick(); window.__tick = setInterval(tick, 1000); }
      anima(box); return { aovivo, prox };
    }
    async function atualiza(manual) {
      if (rodando) return; rodando = true; ultimo = Date.now(); clearTimeout(timer);
      const [a, b] = await Promise.allSettled([jogosEspn(), jogosTsdb()]), lista = [], fs = [];
      if (a.status === 'fulfilled' && a.value.length) { lista.push(...a.value); fs.push('ESPN'); }
      if (b.status === 'fulfilled' && b.value.length) { lista.push(...b.value); fs.push('TheSportsDB'); }
      const srv = srvJogos(); if (srv.length) fs.push('dados do site (GitHub)');
      if (!fs.length) fs.push('agenda salva (sem resposta das fontes ao vivo)');
      const { aovivo, prox } = monta([...lista, ...srv, ...BASE_JOGOS.map(x => ({ ...x }))], fs.join(' + '));
      rodando = false; const perto = prox && prox.quando - Date.now() < 3 * 36e5;
      const volta = () => { if (page === 'ceara' && !document.hidden) atualiza(); else timer = setTimeout(volta, 60e3); };
      timer = setTimeout(volta, aovivo ? 45e3 : perto ? 120e3 : 300e3);
    }
    monta([...srvJogos(), ...BASE_JOGOS.map(x => ({ ...x }))], srvJogos().length ? 'dados do site (GitHub)' : 'carregando…'); atualiza();
    entradas.ceara = () => { if (Date.now() - ultimo > 60e3) atualiza(); };
    document.addEventListener('visibilitychange', () => { if (!document.hidden && page === 'ceara') entradas.ceara(); });
  };

  /* ---------- ARTISTAS (Jão, BK, Anavitória, Lagum) ---------- */
  const igual = (...ks) => k => ks.includes(k);
  const ARTISTAS = {
    jao: { nome: 'Jão', albuns: [['Lobos', igual('lobos')], ['Anti-Herói', igual('antiheroi'), '3l3LZovnHa1TmtR1V2fxkP'], ['Pirata', igual('pirata'), '2LeCiUHBSmUMyrclDEEBly'], ['Super', igual('super')],
      ['Memórias Póstumas', igual('memoriaspostumas')], ['Turnê Anti-Herói (Ao Vivo)', k => k.startsWith('turneantiheroi')], ['Supernova', igual('supernova')]],
      show: { bit: 'Jão', ingressos: 'https://www.eventim.com.br/artist/jao/jao-turne-memorias-postumas-4252486/', base: [ // Turnê Memórias Póstumas (conferido em 16/11/2026)
        { dia: '2026-11-21', hora: '21:00', cidade: 'Belo Horizonte, MG', local: 'Ginásio Mineirinho' }, { dia: '2026-11-28', hora: '21:00', cidade: 'Recife, PE', local: 'Ginásio Geraldão' },
        { dia: '2026-12-12', hora: '21:00', cidade: 'Brasília, DF', local: 'Ginásio Nilson Nelson' }, { dia: '2027-03-19', hora: '', cidade: 'Lisboa, Portugal', local: 'Campo Pequeno' },
        { dia: '2027-03-27', hora: '20:00', cidade: 'São Paulo, SP', local: 'Nubank Parque' }] } },
    bk: { nome: 'BK', busca: "BK'", albuns: [['Castelos & Ruínas', k => k.startsWith('castelos')], ['Antes dos Gigantes Chegarem, Vol. 2', k => /^antesdos?gigantes/.test(k) && /2$/.test(k), '2s8fQ4CCEtFzebalX0unvp', ['Antes dos Gigantes Chegarem (feat. Juyè & Luccas Carlos)', 'Adeus (feat. Akira Presidente)', 'Almas (feat. Juyè)']], ['Gigantes', igual('gigantes')],
      ['O Líder em Movimento', k => k.startsWith('olideremmovimento')], ['ICARUS', k => k.startsWith('icarus')], ['VERÃO CRIMINOSO', k => k.startsWith('veraocriminoso')], ['PRODUTO DO AMBIENTE', k => k.startsWith('produtodoambiente')]], show: { bit: "BK'" } },
    anavitoria: { nome: 'Anavitória', albuns: null, show: { bit: 'Anavitória' } },
    lagum: { nome: 'Lagum', albuns: null, show: { bit: 'Lagum' } }
  };
  const PAG_ART = { jao: ['jao'], bk: ['bk'], ana: ['anavitoria', 'lagum'] };
  const chaveAlb = n => norm(n.replace(/\s*-\s*(Single|EP)$/i, '').replace(/\s*[\(\[]\s*(deluxe|expanded|remaster|edi[cç][aã]o)[^\)\]]*[\)\]]/ig, ''));
  const limpaNome = n => n.replace(/\s*-\s*(Single|EP)$/i, '').replace(/\s*[\(\[]\s*(deluxe|expanded|remaster|edi[cç][aã]o)[^\)\]]*[\)\]]/ig, '');
  // feats: sempre mostramos o nome de TODOS os convidados de cada faixa
  const FEAT_RE = /[\(\[]\s*(?:feat\.?|ft\.?|featuring|part\.?|participa[cç][aã]o(?: de)?|com|with)\s+([^\)\]]+)[\)\]]/i;
  const SEP = /\s*(?:,|&|\bfeat\.?\s|\bft\.?\s|\band\b|\be\b|\bx\b)\s*/i;
  const toks = s => String(s).split(SEP).map(x => x.trim()).filter(Boolean);
  const tituloLimpo = n => n.replace(FEAT_RE, '').replace(/\s{2,}/g, ' ').trim();
  const featsDe = (titulo, artistas, main) => { const set = [], add = n => { if (n.length > 1 && norm(n) !== norm(main) && !set.some(s => norm(s) === norm(n))) set.push(n); }; const m = titulo.match(FEAT_RE); if (m) { toks(m[1]).forEach(add); return set; } toks(artistas || '').forEach(add); return set; };
  const faixaDe = (titulo, artistas, A, album, capaUrl, previa) => ({ nome: tituloLimpo(titulo), feats: featsDe(titulo, artistas, A.nome), art: A.nome, album, capa: capaUrl, previa });

  async function albumItunes(A, r) {
    let faixas = []; try { faixas = (await itunes(`https://itunes.apple.com/lookup?id=${r.collectionId}&entity=song&country=BR&limit=200`)).results.filter(x => x.wrapperType === 'track').map(x => faixaDe(x.trackName, x.artistName, A, r.collectionName, capa(x.artworkUrl100), x.previewUrl)); } catch {}
    return { nome: limpaNome(r.collectionName), capa: capa(r.artworkUrl100), ano: new Date(r.releaseDate).getFullYear(), data: r.releaseDate, faixas };
  }
  const deezerFaixas = async (A, id, titulo, cover) => { try { return ((await itunes(`https://api.deezer.com/album/${id}/tracks?limit=100&output=jsonp`)).data || []).map(x => faixaDe(x.title, x.artist?.name, A, titulo, cover, x.preview)); } catch { return []; } };
  // Procura a capa/faixas em 3 fontes: iTunes → Deezer → Spotify (só capa)
  async function achaAlbum(A, nome, ok, spId, todos) {
    let ach = todos.filter(x => ok(chaveAlb(x.collectionName)));
    for (const termo of [A.busca || A.nome, A.nome]) { if (ach.length) break; try { ach = (await itunes(`https://itunes.apple.com/search?term=${encodeURIComponent(termo + ' ' + nome)}&entity=album&country=BR&limit=15`)).results.filter(x => norm(x.artistName).includes(norm(A.nome).slice(0, 2)) && ok(chaveAlb(x.collectionName))); } catch {} }
    const r = ach.find(x => !/deluxe/i.test(x.collectionName)) || ach[0]; if (r) return albumItunes(A, r);
    try {
      for (const q of [`artist:"${A.nome}" album:"${nome}"`, `${A.nome} ${nome}`]) {
        const it = ((await itunes(`https://api.deezer.com/search/album?q=${encodeURIComponent(q)}&limit=15&output=jsonp`)).data || []).find(x => ok(chaveAlb(x.title)) && norm(x.artist?.name || '').includes(norm(A.nome).slice(0, 2)));
        if (it) { const cv = it.cover_xl || it.cover_big || it.cover_medium; return { nome: limpaNome(it.title), capa: cv, faixas: await deezerFaixas(A, it.id, it.title, cv) }; }
      }
    } catch {}
    if (spId) try { const d = await getJson(`https://open.spotify.com/oembed?url=${encodeURIComponent('https://open.spotify.com/album/' + spId)}`); if (d.thumbnail_url) return { nome, capa: d.thumbnail_url, faixas: [] }; } catch {}
    return null;
  }
  async function carregaArtista(k) {
    const A = ARTISTAS[k]; let todos = [];
    try {
      let art; for (const termo of new Set([A.busca || A.nome, A.nome])) { try { art = (await itunes(`https://itunes.apple.com/search?term=${encodeURIComponent(termo)}&entity=musicArtist&country=BR&limit=10`)).results.find(r => norm(r.artistName) === norm(A.nome)); } catch {} if (art) break; }
      if (art) todos = (await itunes(`https://itunes.apple.com/lookup?id=${art.artistId}&entity=album&country=BR&limit=200`)).results.filter(r => r.wrapperType === 'collection');
    } catch {}
    let lista;
    if (A.albuns) lista = await Promise.all(A.albuns.map(async ([nome, ok, id, fixas]) => {
      let a = await achaAlbum(A, nome, ok, id, todos); const base = (DB().faixasManuais?.[k] || {})[nome] || fixas;
      if (base && !a?.faixas?.length) a = { ...(a || { nome }), faixas: base.map(t => faixaDe(t, '', A, nome, a?.capa, null)) };
      return { ...(a || { nome }), art: k, spId: id };
    }));
    else {
      const vis = new Set(), sel = todos.filter(r => !/\s-\s*(Single|EP)$/i.test(r.collectionName) && (r.trackCount || 0) >= 4).sort((a, b) => (/deluxe/i.test(a.collectionName) - /deluxe/i.test(b.collectionName)) || (new Date(b.releaseDate) - new Date(a.releaseDate)))
        .filter(r => { const c = chaveAlb(r.collectionName); if (vis.has(c)) return false; vis.add(c); return true; }).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
      lista = (await Promise.all(sel.map(r => albumItunes(A, r)))).map(a => ({ ...a, art: k }));
      if (!lista.length) try { // iTunes não respondeu: tenta o Deezer
        const ar = ((await itunes(`https://api.deezer.com/search/artist?q=${encodeURIComponent(A.nome)}&output=jsonp`)).data || []).find(x => norm(x.name) === norm(A.nome));
        if (ar) lista = (await Promise.all((((await itunes(`https://api.deezer.com/artist/${ar.id}/albums?limit=100&output=jsonp`)).data) || []).filter(x => x.record_type === 'album').map(async x => ({ nome: limpaNome(x.title), art: k, capa: x.cover_xl || x.cover_big, ano: x.release_date ? +x.release_date.slice(0, 4) : '', data: x.release_date, faixas: await deezerFaixas(A, x.id, x.title, x.cover_xl) })))).sort((a, b) => new Date(b.data) - new Date(a.data));
      } catch {}
    }
    return { lista, todos };
  }

  /* próximo show (Bandsintown ao vivo + datas conferidas) */
  const diasAte = dia => Math.round((Date.parse(dia + 'T00:00:00Z') - Date.parse(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Fortaleza' }).format(new Date()) + 'T00:00:00Z')) / 864e5);
  const fmtDia = (dia, hora) => new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(dia + 'T12:00:00Z')) + (hora ? ' · ' + hora : '');
  async function carregaShow(k, el) {
    const A = ARTISTAS[k], S = A.show; if (!S || !el) return; let ao = [];
    try { const d = await getJson(`https://rest.bandsintown.com/artists/${encodeURIComponent(S.bit)}/events?app_id=presente-da-geo&date=upcoming`);
      if (Array.isArray(d)) ao = d.map(e => ({ dia: (e.datetime || '').slice(0, 10), hora: (e.datetime || '').slice(11, 16) === '00:00' ? '' : (e.datetime || '').slice(11, 16), cidade: [e.venue?.city, e.venue?.region || e.venue?.country].filter(Boolean).join(', '), local: e.venue?.name || '', url: e.url || (e.offers || []).find(o => o.url)?.url || S.ingressos || '' })).filter(e => e.dia);
    } catch {}
    const srvS = DB().shows?.[k] || [], vis = new Set(), lista = [...ao, ...srvS, ...(S.base || [])].map(e => ({ ...e, url: e.url || S.ingressos || '' })).filter(e => diasAte(e.dia) >= 0).filter(e => { const c = e.dia + norm(e.cidade).slice(0, 4); if (vis.has(c)) return false; vis.add(c); return true; }).sort((a, b) => a.dia.localeCompare(b.dia));
    const fontes = [ao.length ? 'Bandsintown' : null, srvS.length ? 'dados do site (GitHub)' : null, S.base ? 'agenda conferida' : null].filter(Boolean).join(' + ') || 'Bandsintown';
    const rot = n => n === 0 ? 'É HOJE! 🎉' : n === 1 ? 'É amanhã!' : `Faltam ${n} dias`;
    if (!lista.length) { el.innerHTML = `<div class="card"><p class="status">Nenhum show marcado por enquanto. Quando ${esc(A.nome)} anunciar um, ele aparece aqui sozinho. 🎟️</p></div><p class="atualizado">🔄 Atualizado às ${hhmm(new Date())} · fonte: ${esc(fontes)}</p>`; return; }
    const p = lista[0];
    el.innerHTML = `<div class="card destaque show-card"><span class="selo">🎟️ Próximo show</span><h3 style="margin-top:6px">${esc(p.cidade)}</h3><p>${esc(fmtDia(p.dia, p.hora))}</p>${p.local ? `<p>🏟️ ${esc(p.local)}</p>` : ''}<p class="dias">${rot(diasAte(p.dia))}</p>
      ${p.url ? `<a class="btn" target="_blank" rel="noopener" href="${esc(p.url)}">🎟️ Ingressos</a>` : ''}</div>
      ${lista.length > 1 ? `<div class="card"><h3 style="font-size:1.1rem">Depois disso</h3><ul class="shows">${lista.slice(1, 8).map(e => `<li><b>${esc(e.cidade)}</b> · ${esc(fmtDia(e.dia, e.hora))}${e.local ? ' · ' + esc(e.local) : ''}</li>`).join('')}</ul></div>` : ''}
      <p class="atualizado">🔄 Atualizado às ${hhmm(new Date())} · fonte: ${esc(fontes)}</p>`; anima(el);
  }

  /* parcerias / feats (entre artistas do site ou de cada artista) */
  async function carregaParcerias(nomes, el, modo, pre = []) {
    if (!el) return 0;
    const siteNorm = Object.values(ARTISTAS).map(a => norm(a.nome)), vis = new Set(), out = [];
    pre.forEach(s => { const c = norm(s.nome) + s.arts.map(norm).sort().join(''); if (!vis.has(c)) { vis.add(c); out.push(s); } });
    const rs = await Promise.allSettled(nomes.map(n => itunes(`https://itunes.apple.com/search?term=${encodeURIComponent(n)}&entity=song&attribute=artistTerm&country=BR&limit=200`)));
    rs.forEach(r => { if (r.status !== 'fulfilled') return; (r.value.results || []).filter(x => x.trackName).forEach(x => {
      const m = x.trackName.match(FEAT_RE), arts = [...new Set([...toks(x.artistName || ''), ...(m ? toks(m[1]) : [])])], nn = arts.map(norm);
      const ok = modo === 'site' ? siteNorm.filter(s => nn.includes(s)).length >= 2 : (arts.length >= 2 && nomes.some(n => nn.includes(norm(n))));
      const chave = norm(tituloLimpo(x.trackName)) + [...nn].sort().join(''); if (!ok || vis.has(chave)) return; vis.add(chave);
      out.push({ nome: tituloLimpo(x.trackName), arts, capa: capa(x.artworkUrl100), data: x.releaseDate });
    }); });
    out.sort((a, b) => new Date(b.data) - new Date(a.data));
    el.innerHTML = out.length ? out.slice(0, 12).map(s => `<article class="card colab"><img src="${esc(s.capa)}" alt="" loading="lazy" onerror="this.style.display='none'"><div><h4>${esc(s.nome)}</h4><small>${esc(s.arts.join(' · '))}</small><small>${esc(mesAno(s.data))}</small>
      <a class="btn spotify" target="_blank" rel="noopener" href="${esc(spot(s.arts.join(' ') + ' ' + s.nome))}">▶ Ouvir</a></div></article>`).join('') : '<p class="status">Nenhuma parceria encontrada por enquanto. Quando sair uma, ela aparece aqui sozinha 🙂</p>';
    anima(el); return out.length;
  }

  function iniciaArtistas(viewKey) {
    const V = $('#v-' + viewKey), q = s => $(s, V), keys = PAG_ART[viewKey], dados = {}, cats = {}; let pool = [], ultimo = 0;
    const modal = q('.modal'), caixa = $('.caixa', modal);
    const linkAlbum = a => a.spId ? 'https://open.spotify.com/album/' + a.spId : spot(`${ARTISTAS[a.art].nome} ${a.nome}`);
    const feat = f => f.feats?.length ? `feat. ${f.feats.join(', ')}` : '';
    modal.onclick = e => { if (e.target === modal) modal.classList.remove('aberto'); };
    addEventListener('keydown', e => e.key === 'Escape' && modal.classList.remove('aberto'));
    const semCapa = `onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'sem-capa',textContent:'💿'}))"`;
    const desenha = k => {
      const cx = $(`[data-artista="${k}"] .a-albuns`, V); if (!cx) return;
      cx.innerHTML = (dados[k] || []).map((a, i) => `<article class="card album" data-k="${k}" data-i="${i}">${a.capa ? `<img src="${esc(a.capa)}" alt="Capa ${esc(a.nome)}" loading="lazy" ${semCapa}>` : '<div class="sem-capa">💿</div>'}
        <h4>${esc(a.nome)}</h4><small>${a.ano ? a.ano + ' · ' : ''}${a.faixas?.length ? a.faixas.length + ' faixas' : 'Álbum'}</small>
        <a class="btn spotify" href="${esc(linkAlbum(a))}" target="_blank" rel="noopener">▶ Ouvir no Spotify</a></article>`).join('') || '<p class="status">Nada por aqui ainda 🤔</p>'; anima(cx);
    };
    const desenhaNovos = k => {
      const cx = $(`.a-novos[data-k="${k}"]`, V); if (!cx) return; const A = ARTISTAS[k], vis = new Set(), lim = Date.now() - 400 * 864e5;
      const r = (cats[k] || []).filter(x => new Date(x.releaseDate) > lim).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)).filter(x => { const c = chaveAlb(x.collectionName); if (vis.has(c)) return false; vis.add(c); return true; }).slice(0, 6);
      cx.innerHTML = r.length ? r.map(x => `<article class="card album novo"><img src="${esc(capa(x.artworkUrl100))}" alt="" loading="lazy" ${semCapa}><small class="tag">${/-\s*Single$/i.test(x.collectionName) ? 'Single' : /-\s*EP$/i.test(x.collectionName) ? 'EP' : 'Álbum'} · ${esc(mesAno(x.releaseDate))}</small><h4>${esc(limpaNome(x.collectionName))}</h4>
        <a class="btn spotify" href="${esc(spot(A.nome + ' ' + limpaNome(x.collectionName)))}" target="_blank" rel="noopener">▶ Ouvir</a></article>`).join('') : `<p class="status">Nada novo nos últimos meses. Quando ${esc(A.nome)} lançar, aparece aqui sozinho 🙂</p>`; anima(cx);
    };
    V.addEventListener('click', e => {
      if (e.target.closest('a')) return; const c = e.target.closest('.album'); if (!c || !c.dataset.k) return; const a = dados[c.dataset.k][c.dataset.i], A = ARTISTAS[a.art];
      caixa.innerHTML = `${a.capa ? `<img src="${esc(a.capa)}" alt="" style="width:100%;border-radius:14px">` : ''}<h3 style="margin-top:12px">${esc(a.nome)}</h3><small>${A.nome}${a.ano ? ' · ' + a.ano : ''}</small>
        ${a.faixas?.length ? `<ol>${a.faixas.map(f => `<li><a target="_blank" rel="noopener" href="${esc(spot(f.art + ' ' + f.nome))}">${esc(f.nome)}</a>${feat(f) ? `<small class="feat"> ${esc(feat(f))}</small>` : ''}</li>`).join('')}</ol>` : '<p class="status">Faixas indisponíveis agora.</p>'}
        <a class="btn spotify" target="_blank" rel="noopener" href="${esc(linkAlbum(a))}">▶ Ouvir no Spotify</a>`; modal.classList.add('aberto');
    });
    const sorteia = () => {
      if (!pool.length) { q('.a-sorteio').innerHTML = '<div class="status" style="grid-column:1/-1">As músicas ainda estão carregando… tenta de novo em instantes 🙏</div>'; return; }
      const f = pick(pool);
      q('.a-sorteio').innerHTML = `<img src="${esc(f.capa)}" alt=""><div><small>🎲 A sorte escolheu…</small><h3>${esc(f.nome)}</h3><small>${esc(f.art)}${feat(f) ? ' · ' + esc(feat(f)) : ''} · ${esc(limpaNome(f.album))}</small>
        <div class="acoes"><a class="btn spotify" target="_blank" rel="noopener" href="${esc(spot(f.art + ' ' + f.nome))}">▶ Ouvir no Spotify</a><button class="btn ghost a-de-novo">🎲 Sortear outra</button></div>
        ${f.previa ? `<audio controls preload="none" src="${esc(f.previa)}"></audio>` : ''}</div>`; q('.a-de-novo').onclick = sorteia; confete(innerWidth / 2, innerHeight / 2, 50);
    };
    q('.a-sortear').onclick = sorteia;
    const mescla = (live, base) => { if (!base?.length) return live; if (!live.length) return base; return live.map(a => { const o = base.find(x => chaveAlb(x.nome) === chaveAlb(a.nome)) || {}; return { ...o, ...a, capa: a.capa || o.capa, ano: a.ano || o.ano, data: a.data || o.data, faixas: a.faixas?.length ? a.faixas : (o.faixas || []) }; }); };
    async function tudo() {
      ultimo = Date.now();
      keys.forEach(k => { const b = DB().artistas?.[k]; if (b?.lista?.length && !dados[k]) { dados[k] = b.lista; cats[k] = b.cats || []; $(`[data-artista="${k}"] .a-status`, V)?.remove(); desenha(k); desenhaNovos(k); } });
      await Promise.all(keys.map(async k => { const r = await carregaArtista(k), b = DB().artistas?.[k]; dados[k] = mescla(r.lista, b?.lista); cats[k] = r.todos.length ? r.todos : (b?.cats || []); $(`[data-artista="${k}"] .a-status`, V)?.remove(); desenha(k); desenhaNovos(k); }));
      const todos = keys.flatMap(k => dados[k]), vistos = new Set(); pool = [];
      todos.forEach(a => (a.faixas || []).forEach(f => { const c = norm(f.nome + f.art); if (!vistos.has(c)) { vistos.add(c); pool.push(f); } }));
      const novo = todos.filter(a => a.data && a.capa).sort((a, b) => new Date(b.data) - new Date(a.data))[0] || todos.find(a => a.capa);
      if (novo) q('.a-capa').innerHTML = `<img src="${esc(novo.capa)}" alt="">`;
      q('.a-contagem').textContent = `${todos.length} álbuns${pool.length ? ' · ' + pool.length + ' músicas' : ''}`;
    }
    const extras = () => { $$('.a-show', V).forEach(el => carregaShow(el.dataset.k, el)); carregaParcerias(keys.map(k => ARTISTAS[k].nome), q('.a-parcerias'), 'artista', keys.flatMap(k => DB().parcerias?.[k] || [])); };
    tudo(); extras();
    entradas[viewKey] = () => { if (Date.now() - ultimo > 10 * 60e3) { tudo(); extras(); } };
    setInterval(() => { if (page === viewKey && !document.hidden) entradas[viewKey](); }, 5 * 60e3);
  }
  inits.jao = () => iniciaArtistas('jao');
  inits.bk = () => iniciaArtistas('bk');
  inits.ana = () => iniciaArtistas('ana');

  /* ---------- MACACOS ---------- */
  inits.macacos = () => {
    const V = $('#v-macacos');
    $$('.flip', V).forEach(f => f.onclick = () => f.classList.toggle('virado'));
    // tamanho do texto
    let fs = +store.get('mac-fs') || 1.2; const aplica = () => { V.style.setProperty('--fs', fs + 'rem'); store.set('mac-fs', fs); };
    $('#aMais').onclick = () => { fs = Math.min(1.8, fs + .1); aplica(); }; $('#aMenos').onclick = () => { fs = Math.max(1, fs - .1); aplica(); }; aplica();
    // soltar a macacada
    $('#macacada').onclick = () => { if (calmo) return; for (let i = 0; i < 12; i++) setTimeout(() => { const s = document.createElement('span'); s.className = 'corre'; s.textContent = pick(['🐒', '🐵', '🙈', '🙉', '🙊', '🦧', '🦍']); s.style.top = rand(8, 80) + 'vh'; s.style.setProperty('--t', rand(4, 8) + 's'); document.body.appendChild(s); setTimeout(() => s.remove(), 8200); }, i * 250); };
    // gerador de macaco
    const M = [['🐒', 'Macaco-prego', 'Usa pedras como ferramenta pra quebrar coco. Um gênio da marreta!'], ['🕷️', 'Macaco-aranha', 'A cauda dele funciona como uma quinta mão. Multitarefa nível máximo.'], ['🦁', 'Mico-leão-dourado', 'Peludinho laranja que virou símbolo da preservação no Brasil.'], ['📢', 'Bugio', 'O famoso macaco-uivador: o grito dele é ouvido de muito longe. Cantor de chuveiro da mata!'], ['❄️', 'Macaco-japonês', 'Toma banho em fontes termais quando faz frio. Spa de macaco!'], ['🌈', 'Mandril', 'Tem o rosto mais colorido do reino dos macacos. Nasceu pra aparecer.'], ['🦧', 'Orangotango', 'Faz um "ninho" novo pra dormir toda noite. Cama sempre arrumada!'], ['🍌', 'Sagui', 'Pequenininho, curioso e fofo. Cabe na palma da mão de tão miudinho!']];
    const g = $('#gerado'); $('#gerar').onclick = () => { const [e, n, f] = pick(M); g.innerHTML = `<div class="gigante">${e}</div><h3>${n}</h3><p>${f}</p>`; confete(innerWidth / 2, innerHeight / 2, 40); };
    // piadas
    const J = ['O que o macaco disse quando atendeu o telefone? “Alô, ba-NANA?”', 'Por que o macaco é ótimo na academia? Porque já nasce pendurado na barra!', 'Qual é o doce preferido do macaco? Bananada, claro!', 'O que o macaco faz na internet? Navega de galho em galho!', 'Qual é o time de futebol do macaco? O Macaco-nense… ele sempre dribla a banana de casca!', 'O que o macaco desejou pra Geo no aniversário? “Que você nunca fique sem banana nem sem Vozão!” 🎂'];
    $('#piada').onclick = () => { const p = $('#piada-txt'); p.textContent = pick(J); confete(innerWidth / 2, innerHeight / 2, 25); };
    // banana clicker
    let n = +store.get('bananas') || 0, aj = +store.get('ajudantes') || 0;
    const info = () => { $('#nb').textContent = Math.floor(n); $('#na').textContent = aj; $('#comprar').disabled = n < 25 * (aj + 1); $('#custo').textContent = 25 * (aj + 1); store.set('bananas', Math.floor(n)); store.set('ajudantes', aj); };
    $('#banana').onclick = e => { n++; pop(e.clientX, e.clientY, ['🍌'], 2); if (n % 50 === 0) confete(innerWidth / 2, innerHeight / 2, 80); info(); };
    $('#comprar').onclick = () => { const c = 25 * (aj + 1); if (n >= c) { n -= c; aj++; pop(innerWidth / 2, innerHeight / 2, ['🐒']); info(); } };
    setInterval(() => { if (aj) { n += aj; info(); } }, 1000); info();
    // quiz
    const Q = [['Qual é o seu rolê ideal?', ['Bagunça e festa', 'Sossego na natureza', 'Resolver desafios']], ['Como você é com os amigos?', ['Divertida e barulhenta', 'Calma e leal', 'Esperta e estrategista']], ['Qual seu lanche?', ['Banana, claro 🍌', 'Frutas e folhas', 'O que tiver, eu dou um jeito']]];
    const RES = ['🐒 Macaco-prego', '🦧 Orangotango', '🐵 Chimpanzé'], DESC = ['Esperta, brincalhona e usa até ferramentas pra conseguir o que quer!', 'Tranquila, sábia e muito carinhosa com quem ama.', 'Inteligente, social e sempre um passo à frente!'];
    const qz = $('#quiz'); let qi = 0, pts = [0, 0, 0];
    const mostra = () => {
      if (qi >= Q.length) { const w = pts.indexOf(Math.max(...pts)); confete(); qz.innerHTML = `<h3>Você é: ${RES[w]}!</h3><p>${DESC[w]}</p><button class="btn" id="again">Refazer</button>`; $('#again').onclick = () => { qi = 0; pts = [0, 0, 0]; mostra(); }; return; }
      qz.innerHTML = `<h3>${Q[qi][0]}</h3>` + Q[qi][1].map((o, i) => `<button class="op" data-r="${i}">${o}</button>`).join('');
      $$('.op', qz).forEach(b => b.onclick = () => { pts[+b.dataset.r]++; qi++; mostra(); });
    }; mostra();
    // galeria
    const lb = $('#lb'), im = $('img', lb);
    $$('.galeria img', V).forEach(i => { i.onerror = () => i.closest('figure').remove(); i.onclick = () => { im.src = i.src.replace('width=600', 'width=1200'); lb.classList.add('aberto'); }; });
    lb.onclick = () => lb.classList.remove('aberto'); addEventListener('keydown', e => e.key === 'Escape' && lb.classList.remove('aberto'));
  };

  /* ---------- MENSAGEM (com senha) ---------- */
  const limpaSenha = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/["'“”‘’«»`´]/g, '').replace(/[.!?,;:]+$/g, '').replace(/\s+/g, ' ').trim();
  const dB64 = b => Uint8Array.from(atob(b), c => c.charCodeAt(0));
  async function decifraCarta(c, senha) { // AES-GCM + PBKDF2 (a mesma conta do editar-carta.html)
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(limpaSenha(senha)), 'PBKDF2', false, ['deriveKey']);
    const k = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: dB64(c.s), iterations: 250000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: dB64(c.i) }, k, dB64(c.d)));
  }
  inits.mensagem = () => {
    const carta = $('.carta'), CF = window.CARTA, inp = $('#senha'), msgErro = $('#erro-senha');
    if (CF?.dica) $('#dica-txt').textContent = CF.dica;
    const formata = t => String(t).trim().replace(/\n/g, '<br>');
    async function abre(html) {
      $('#cadeado').hidden = true; $('#caixa-carta').hidden = false; confete(innerWidth / 2, innerHeight / 2, 140);
      carta.innerHTML = html; const nos = [], tx = [], w = document.createTreeWalker(carta, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) { nos.push(w.currentNode); tx.push(w.currentNode.textContent.replace(/\s+/g, ' ')); }
      const completo = () => nos.forEach((n, i) => n.textContent = tx[i]);
      if (calmo) return completo(); nos.forEach(n => n.textContent = '');
      carta.classList.add('cursor-digita'); let pulou = false; carta.addEventListener('click', () => pulou = true, { once: true });
      for (let i = 0; i < nos.length && !pulou; i++) for (const ch of tx[i]) { if (pulou) break; nos[i].textContent += ch; await sleep(/[.!?,]/.test(ch) ? 160 : 26); }
      completo(); carta.classList.remove('cursor-digita'); chuva(); setTimeout(() => confete(innerWidth / 2, innerHeight / 3, 200), 400);
    }
    const conteudo = async senha => {
      if (!CF) throw new Error('sem carta.js');
      if (CF.cifrado) { if (!window.crypto?.subtle) throw new Error('sem crypto'); try { return formata(await decifraCarta(CF.cifrado, senha)); } catch { return null; } }
      return CF.senha && limpaSenha(senha) === limpaSenha(CF.senha) ? formata(CF.texto) : null;
    };
    const tenta = async () => {
      let r = null;
      try { r = await conteudo(inp.value); } catch (e) { msgErro.textContent = e.message === 'sem crypto' ? 'Esse navegador não consegue abrir a carta aqui. Abra o site pelo link do GitHub 💜' : 'Não achei o arquivo carta.js junto do site 😢'; return; }
      if (r) return abre(r);
      msgErro.textContent = 'Hmm, essa não é a senha 🙈 Tenta de novo!';
      const c = $('#cadeado'); c.classList.remove('treme'); void c.offsetWidth; c.classList.add('treme'); inp.select();
    };
    $('#abrir-senha').onclick = tenta; inp.addEventListener('keydown', e => { if (e.key === 'Enter') tenta(); }); setTimeout(() => inp.focus(), 100);
  };

  /* ================= ROTEADOR (links internos: nunca quebram) ================= */
  const feitos = new Set();
  function ir(p) {
    if (!PAGES.some(x => x[0] === p)) p = 'home';
    page = p; document.body.className = 'page-' + p;
    $$('.view').forEach(v => v.hidden = v.id !== 'v-' + p);
    $$('#dock a').forEach(a => a.classList.toggle('ativo', a.dataset.p === p));
    document.documentElement.dataset.theme = store.get('tema-' + p) || sistema; pintaTema();
    document.title = PAGES.find(x => x[0] === p)[3] + ' · Presente da Geo';
    $('#rodape').className = 'site-footer'; $('#rodape').innerHTML = `<p>${$('#v-' + p).dataset.foot}</p>`;
    scrollTo(0, 0);
    if (!feitos.has(p)) { feitos.add(p); inits[p]?.(); anima($('#v-' + p)); }
    entradas[p]?.();
    if (p === 'home') setTimeout(() => confete(innerWidth / 2, innerHeight / 3, 150), 400);
  }
  if (/^https?:/.test(location.protocol)) setInterval(async () => { try { window.DADOS = await getJson('data/dados.json?v=' + Date.now(), 8000); } catch {} }, 5 * 60e3);
  addEventListener('hashchange', () => ir(location.hash.slice(1)));
  ir(location.hash.slice(1) || document.body.dataset.inicial || 'home');
})();
