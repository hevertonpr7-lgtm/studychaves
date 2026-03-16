// =====================
// STUDYCHAVES — app.js
// Analista Tributário RF
// Versão Vercel (sem Flask)
// =====================

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// ── ESTADO GLOBAL ──────────────────────────────────────
const STATE = {
  carga: parseInt(localStorage.getItem('scCarga') || '1'),
  semanaOffset: 0,
  mesOffset: 0,
  diasConcluidos: new Set(JSON.parse(localStorage.getItem('diasConcluidos') || '[]')),
  tarefasFeitas: new Set(JSON.parse(localStorage.getItem('tarefasFeitas') || '[]')),
  questaoIdx: 0,
  questoes: [],
  corretas: 0,
  erradas: 0,
  timerSec: 0,
  timerRodando: false,
  timerInt: null,
  selecionada: null,
  respondida: false,
  charts: {},
};

// ── MATÉRIAS ────────────────────────────────────────────
const MATERIAS = [
  {id:1,  nome:'Língua Portuguesa',              tipo:'basico',    rank:4, prog:0},
  {id:2,  nome:'Inglês / Espanhol',              tipo:'basico',    rank:2, prog:0},
  {id:3,  nome:'Raciocínio Lógico Quantitativo', tipo:'basico',    rank:4, prog:0},
  {id:4,  nome:'Administração Geral e Pública',  tipo:'basico',    rank:3, prog:0},
  {id:5,  nome:'Direito Constitucional',         tipo:'basico',    rank:3, prog:0},
  {id:6,  nome:'Direito Administrativo',         tipo:'basico',    rank:3, prog:0},
  {id:7,  nome:'Contabilidade Geral',            tipo:'especifico',rank:5, prog:0},
  {id:8,  nome:'Direito Tributário',             tipo:'especifico',rank:5, prog:0},
  {id:9,  nome:'Legislação Tributária',          tipo:'especifico',rank:5, prog:0},
  {id:10, nome:'Legislação Aduaneira',           tipo:'especifico',rank:4, prog:0},
  {id:11, nome:'Comércio Internacional',         tipo:'especifico',rank:3, prog:0},
];

// ── CRONOGRAMA ──────────────────────────────────────────
const DIAS_DATA = [
  {principal:{mat:'Direito Tributário',conteudo:'CTN Art. 113 — Obrigação Tributária',dur:'60min',questoes:10},
   sec1:{mat:'Língua Portuguesa',conteudo:'Concordância Verbal',dur:'40min',questoes:5},
   sec2:{mat:'Raciocínio Lógico',conteudo:'Proposições e Conectivos',dur:'30min',questoes:5}},
  {principal:{mat:'Contabilidade Geral',conteudo:'Patrimônio Líquido — Composição',dur:'60min',questoes:10},
   sec1:{mat:'Direito Tributário',conteudo:'CTN Art. 121 — Sujeito Passivo',dur:'40min',questoes:5},
   sec2:{mat:'Direito Constitucional',conteudo:'Art. 37 CF — Adm. Pública',dur:'30min',questoes:5}},
  {principal:{mat:'Legislação Tributária',conteudo:'Lei 9.430/96 Arts. 1 a 20',dur:'60min',questoes:10},
   sec1:{mat:'Contabilidade Geral',conteudo:'DRE — Estrutura e Cálculo',dur:'40min',questoes:5},
   sec2:{mat:'Língua Portuguesa',conteudo:'Regência Verbal',dur:'30min',questoes:5}},
  {principal:{mat:'Direito Tributário',conteudo:'Art. 150 CF — Limitações ao Poder de Tributar',dur:'60min',questoes:10},
   sec1:{mat:'Legislação Aduaneira',conteudo:'Decreto 6.759/09 Arts. 1-20',dur:'40min',questoes:5},
   sec2:{mat:'Administração Geral',conteudo:'Funções Administrativas — PODC',dur:'30min',questoes:5}},
  {principal:{mat:'Contabilidade Geral',conteudo:'Depreciação — Métodos e Cálculo',dur:'60min',questoes:10},
   sec1:{mat:'Comércio Internacional',conteudo:'Incoterms — Principais Termos',dur:'40min',questoes:5},
   sec2:{mat:'Raciocínio Lógico',conteudo:'Silogismos e Inferências',dur:'30min',questoes:5}},
  {revisao:true, blocos:[
    {mat:'Revisão Geral',conteudo:'Dir. Tributário + Contabilidade da semana',dur:'90min'},
    {mat:'Simulado',conteudo:'30 questões — conteúdo da semana',dur:'60min'},
  ]},
];

// ── QUESTÕES ────────────────────────────────────────────
const QUESTOES = [
  {id:1,texto:'Segundo o CTN, a obrigação tributária principal surge com a ocorrência do fato gerador. A obrigação acessória:',alternativas:['A) Tem por objeto o pagamento de tributo.','B) Decorre da legislação e tem por objeto prestações positivas ou negativas nela previstas.','C) Independe da obrigação principal.','D) Não pode ser convertida em obrigação principal.','E) É sempre de natureza pecuniária.'],correta:1,comentario:'Art. 113 do CTN: a obrigação acessória decorre da legislação tributária. Sua inobservância converte-se em obrigação principal quanto à penalidade.',materia:'Direito Tributário',banca:'CEBRASPE',ano:'2023',dif:'Médio',difClass:'badge-medio'},
  {id:2,texto:'O princípio da legalidade tributária (art. 150, I, CF/88) veda à União, Estados, DF e Municípios:',alternativas:['A) Exigir ou aumentar tributo sem lei que o estabeleça.','B) Cobrar tributos antes de 90 dias da publicação da lei.','C) Instituir tratamento desigual entre contribuintes.','D) Utilizar tributo com efeito de confisco.','E) Limitar o tráfego de pessoas por tributos.'],correta:0,comentario:'Art. 150, I, CF veda exigir ou aumentar tributo sem lei. É a principal limitação constitucional ao poder de tributar.',materia:'Direito Tributário',banca:'ESAF',ano:'2022',dif:'Fácil',difClass:'badge-facil'},
  {id:3,texto:'O patrimônio líquido de uma entidade é composto por:',alternativas:['A) Apenas o capital social integralizado.','B) Capital social, reservas de capital, reservas de lucros, ações em tesouraria e prejuízos acumulados.','C) Somente ativos circulantes deduzidos dos passivos circulantes.','D) Capital social e reservas de lucros apenas.','E) Ativo total menos passivo não circulante.'],correta:1,comentario:'O PL é formado por capital social, reservas de capital, ajustes de avaliação patrimonial, reservas de lucros, ações em tesouraria e prejuízos acumulados (art. 178 da Lei 6.404/76).',materia:'Contabilidade Geral',banca:'FGV',ano:'2022',dif:'Fácil',difClass:'badge-facil'},
  {id:4,texto:'Segundo o Decreto 6.759/09 (Regulamento Aduaneiro), zona primária é:',alternativas:['A) Todo o território nacional.','B) Área terrestre ou aquática, contínua ou descontínua, nos portos alfandegados.','C) Apenas os aeroportos internacionais.','D) A faixa de fronteira de 150km.','E) Os recintos alfandegados do interior.'],correta:1,comentario:'Zona primária é a área terrestre ou aquática nos portos alfandegados, a área terrestre nos aeroportos alfandegados e os pontos de fronteira alfandegados.',materia:'Legislação Aduaneira',banca:'CEBRASPE',ano:'2023',dif:'Médio',difClass:'badge-medio'},
];

// ── HELPERS ─────────────────────────────────────────────
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DIAS_S = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const DIAS_F = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];

function getStats() { return JSON.parse(localStorage.getItem('scStats') || '{"edital":0,"questoes":0,"acerto":0,"horas":0,"dias":0}'); }
function saveStats(s) { localStorage.setItem('scStats', JSON.stringify(s)); }

function getSegunda(offset) {
  const d = new Date();
  const dow = d.getDay();
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow) + offset * 7);
  return d;
}

function resetTudo() {
  localStorage.clear();
  location.reload();
}

// ── NAVEGAÇÃO ────────────────────────────────────────────
function navTo(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  if (el) el.classList.add('active');
  renderPage(page);
}

function renderPage(page) {
  ({dashboard:renderDashboard, cronograma:renderCronograma, tarefas:renderTarefasHoje,
    materias:renderMaterias, questoes:renderQuestoes, upload:renderUpload, graficos:renderGraficos}[page] || (()=>{}))();
}

// ── DASHBOARD ────────────────────────────────────────────
function renderDashboard() {
  const h = new Date().getHours();
  document.getElementById('greeting-time').textContent = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  document.getElementById('greeting-sub').textContent = 'Pronto para estudar hoje? Meta: ' + STATE.carga + 'h de estudo';
  const s = getStats();
  document.getElementById('dash-stats').innerHTML = `
    <div class="stat-card"><div class="stat-value">${s.edital}%</div><div class="stat-label">Edital concluído</div><div class="stat-change">Atualize conforme estudar</div></div>
    <div class="stat-card"><div class="stat-value">${s.questoes}</div><div class="stat-label">Questões resolvidas</div><div class="stat-change">Resolva questões para acumular</div></div>
    <div class="stat-card"><div class="stat-value">${s.questoes > 0 ? s.acerto + '%' : '—'}</div><div class="stat-label">Taxa de acerto</div><div class="stat-change">Calculado automaticamente</div></div>
    <div class="stat-card"><div class="stat-value">${s.horas}h</div><div class="stat-label">Horas estudadas</div><div class="stat-change">Marque tarefas para acumular</div></div>`;
  renderSemanaMini();
  renderTarefasCard();
  renderProgressoCard();
  setTimeout(() => {
    document.getElementById('prog-geral').style.width = s.edital + '%';
    document.getElementById('prog-pct').textContent = s.edital + '%';
  }, 300);
}

function renderSemanaMini() {
  const seg = getSegunda(STATE.semanaOffset);
  let html = '';
  for (let i = 0; i < 6; i++) {
    const d = new Date(seg); d.setDate(seg.getDate() + i);
    const isHoje = d.toDateString() === new Date().toDateString();
    const isRev = i === 5;
    const chave = d.toDateString();
    const conc = STATE.diasConcluidos.has(chave);
    html += `<div class="dia-mini${isHoje?' hoje':''}${isRev?' revisao':''}">
      <div class="dia-mini-nome">${DIAS_S[d.getDay()]}</div>
      <div class="dia-mini-num">${d.getDate()}</div>
      <div class="dia-mini-info">${isRev?'Revisão':STATE.carga+'h'}</div>
      <div class="dots"><div class="dot ${conc?'done':'pend'}"></div><div class="dot ${conc?'done':''}"></div></div>
    </div>`;
  }
  document.getElementById('semana-mini').innerHTML = html;
}

function renderTarefasCard() {
  const tarefas = getTarefasHoje();
  document.getElementById('painel-tarefas-hoje').innerHTML = `
    <div class="panel-title">Tarefas de hoje</div>
    ${tarefas.map((t,i) => `
      <div class="task-item${STATE.tarefasFeitas.has('hoje-'+i)?' done':''}" onclick="toggleTarefa(this,'hoje-${i}','${t.dur}')">
        <div class="task-check">${STATE.tarefasFeitas.has('hoje-'+i)?'✓':''}</div>
        <div class="task-info"><div class="task-name">${t.nome}</div><div class="task-meta">${t.dur}</div></div>
        <span class="task-tag tag-${t.tipo}">${t.tipo.toUpperCase()}</span>
      </div>`).join('')}`;
}

function renderProgressoCard() {
  document.getElementById('painel-progresso').innerHTML = `
    <div class="panel-title">Progresso por matéria</div>
    ${MATERIAS.slice(0,6).map(m => `
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px">
          <span style="font-size:13px;color:var(--text)">${m.nome}</span>
          <span style="font-size:12px;color:var(--gold-l);font-family:'Rajdhani',sans-serif;font-weight:600">${m.prog}%</span>
        </div>
        <div style="height:3px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${m.prog}%;background:linear-gradient(90deg,var(--blue-l),var(--gold));border-radius:2px"></div>
        </div>
      </div>`).join('')}`;
}

// ── TAREFAS ──────────────────────────────────────────────
function getTarefasHoje() {
  const dow = new Date().getDay();
  if (dow === 0) return [{nome:'Dia de descanso! Descanse e recarregue.',dur:'',tipo:'revisao'}];
  const diaIdx = dow === 6 ? 5 : dow - 1;
  const dia = DIAS_DATA[diaIdx];
  if (dia.revisao) return dia.blocos.map(b => ({nome:b.conteudo+' ('+b.mat+')',dur:b.dur,tipo:'revisao'}));
  const t = [{nome:dia.principal.conteudo+' — '+dia.principal.mat,dur:dia.principal.dur,tipo:'aula'},
             {nome:dia.principal.questoes+' questões sobre o conteúdo acima',dur:'20min',tipo:'questoes'}];
  if (STATE.carga >= 2 && dia.sec1) t.push({nome:dia.sec1.conteudo+' — '+dia.sec1.mat,dur:dia.sec1.dur,tipo:'aula'});
  if (STATE.carga >= 3 && dia.sec2) t.push({nome:dia.sec2.conteudo+' — '+dia.sec2.mat,dur:dia.sec2.dur,tipo:'aula'});
  return t;
}

function toggleTarefa(el, key, dur) {
  const jaFez = STATE.tarefasFeitas.has(key);
  el.classList.toggle('done');
  el.querySelector('.task-check').textContent = jaFez ? '' : '✓';
  if (jaFez) {
    STATE.tarefasFeitas.delete(key);
  } else {
    STATE.tarefasFeitas.add(key);
    // Acumula horas
    const mins = parseInt((dur||'0').replace(/\D/g,'')) || 0;
    const s = getStats();
    s.horas = Math.round((s.horas + mins/60) * 10) / 10;
    saveStats(s);
  }
  localStorage.setItem('tarefasFeitas', JSON.stringify([...STATE.tarefasFeitas]));
}

function renderTarefasHoje() {
  const tarefas = getTarefasHoje();
  const hoje = new Date();
  document.getElementById('tarefas-hoje-full').innerHTML = `
    <div class="panel">
      <div class="panel-title">${DIAS_F[hoje.getDay()]}, ${hoje.getDate()} de ${MESES[hoje.getMonth()]}</div>
      ${tarefas.map((t,i) => `
        <div class="task-item${STATE.tarefasFeitas.has('hoje-'+i)?' done':''}" onclick="toggleTarefa(this,'hoje-${i}','${t.dur}')">
          <div class="task-check">${STATE.tarefasFeitas.has('hoje-'+i)?'✓':''}</div>
          <div class="task-info"><div class="task-name">${t.nome}</div><div class="task-meta">Estimado: ${t.dur}</div></div>
          <span class="task-tag tag-${t.tipo}">${t.tipo.toUpperCase()}</span>
        </div>`).join('')}
    </div>`;
}

// ── CRONOGRAMA ───────────────────────────────────────────
function setCronoTab(tab, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('crono-semana-view').style.display = tab === 'semana' ? 'block' : 'none';
  document.getElementById('crono-mes-view').style.display = tab === 'mes' ? 'block' : 'none';
  if (tab === 'mes') renderMes(); else renderSemana();
}

function setCarga(h, el) {
  STATE.carga = h;
  localStorage.setItem('scCarga', h);
  document.querySelectorAll('.carga-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderSemana();
}

function renderCronograma() { renderSemana(); }

function getBlocosParaDia(dia) {
  if (!dia || dia.revisao) return [];
  const b = [dia.principal];
  if (STATE.carga >= 2 && dia.sec1) b.push(dia.sec1);
  if (STATE.carga >= 3 && dia.sec2) b.push(dia.sec2);
  return b;
}

function renderSemana() {
  const seg = getSegunda(STATE.semanaOffset);
  const fin = new Date(seg); fin.setDate(fin.getDate() + 5);
  const label = seg.getDate()+' '+MESES[seg.getMonth()].slice(0,3)+' — '+fin.getDate()+' '+MESES[fin.getMonth()].slice(0,3)+' '+fin.getFullYear();
  let total = 0, conc = 0;
  let html = `<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
    <button class="nav-btn" onclick="STATE.semanaOffset--;renderSemana()">‹</button>
    <div class="periodo-label">${label}</div>
    <button class="nav-btn" onclick="STATE.semanaOffset++;renderSemana()">›</button>
    <span style="font-size:12px;color:var(--muted);margin-left:auto" id="sem-resumo"></span>
  </div><div class="semana-grid">`;
  for (let i = 0; i < 6; i++) {
    const d = new Date(seg); d.setDate(seg.getDate() + i);
    const isHoje = d.toDateString() === new Date().toDateString();
    const isRev = i === 5;
    const chave = d.toDateString();
    const isConcluido = STATE.diasConcluidos.has(chave);
    const dia = DIAS_DATA[isRev ? 5 : i];
    const blocos = isRev ? dia.blocos.slice(0, STATE.carga) : getBlocosParaDia(dia);
    total += blocos.length; if (isConcluido) conc += blocos.length;
    const pills = blocos.map((b,bi) => `<div class="task-pill ${isRev?'rev':bi===0?'aula':'sec'}">${(b.mat||b.conteudo).substring(0,28)}</div>`).join('');
    html += `<div class="dia-col${isHoje?' hoje':''}${isRev?' revisao':''}${isConcluido?' concluido':''}" onclick="abrirDetalheDia('${chave}',${i},${isRev})">
      <div class="dia-header">
        <div class="dia-nome-col">${DIAS_S[d.getDay()]}</div>
        <div class="dia-num-col">${d.getDate()}</div>
        <div class="dia-carga">${isRev?'Revisão':STATE.carga+'h · '+blocos.length+' mat.'}</div>
        <div class="dia-check${isConcluido?' done':''}" onclick="event.stopPropagation();toggleDiaConcluido('${chave}')">${isConcluido?'✓':''}</div>
      </div>
      <div class="dia-tasks-col">${pills}</div>
    </div>`;
  }
  html += `</div><div class="detalhe-dia" id="detalhe-semana"></div>`;
  document.getElementById('crono-semana-view').innerHTML = html;
  document.getElementById('sem-resumo').textContent = conc+'/'+total+' blocos concluídos';
}

function abrirDetalheDia(chave, diaIdx, isRev) {
  const dia = DIAS_DATA[isRev ? 5 : diaIdx];
  const blocos = isRev ? dia.blocos : getBlocosParaDia(dia);
  const det = document.getElementById('detalhe-semana');
  det.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:600;color:var(--gold-l);letter-spacing:2px;text-transform:uppercase">${DIAS_F[new Date(chave).getDay()]}, ${new Date(chave).getDate()} de ${MESES[new Date(chave).getMonth()]}</div>
      <button class="btn-sm" onclick="document.getElementById('detalhe-semana').classList.remove('show')">✕ Fechar</button>
    </div>
    ${blocos.map((b,i) => `
      <div class="task-item${STATE.tarefasFeitas.has(chave+'-'+i)?' done':''}" onclick="toggleTarefa(this,'${chave}-${i}','${b.dur||''}')">
        <div class="task-check">${STATE.tarefasFeitas.has(chave+'-'+i)?'✓':''}</div>
        <div class="task-info">
          <div class="task-name">${b.conteudo||b.mat}</div>
          <div class="task-meta">${b.mat||''} · ${b.dur||''}</div>
        </div>
        <span class="task-tag ${isRev?'tag-revisao':'tag-aula'}">${isRev?'REVISÃO':'AULA'}</span>
      </div>`).join('')}`;
  det.classList.add('show');
  det.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function toggleDiaConcluido(chave) {
  if (STATE.diasConcluidos.has(chave)) STATE.diasConcluidos.delete(chave);
  else STATE.diasConcluidos.add(chave);
  localStorage.setItem('diasConcluidos', JSON.stringify([...STATE.diasConcluidos]));
  renderSemana();
}

function renderMes() {
  const hoje = new Date();
  const d = new Date(hoje.getFullYear(), hoje.getMonth() + STATE.mesOffset, 1);
  const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  let html = `<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
    <button class="nav-btn" onclick="STATE.mesOffset--;renderMes()">‹</button>
    <div class="periodo-label">${MESES[d.getMonth()]} ${d.getFullYear()}</div>
    <button class="nav-btn" onclick="STATE.mesOffset++;renderMes()">›</button>
  </div>
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">
    ${DIAS_S.map(n=>`<div style="text-align:center;font-size:10px;color:var(--muted);letter-spacing:2px;padding:8px 0;text-transform:uppercase">${n}</div>`).join('')}`;
  for (let i = 0; i < new Date(d.getFullYear(), d.getMonth(), 1).getDay(); i++) html += `<div></div>`;
  for (let dia = 1; dia <= ultimo; dia++) {
    const data = new Date(d.getFullYear(), d.getMonth(), dia);
    const dow = data.getDay();
    const isHoje = data.toDateString() === hoje.toDateString();
    const chave = data.toDateString();
    const conc = STATE.diasConcluidos.has(chave);
    html += `<div style="background:var(--card);border:1px solid ${isHoje?'var(--gold)':dow===6?'rgba(92,200,90,0.3)':'var(--border)'};border-radius:8px;padding:8px;min-height:56px;opacity:${dow===0?'0.2':'1'};position:relative;cursor:${dow===0?'default':'pointer'}">
      <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:600;color:${isHoje?'var(--gold)':'#fff'}">${dia}</div>
      ${!dow?'':'<div style="display:flex;gap:3px;margin-top:4px"><div style="width:5px;height:5px;border-radius:50%;background:#7BA8F8"></div></div>'}
      ${conc?'<div style="position:absolute;top:5px;right:7px;font-size:11px;color:var(--green)">✓</div>':''}
    </div>`;
  }
  html += `</div>`;
  document.getElementById('crono-mes-view').innerHTML = html;
}

// ── MATÉRIAS ─────────────────────────────────────────────
function renderMaterias() {
  const esp = MATERIAS.filter(m => m.tipo === 'especifico');
  const bas = MATERIAS.filter(m => m.tipo === 'basico');
  const bloco = (titulo, lista) => `
    <div class="panel">
      <div class="panel-title">${titulo}</div>
      ${lista.map(m => `
        <div class="materia-row">
          <div>
            <div class="materia-nome">${m.nome}</div>
            <span class="materia-tipo tipo-${m.tipo}">${m.tipo === 'especifico' ? 'Específico' : 'Básico'}</span>
          </div>
          <div style="display:flex;align-items:center;gap:16px">
            <div class="materia-prog">
              <div class="mat-bar"><div class="mat-fill" style="width:${m.prog}%"></div></div>
              <div class="mat-pct">${m.prog}%</div>
            </div>
            <div class="rank-stars">
              ${[1,2,3,4,5].map(i=>`<span class="star${i<=m.rank?' on':''}" onclick="setMatRank(${m.id},${i})">★</span>`).join('')}
            </div>
          </div>
        </div>`).join('')}
    </div>`;
  document.getElementById('materias-lista').innerHTML = bloco('Conhecimentos Específicos', esp) + bloco('Conhecimentos Básicos', bas);
}

function setMatRank(id, rank) {
  const m = MATERIAS.find(m => m.id === id);
  if (m) { m.rank = rank; renderMaterias(); }
}

// ── QUESTÕES ─────────────────────────────────────────────
function renderQuestoes() {
  document.getElementById('questoes-area').innerHTML = `
    <div class="filters-bar">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:600;letter-spacing:2px;color:var(--gold-l);text-transform:uppercase">Filtros</div>
        <div class="mode-toggle">
          <button class="mode-btn active" onclick="setModo('uma',this)">Uma por vez</button>
          <button class="mode-btn" onclick="setModo('bloco',this)">Bloco</button>
        </div>
      </div>
      <div class="filters-grid">
        <div class="filter-group"><label>Matéria</label>
          <select id="f-mat"><option>Todas</option>${MATERIAS.map(m=>`<option>${m.nome}</option>`).join('')}</select></div>
        <div class="filter-group"><label>Banca</label>
          <select id="f-banca"><option>Todas</option><option>CEBRASPE</option><option>FGV</option><option>ESAF</option><option>FCC</option></select></div>
        <div class="filter-group"><label>Dificuldade</label>
          <select id="f-dif"><option>Todas</option><option>Fácil</option><option>Médio</option><option>Difícil</option></select></div>
        <div class="filter-group"><label>Ano</label>
          <select id="f-ano"><option>Todos</option><option>2024</option><option>2023</option><option>2022</option></select></div>
      </div>
      <button class="btn btn-gold" onclick="iniciarQuestoes()">Iniciar</button>
    </div>
    <div id="questao-container"></div>`;
}

let modoQuestao = 'uma';
function setModo(m, el) {
  modoQuestao = m;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function iniciarQuestoes() {
  STATE.questoes = [...QUESTOES];
  STATE.questaoIdx = 0; STATE.corretas = 0; STATE.erradas = 0;
  carregarQuestao();
  resetTimer(); startTimer();
}

function carregarQuestao() {
  const q = STATE.questoes[STATE.questaoIdx % STATE.questoes.length];
  STATE.selecionada = null; STATE.respondida = false;
  const letras = ['A','B','C','D','E'];
  document.getElementById('questao-container').style.cssText = 'display:grid;grid-template-columns:1fr 300px;gap:20px';
  document.getElementById('questao-container').innerHTML = `
    <div>
      <div class="questao-card">
        <div class="q-header">
          <span class="q-num">QUESTÃO ${STATE.questaoIdx+1} / ${STATE.questoes.length}</span>
          <div class="q-badges">
            <span class="badge badge-mat">${q.materia}</span>
            <span class="badge badge-banca">${q.banca}</span>
            <span class="badge ${q.difClass}">${q.dif}</span>
            <span class="badge badge-banca">${q.ano}</span>
          </div>
        </div>
        <div class="q-text">${q.texto}</div>
        <div class="alternativas">
          ${q.alternativas.map((a,i)=>`<div class="alt" onclick="selecionarAlt(this,${i})"><div class="alt-letra">${letras[i]}</div><div class="alt-text">${a}</div></div>`).join('')}
        </div>
        <div class="gabarito-box" id="gabarito-box">
          <div class="gabarito-title" id="gabarito-title"></div>
          <div class="gabarito-text" id="gabarito-text"></div>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn btn-gold" id="btn-conf" onclick="confirmarResposta()">Confirmar</button>
          <button class="btn btn-outline" id="btn-prox" style="display:none" onclick="proximaQuestao()">Próxima →</button>
          <button class="btn btn-outline" onclick="proximaQuestao()">Pular</button>
        </div>
      </div>
    </div>
    <div>
      <div class="timer-card">
        <div style="font-size:10px;color:var(--muted);letter-spacing:3px;text-transform:uppercase;margin-bottom:8px">Tempo</div>
        <div class="timer-display" id="timer-display">00:00</div>
        <div style="display:flex;gap:8px;margin-top:12px;justify-content:center">
          <button class="btn btn-gold" style="padding:7px 14px;font-size:12px" id="btn-timer" onclick="toggleTimer()">Pausar</button>
          <button class="btn btn-outline" style="padding:7px 14px;font-size:12px" onclick="resetTimer()">Zerar</button>
        </div>
      </div>
      <div class="stats-mini">
        <div style="font-family:'Rajdhani',sans-serif;font-size:12px;letter-spacing:2px;color:var(--gold-l);text-transform:uppercase;margin-bottom:14px">Sessão</div>
        <div class="stat-row"><span class="stat-row-label">Respondidas</span><span class="stat-row-val val-gold" id="sq-resp">0</span></div>
        <div class="stat-row"><span class="stat-row-label">Corretas</span><span class="stat-row-val val-g" id="sq-cert">0</span></div>
        <div class="stat-row"><span class="stat-row-label">Erradas</span><span class="stat-row-val val-r" id="sq-err">0</span></div>
        <div class="stat-row"><span class="stat-row-label">Aproveitamento</span><span class="stat-row-val val-gold" id="sq-aprov">—</span></div>
      </div>
    </div>`;
}

function selecionarAlt(el, i) {
  if (STATE.respondida) return;
  document.querySelectorAll('.alt').forEach(a => a.classList.remove('selected'));
  el.classList.add('selected');
  STATE.selecionada = i;
}

function confirmarResposta() {
  if (STATE.selecionada === null) return;
  STATE.respondida = true;
  const q = STATE.questoes[STATE.questaoIdx % STATE.questoes.length];
  document.querySelectorAll('.alt').forEach((a,i) => {
    a.classList.add('disabled');
    if (i === q.correta) a.classList.add('correta');
    else if (i === STATE.selecionada) a.classList.add('errada');
  });
  const acertou = STATE.selecionada === q.correta;
  if (acertou) STATE.corretas++; else STATE.erradas++;
  const resp = STATE.corretas + STATE.erradas;
  // Salva stats globais
  const s = getStats();
  s.questoes = (s.questoes||0) + 1;
  s.acerto = Math.round(STATE.corretas / resp * 100);
  saveStats(s);
  document.getElementById('sq-resp').textContent = resp;
  document.getElementById('sq-cert').textContent = STATE.corretas;
  document.getElementById('sq-err').textContent = STATE.erradas;
  document.getElementById('sq-aprov').textContent = s.acerto + '%';
  const gb = document.getElementById('gabarito-box');
  gb.classList.add('show');
  if (!acertou) gb.classList.add('errou');
  document.getElementById('gabarito-title').textContent = acertou ? 'Resposta correta!' : 'Resposta errada';
  document.getElementById('gabarito-text').textContent = q.comentario;
  document.getElementById('btn-conf').style.display = 'none';
  document.getElementById('btn-prox').style.display = 'inline-block';
  pausarTimer();
}

function proximaQuestao() {
  STATE.questaoIdx++;
  if (STATE.questaoIdx >= STATE.questoes.length) { alert('Sessão concluída! Parabéns, Thalia!'); return; }
  carregarQuestao(); resetTimer(); startTimer();
}

function startTimer() {
  STATE.timerRodando = true;
  if (document.getElementById('btn-timer')) document.getElementById('btn-timer').textContent = 'Pausar';
  STATE.timerInt = setInterval(() => {
    STATE.timerSec++;
    const el = document.getElementById('timer-display');
    if (!el) { clearInterval(STATE.timerInt); return; }
    el.textContent = fmt(STATE.timerSec);
    el.className = 'timer-display' + (STATE.timerSec > 120 ? ' warn' : '') + (STATE.timerSec > 180 ? ' danger' : '');
  }, 1000);
}
function pausarTimer() { STATE.timerRodando = false; clearInterval(STATE.timerInt); if (document.getElementById('btn-timer')) document.getElementById('btn-timer').textContent = 'Continuar'; }
function toggleTimer() { STATE.timerRodando ? pausarTimer() : startTimer(); }
function resetTimer() { clearInterval(STATE.timerInt); STATE.timerSec = 0; if (document.getElementById('timer-display')) document.getElementById('timer-display').textContent = '00:00'; }
function fmt(s) { return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0'); }

// ── UPLOAD ───────────────────────────────────────────────
let filaPDFs = [];
function renderUpload() {
  document.getElementById('upload-area').innerHTML = `
    <div class="panel">
      <div class="panel-title">Enviar PDFs</div>
      <div class="upload-zone" id="uz" onclick="document.getElementById('fi').click()"
        ondragover="event.preventDefault();this.classList.add('drag-over')"
        ondragleave="this.classList.remove('drag-over')" ondrop="onDrop(event)">
        <div style="font-size:32px;margin-bottom:10px;opacity:0.5">⬆</div>
        <div class="upload-title">Arraste um ou vários PDFs aqui</div>
        <div style="font-size:12px;color:var(--muted)">ou clique para selecionar · PDF · Máx. 50MB por arquivo</div>
        <div class="upload-hint">Você pode selecionar vários arquivos de uma vez!</div>
      </div>
      <input type="file" id="fi" accept=".pdf" multiple onchange="onFileSelect(event)" style="display:none">
      <div id="config-lote" style="display:none;background:rgba(200,168,75,0.06);border:1px solid rgba(200,168,75,0.2);border-radius:10px;padding:16px;margin-bottom:14px">
        <div style="font-size:11px;color:var(--gold-l);letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;font-weight:600">Configurar lote</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
          <div><label style="font-size:11px;color:var(--muted);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:1px">Matéria</label>
            <select id="sel-mat" style="width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:7px;font-size:13px;font-family:'Exo 2',sans-serif">
              <option value="">Selecione...</option>${MATERIAS.map(m=>`<option>${m.nome}</option>`).join('')}
            </select></div>
          <div><label style="font-size:11px;color:var(--muted);display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:1px">Importância</label>
            <div style="display:flex;align-items:center;gap:6px;padding-top:10px">
              ${[1,2,3,4,5].map(i=>`<span style="font-size:20px;cursor:pointer;color:${i<=3?'var(--gold)':'rgba(255,255,255,0.15)'}" id="lrs${i}" onclick="setLoteRank(${i})">★</span>`).join('')}
            </div></div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:12px;color:var(--muted)" id="lote-count"></span>
          <div style="display:flex;gap:8px">
            <button class="btn btn-outline" style="padding:7px 14px;font-size:12px" onclick="filaPDFs=[];renderUpload()">Limpar</button>
            <button class="btn btn-gold" style="padding:7px 18px;font-size:12px" onclick="processarFila()">Enviar todos</button>
          </div>
        </div>
      </div>
      <div id="fila-container"></div>
    </div>
    <div class="panel">
      <div class="panel-title">PDFs na plataforma</div>
      <div style="text-align:center;padding:20px;color:var(--muted);font-size:13px">Nenhum PDF enviado ainda. Faça upload acima para começar!</div>
    </div>`;
}

let loteRank = 3;
function setLoteRank(n) {
  loteRank = n;
  [1,2,3,4,5].forEach(i => { const el = document.getElementById('lrs'+i); if (el) el.style.color = i<=n?'var(--gold)':'rgba(255,255,255,0.15)'; });
}
function onDrop(e) { e.preventDefault(); document.getElementById('uz').classList.remove('drag-over'); adicionarArquivos(Array.from(e.dataTransfer.files).filter(f=>f.name.endsWith('.pdf'))); }
function onFileSelect(e) { adicionarArquivos(Array.from(e.target.files)); e.target.value=''; }
function adicionarArquivos(files) {
  files.forEach(f => { if (!filaPDFs.find(i=>i.nome===f.name)) filaPDFs.push({id:Date.now()+Math.random(),nome:f.name,size:(f.size/1024/1024).toFixed(1)+' MB',prog:0,status:'aguardando'}); });
  renderFila();
  const cl = document.getElementById('config-lote'); if (cl) cl.style.display = filaPDFs.length>0?'block':'none';
  const lc = document.getElementById('lote-count'); if (lc) lc.textContent = filaPDFs.length+' arquivo'+(filaPDFs.length>1?'s':'')+' selecionado'+(filaPDFs.length>1?'s':'');
}
function renderFila() {
  const fc = document.getElementById('fila-container'); if (!fc) return;
  fc.innerHTML = filaPDFs.map(f=>`
    <div style="background:rgba(255,255,255,0.03);border:1px solid ${f.status==='concluido'?'rgba(92,200,90,0.25)':'var(--border)'};border-radius:10px;padding:14px;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:34px;height:34px;border-radius:7px;background:rgba(224,85,85,0.15);border:1px solid rgba(224,85,85,0.2);display:flex;align-items:center;justify-content:center;font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#F08080;flex-shrink:0">PDF</div>
        <div style="flex:1">
          <div style="font-size:13px;color:var(--text);font-weight:500">${f.nome}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px">${f.size}</div>
          <div style="font-size:11px;margin-top:2px;color:${f.status==='concluido'?'#8FE08E':f.status==='processando'?'var(--gold-l)':'var(--muted)'}">${f.status==='aguardando'?'Aguardando...':f.status==='processando'?'Processando — '+Math.round(f.prog)+'%':'Concluído!'}</div>
          ${f.status!=='aguardando'?`<div style="height:3px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden;margin-top:6px"><div style="height:100%;width:${f.prog}%;background:${f.status==='concluido'?'var(--green)':'linear-gradient(90deg,var(--blue-l),var(--gold))'};border-radius:2px;transition:width 0.3s"></div></div>`:''}
        </div>
      </div>
    </div>`).join('');
}
async function processarFila() {
  for (const item of filaPDFs.filter(f=>f.status==='aguardando')) {
    item.status='processando'; item.prog=0; renderFila();
    await new Promise(res => {
      let p=0;
      const iv=setInterval(()=>{ p+=Math.random()*15+5; if(p>=100){p=100;item.prog=100;item.status='concluido';clearInterval(iv);renderFila();setTimeout(res,300);}else{item.prog=p;renderFila();} },200);
    });
  }
}

// ── GRÁFICOS ─────────────────────────────────────────────
function renderGraficos() {
  const s = getStats();
  document.getElementById('graficos-area').innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:20px">
      ${[['0h','Horas totais','Comece a estudar!'],['0','Questões','Resolva questões'],['—','Taxa acerto','Calculado auto.'],['0%','Edital','Marque aulas feitas'],['0','Dias seguidos','Seu recorde aqui']].map(([v,l,d])=>`
        <div class="stat-card"><div class="stat-value">${v}</div><div class="stat-label">${l}</div><div class="stat-change">${d}</div></div>`).join('')}
    </div>
    <div class="panel">
      <div class="panel-header"><div class="panel-title">Progresso por matéria</div></div>
      <canvas id="ch-edital" height="90"></canvas>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div class="panel">
        <div class="panel-header"><div class="panel-title">Questões resolvidas por dia</div></div>
        <canvas id="ch-questoes" height="180"></canvas>
      </div>
      <div class="panel">
        <div class="panel-header"><div class="panel-title">Taxa de acerto por matéria</div></div>
        <canvas id="ch-acerto" height="180"></canvas>
      </div>
    </div>`;
  Chart.defaults.color = '#8A9BB8';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
  Chart.defaults.font.family = 'Exo 2';
  setTimeout(() => {
    const cores = ['#7BA8F8','#E8C96B','#8FE08E','#C4A0F0','#F08080','#F5C96B','#7BA8F8','#8FE08E','#C4A0F0','#F08080','#E8C96B'];
    new Chart(document.getElementById('ch-edital'), {
      type:'bar', data:{labels:MATERIAS.map(m=>m.nome.slice(0,12)+'…'),datasets:[{data:MATERIAS.map(m=>m.prog),backgroundColor:cores.map(c=>c+'88'),borderColor:cores,borderWidth:1,borderRadius:4}]},
      options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{min:0,max:100,ticks:{callback:v=>v+'%'}},x:{grid:{display:false}}}}
    });
    new Chart(document.getElementById('ch-questoes'), {
      type:'line', data:{labels:['Seg','Ter','Qua','Qui','Sex','Sáb'],datasets:[{data:[0,0,0,0,0,0],borderColor:'#8FE08E',backgroundColor:'rgba(92,200,90,0.1)',borderWidth:2,pointRadius:4,fill:true,tension:0.4}]},
      options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{grid:{color:'rgba(255,255,255,0.05)'}},x:{grid:{display:false}}}}
    });
    new Chart(document.getElementById('ch-acerto'), {
      type:'bar', data:{labels:MATERIAS.map(m=>m.nome.slice(0,10)),datasets:[{data:MATERIAS.map(()=>0),backgroundColor:cores.map(c=>c+'99'),borderColor:cores,borderWidth:1,borderRadius:4}]},
      options:{indexAxis:'y',responsive:true,plugins:{legend:{display:false}},scales:{x:{min:0,max:100,ticks:{callback:v=>v+'%'}},y:{grid:{display:false}}}}
    });
  }, 100);
}

// ── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
});
