/* ==========================================================
   MathBot · Ayuda-memoria de Funciones
   3 archivos: index.html + style.css + script.js
   Layout estable:
   - Sidebar fixed
   - Topbar fixed (solid)
   - Scroll solo en main
   Interactivo:
   - MATLAB toggle
   - XP + logros + racha (solo módulos interactivos)
   - Práctica con export CSV/JSON
   ========================================================== */

const TAB_TITLES = {
  "inicio": "Inicio",
  "prod-cartesiano": "Producto Cartesiano",
  "funciones": "Funciones",
  "ejercicios": "Ejemplos / Hojas",
  "clasificacion": "Clasificación",
  "inversa": "Función Inversa",
  "compuesta": "Función Compuesta",
  "discreta": "Función Discreta",
  "video": "Video Explicativo",
  "resenas": "Reseñas"
};

const ACHIEVEMENTS = [
  { id:"first_xp", xp:50, title:"Primer XP", desc:"Gana tus primeros 50 XP." },
  { id:"practice_3", xp:150, title:"Calentando motores", desc:"Resuelve 3 ejercicios." },
  { id:"practice_10", xp:500, title:"Modo serio", desc:"Resuelve 10 ejercicios." },
  { id:"xp_1000", xp:1000, title:"Veterano", desc:"Llega a 1000 XP." },
];

function $(sel, root=document){ return root.querySelector(sel); }
function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

function showToast(msg){
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>el.classList.remove("show"), 2400);
}

/* --------- Topbar height sync (prevents layout drift) --------- */
function syncTopbarHeight(){
  const topbar = $("#topbar");
  if (!topbar) return;
  const h = Math.max(90, Math.round(topbar.getBoundingClientRect().height));
  document.documentElement.style.setProperty("--topbar-height", `${h}px`);
}
window.addEventListener("resize", syncTopbarHeight, { passive:true });

/* --------- Tabs --------- */
function setCurrentSection(tabId){
  const pill = $("#currentSection");
  if (pill) pill.textContent = TAB_TITLES[tabId] || tabId;
}

function openTab(tabId){
  const tabs = $all(".tab-content");
  const buttons = $all(".nav-btn");
  let target = document.getElementById(tabId);

  if (!target){
    tabId = "inicio";
    target = document.getElementById("inicio") || tabs[0];
  }

  tabs.forEach(t=>t.classList.remove("active"));
  target.classList.add("active");

  buttons.forEach(b=>b.classList.toggle("active", b.dataset.tab === tabId));

  setCurrentSection(tabId);

  // persist last tab
  try{ localStorage.setItem("mc_last_tab", tabId); }catch(e){}

  // scroll main to top (stable UX)
  const main = $("#mainScroll");
  if (main) main.scrollTo({ top: 0, behavior: "smooth" });
}

/* --------- Sidebar search --------- */
function initSidebarSearch(){
  const input = $("#sidebarSearch");
  if (!input) return;
  const btns = $all(".nav-btn");
  const norm = (s)=> (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const apply = ()=>{
    const q = norm(input.value.trim());
    btns.forEach(b=>{
      const text = norm(b.textContent);
      b.style.display = (!q || text.includes(q)) ? "" : "none";
    });
  };
  input.addEventListener("input", apply);

  document.addEventListener("keydown",(e)=>{
    if (e.key === "/" && document.activeElement !== input){
      e.preventDefault();
      input.focus();
    }
    if (e.key === "Escape" && document.activeElement === input){
      input.value = "";
      input.blur();
      apply();
    }
  });
  apply();
}

/* --------- MATLAB toggles --------- */
function initMatlabToggles(){
  $all("[data-toggle]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.dataset.toggle;
      const box = document.getElementById(id);
      if (!box) return;
      box.classList.toggle("hidden");
      btn.textContent = box.classList.contains("hidden") ? "Ver MATLAB" : "Ocultar MATLAB";
    });
  });
}

/* --------- Helpers parsing --------- */
function parseList(raw){
  return (raw||"")
    .split(",")
    .map(s=>s.trim())
    .filter(Boolean);
}
function parsePairs(raw){
  // "1->2, 2->3"
  const items = (raw||"").split(",").map(s=>s.trim()).filter(Boolean);
  const pairs = [];
  for (const it of items){
    const m = it.match(/^(.+?)->(.+?)$/);
    if (!m) continue;
    pairs.push([m[1].trim(), m[2].trim()]);
  }
  return pairs;
}
function uniq(arr){
  return Array.from(new Set(arr));
}

/* --------- Product cartesiano --------- */
function initProductoCartesiano(){
  const A = $("#pcA"), B = $("#pcB"), run = $("#pcRun"), out = $("#pcOut");
  const ex = $("#pcExample"), cl = $("#pcClear");
  if (!A || !B || !run || !out) return;

  const example = ()=>{
    A.value = "1,2,3";
    B.value = "a,b,c";
    compute();
  };
  const clear = ()=>{
    A.value = ""; B.value = ""; out.textContent = "—";
  };

  const compute = ()=>{
    const a = parseList(A.value);
    const b = parseList(B.value);
    if (!a.length || !b.length){
      out.textContent = "Ingresa A y B con al menos 1 elemento.";
      return;
    }
    const pairs = [];
    for (const x of a){
      for (const y of b){
        pairs.push(`(${x}, ${y})`);
      }
    }
    out.innerHTML = `<b>|A×B| = ${pairs.length}</b><br/>${pairs.slice(0,90).join(", ")}${pairs.length>90 ? " …" : ""}`;
    awardXp(25, "Producto cartesiano");
  };

  run.addEventListener("click", compute);
  ex?.addEventListener("click", example);
  cl?.addEventListener("click", clear);
}

/* --------- Funciones: check --------- */
function initFunciones(){
  const inp = $("#fnPairs"), btn = $("#fnCheck"), out = $("#fnOut");
  const ex = $("#fnExample"), cl = $("#fnClear");
  if (!inp || !btn || !out) return;

  const example = ()=>{
    inp.value = "1->2, 2->3, 3->3";
    check();
  };
  const clear = ()=>{
    inp.value = ""; out.textContent = "—";
  };

  const check = ()=>{
    const pairs = parsePairs(inp.value);
    if (!pairs.length){
      out.textContent = "Escribe pares como: 1->2, 2->3";
      return;
    }
    const map = new Map();
    for (const [x,y] of pairs){
      if (!map.has(x)) map.set(x, new Set([y]));
      else map.get(x).add(y);
    }
    let ok = true;
    let clash = null;
    for (const [x, ys] of map){
      if (ys.size > 1){ ok=false; clash={x, ys:[...ys]}; break; }
    }
    if (ok){
      out.innerHTML = `✅ <b>Sí es función</b>. Cada x tiene una sola salida. (Dom=${map.size})`;
      awardXp(25, "¿Es función?");
    }else{
      out.innerHTML = `❌ <b>No es función</b>. x=<b>${clash.x}</b> tiene múltiples y: <b>${clash.ys.join(", ")}</b>`;
    }
  };

  btn.addEventListener("click", check);
  ex?.addEventListener("click", example);
  cl?.addEventListener("click", clear);
}

/* --------- Clasificación (iny/sob/bi) --------- */
function classify(domArr, codArr, mapPairs){
  // Normalize: dom set, cod set, mapping dict
  const dom = uniq(domArr);
  const cod = uniq(codArr);
  const pairs = mapPairs;

  // function: every x in mapping has exactly one y AND ideally covers all domain (if desired)
  const map = new Map();
  for (const [x,y] of pairs){
    if (!map.has(x)) map.set(x, new Set([y]));
    else map.get(x).add(y);
  }
  let isFunc = true;
  for (const [x, ys] of map){
    if (ys.size > 1){ isFunc = false; break; }
  }
  // additionally: domain coverage: every element of dom has a mapping
  const missing = dom.filter(x=>!map.has(x));
  const extra = [...map.keys()].filter(x=>!dom.includes(x));

  // range
  const range = [];
  for (const x of dom){
    if (!map.has(x)) continue;
    range.push([...map.get(x)][0]);
  }
  const uniqRange = uniq(range);

  // injective: no two domain elements map to same y (only meaningful if function)
  const isInj = isFunc && uniqRange.length === range.length;

  // surjective: range covers whole codomain
  const isSur = isFunc && cod.every(y=>uniqRange.includes(y));

  const isBij = isFunc && isInj && isSur;

  return { isFunc, isInj, isSur, isBij, missing, extra, range: uniqRange, dom, cod };
}

function initClasificacion(){
  const dom = $("#clDom"), cod = $("#clCod"), map = $("#clMap");
  const run = $("#clRun"), out = $("#clOut");
  const ex = $("#clExample"), cl = $("#clClear");
  if (!dom || !cod || !map || !run || !out) return;

  const example = ()=>{
    dom.value = "1,2,3";
    cod.value = "a,b,c";
    map.value = "1->a, 2->b, 3->c";
    doRun();
  };
  const clear = ()=>{
    dom.value=""; cod.value=""; map.value=""; out.textContent="—";
  };

  const doRun = ()=>{
    const A = parseList(dom.value);
    const B = parseList(cod.value);
    const P = parsePairs(map.value);

    if (!A.length || !B.length || !P.length){
      out.textContent = "Completa dominio, codominio y mapeo.";
      return;
    }
    const r = classify(A,B,P);

    const badges = [];
    badges.push(r.isFunc ? "✅ Función" : "❌ No es función");
    badges.push(r.isInj ? "✅ Inyectiva" : "— No inyectiva");
    badges.push(r.isSur ? "✅ Sobreyectiva" : "— No sobreyectiva");
    badges.push(r.isBij ? "🏆 Biyectiva" : "— No biyectiva");

    const warn = [];
    if (r.extra.length) warn.push(`x fuera del dominio: <b>${r.extra.join(", ")}</b>`);
    if (r.missing.length) warn.push(`faltan mapeos para: <b>${r.missing.join(", ")}</b>`);

    out.innerHTML =
      `<div><b>Resultado:</b> ${badges.join(" · ")}</div>` +
      `<div class="soft small" style="margin-top:8px">Rango (imágenes): { ${r.range.join(", ")} }</div>` +
      (warn.length ? `<div class="soft small" style="margin-top:8px">⚠ ${warn.join(" · ")}</div>` : "");

    if (r.isFunc) awardXp(40, "Clasificación");
  };

  run.addEventListener("click", doRun);
  ex?.addEventListener("click", example);
  cl?.addEventListener("click", clear);
}

/* --------- Inversa (lineal) --------- */
function initInversa(){
  const a = $("#invA"), b = $("#invB"), y = $("#invY"), out = $("#invOut");
  const run = $("#invRun"), ex = $("#invExample"), cl = $("#invClear");
  if (!a || !b || !y || !out || !run) return;

  const doRun = ()=>{
    const A = Number(a.value), B = Number(b.value), Y = Number(y.value);
    if (!Number.isFinite(A) || !Number.isFinite(B) || !Number.isFinite(Y)){
      out.textContent = "Valores inválidos.";
      return;
    }
    if (A === 0){
      out.innerHTML = "❌ a=0 → función constante, no tiene inversa como función.";
      return;
    }
    const x = (Y - B) / A;
    out.innerHTML =
      `<b>f(x)=${A}x${B>=0?"+":""}${B}</b><br/>`+
      `<b>f⁻¹(${Y}) = ( ${Y} - (${B}) ) / ${A} = ${x}</b>`;
    awardXp(25, "Función inversa");
  };

  const example = ()=>{ a.value=2; b.value=3; y.value=7; doRun(); };
  const clear = ()=>{ a.value=""; b.value=""; y.value=""; out.textContent="—"; };

  run.addEventListener("click", doRun);
  ex?.addEventListener("click", example);
  cl?.addEventListener("click", clear);
}

/* --------- Compuesta (lineal) --------- */
function initCompuesta(){
  const a=$("#coA"), b=$("#coB"), c=$("#coC"), d=$("#coD"), x=$("#coX");
  const out=$("#coOut"), run=$("#coRun"), ex=$("#coExample"), cl=$("#coClear");
  if (!a||!b||!c||!d||!x||!out||!run) return;

  const doRun = ()=>{
    const A=Number(a.value), B=Number(b.value), C=Number(c.value), D=Number(d.value), X=Number(x.value);
    if (![A,B,C,D,X].every(Number.isFinite)){
      out.textContent="Valores inválidos.";
      return;
    }
    const gx = C*X + D;
    const fog = A*gx + B;

    const fx = A*X + B;
    const gof = C*fx + D;

    out.innerHTML =
      `<div><b>g(${X})=${C}·${X}${D>=0?"+":""}${D} = ${gx}</b></div>`+
      `<div style="margin-top:6px"><b>(f∘g)(${X}) = f(g(${X})) = ${A}·${gx}${B>=0?"+":""}${B} = ${fog}</b></div>`+
      `<div class="soft small" style="margin-top:10px">(g∘f)(${X}) = ${gof}</div>`;
    awardXp(25, "Composición");
  };

  const example = ()=>{ a.value=2; b.value=1; c.value=1; d.value=-2; x.value=3; doRun(); };
  const clear = ()=>{ a.value=""; b.value=""; c.value=""; d.value=""; x.value=""; out.textContent="—"; };

  run.addEventListener("click", doRun);
  ex?.addEventListener("click", example);
  cl?.addEventListener("click", clear);
}

/* --------- Discreta --------- */
function renderDiscreteTable(vals){
  const wrap = $("#dsTable");
  if (!wrap) return;
  if (!vals.length){ wrap.innerHTML=""; return; }
  const rows = vals.map((v,i)=>`<tr><td>${i+1}</td><td>${v}</td></tr>`).join("");
  wrap.innerHTML = `<table class="table"><thead><tr><th>k</th><th>f(k)</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function initDiscreta(){
  const valsIn=$("#dsVals"), kIn=$("#dsK"), out=$("#dsOut");
  const run=$("#dsRun"), ex=$("#dsExample"), cl=$("#dsClear");
  if (!valsIn||!kIn||!out||!run) return;

  const doRun = ()=>{
    const vals = parseList(valsIn.value).map(v=>Number.isFinite(Number(v)) ? Number(v) : v);
    const k = Number(kIn.value);
    if (!vals.length){
      out.textContent = "Ingresa valores.";
      renderDiscreteTable([]);
      return;
    }
    renderDiscreteTable(vals);
    if (!Number.isFinite(k) || k<1 || k>vals.length){
      out.innerHTML = `k inválido. Debe estar entre 1 y ${vals.length}.`;
      return;
    }
    out.innerHTML = `<b>f(${k}) = ${vals[k-1]}</b> (lista de tamaño ${vals.length})`;
    awardXp(20, "Función discreta");
  };

  const example = ()=>{ valsIn.value="5,1,9,2"; kIn.value=2; doRun(); };
  const clear = ()=>{ valsIn.value=""; kIn.value=1; out.textContent="—"; renderDiscreteTable([]); };

  run.addEventListener("click", doRun);
  ex?.addEventListener("click", example);
  cl?.addEventListener("click", clear);
}

/* --------- XP / Level / Achievements --------- */
function loadXp(){ return Number(localStorage.getItem("mc_xp")||"0"); }
function saveXp(x){ localStorage.setItem("mc_xp", String(Math.max(0, Math.floor(x)))); }
function loadAch(){ try{ return JSON.parse(localStorage.getItem("mc_ach")||"{}")||{}; }catch(e){ return {}; } }
function saveAch(o){ localStorage.setItem("mc_ach", JSON.stringify(o||{})); }

function xpToLevel(xp){
  // every 300 xp => new level
  const lvl = Math.floor(xp/300)+1;
  const cur = xp % 300;
  const pct = (cur/300)*100;
  return { lvl, cur, pct };
}
function renderHud(){
  const xp = loadXp();
  const { lvl, pct } = xpToLevel(xp);
  const lvEl = $("#levelValue"), xpEl = $("#xpValue"), bar = $("#xpBar");
  if (lvEl) lvEl.textContent = String(lvl);
  if (xpEl) xpEl.textContent = String(xp);
  if (bar) bar.style.width = `${Math.max(0, Math.min(100, pct))}%`;

  // stats
  const solved = loadPractice().filter(x=>x.correct).length;
  $("#statSolved")?.textContent = String(solved);
  const ach = Object.values(loadAch()).filter(Boolean).length;
  $("#statAch")?.textContent = String(ach);
}

function showAchievementPopup(title, desc){
  const box = $("#achPopup");
  if (!box) return;
  const el = document.createElement("div");
  el.className = "ach-pop";
  el.innerHTML = `<div style="display:flex;gap:10px;align-items:center;">
    <span style="padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.06)"><i class="fas fa-trophy"></i> Logro</span>
    <div>
      <div style="font-weight:900;letter-spacing:.4px">${title}</div>
      <div style="color:rgba(255,255,255,0.72);font-size:.88rem">${desc||""}</div>
    </div>
  </div>`;
  box.appendChild(el);
  playDing();
  setTimeout(()=>{ try{ el.remove(); }catch(e){} }, 3200);
}

function checkAchievements(){
  const xp = loadXp();
  const ach = loadAch();
  const solved = loadPractice().filter(x=>x.correct).length;

  const rules = [
    { id:"first_xp", ok: xp >= 50 },
    { id:"practice_3", ok: solved >= 3 },
    { id:"practice_10", ok: solved >= 10 },
    { id:"xp_1000", ok: xp >= 1000 },
  ];

  for (const r of rules){
    if (r.ok && !ach[r.id]){
      ach[r.id] = true;
      const meta = ACHIEVEMENTS.find(a=>a.id===r.id);
      if (meta) showAchievementPopup(meta.title, meta.desc);
    }
  }
  saveAch(ach);
  renderHud();
}

function awardXp(amount, reason=""){
  const n = Math.max(0, Math.floor(amount||0));
  if (!n) return;
  const xp = loadXp() + n;
  saveXp(xp);
  renderHud();
  checkAchievements();
  if (reason) showToast(`+${n} XP · ${reason}`);
}

/* --------- Streak --------- */
function todayStr(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function ydayStr(){
  const d = new Date(); d.setDate(d.getDate()-1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function loadStreak(){ try{ return JSON.parse(localStorage.getItem("mc_streak")||"{}")||{}; }catch(e){ return {}; } }
function saveStreak(st){ localStorage.setItem("mc_streak", JSON.stringify(st||{})); }
function updateStreak(){
  const st = loadStreak();
  const t = todayStr(), y = ydayStr();
  if (!st.last){ st.last=t; st.count=1; }
  else if (st.last === t){ /* noop */ }
  else if (st.last === y){ st.last=t; st.count=(st.count||0)+1; }
  else { st.last=t; st.count=1; }
  saveStreak(st);
  $("#streakValue")?.textContent = String(st.count||1);
}

/* --------- Sound --------- */
function loadSound(){ return localStorage.getItem("mc_sound")==="on"; }
function saveSound(on){ localStorage.setItem("mc_sound", on ? "on" : "off"); }
function setSoundBtn(on){
  const btn = $("#soundBtn");
  if (!btn) return;
  btn.title = "Sonido: " + (on ? "on" : "off");
  btn.innerHTML = on ? '<i class="fas fa-volume-high"></i>' : '<i class="fas fa-volume-mute"></i>';
}
function playDing(){
  if (!loadSound()) return;
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.value = 0.0001;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    o.stop(ctx.currentTime + 0.20);
    setTimeout(()=>ctx.close(), 250);
  }catch(e){}
}

/* --------- Achievements modal --------- */
function renderAchievements(){
  const grid = $("#achGrid");
  if (!grid) return;
  const st = loadAch();
  const xp = loadXp();
  grid.innerHTML = "";
  ACHIEVEMENTS.forEach(a=>{
    const unlocked = !!st[a.id] || xp >= a.xp;
    const item = document.createElement("div");
    item.className = "ach-item " + (unlocked ? "unlocked" : "locked");
    item.innerHTML = `
      <div class="left">
        <div class="icon"><i class="fas ${unlocked ? "fa-trophy" : "fa-lock"}"></i></div>
        <div class="meta">
          <div class="title">${a.title}</div>
          <div class="desc">${a.desc}</div>
        </div>
      </div>
      <div style="padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.06);font-size:.78rem">
        ${unlocked ? "Desbloqueado" : (a.xp + " XP")}
      </div>`;
    grid.appendChild(item);
  });
}
function openAchModal(){
  const modal = $("#achModal");
  if (!modal) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
  renderAchievements();
}
function closeAchModal(){
  const modal = $("#achModal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");
}

/* --------- Practice mode --------- */
function loadPractice(){
  try{ return JSON.parse(localStorage.getItem("mc_practice")||"[]")||[]; }catch(e){ return []; }
}
function savePractice(arr){ localStorage.setItem("mc_practice", JSON.stringify(arr||[])); }

function renderPracticeHistory(){
  const box = $("#practiceHistory");
  if (!box) return;
  const arr = loadPractice();
  if (!arr.length){
    box.innerHTML = '<div class="soft">Aún no hay intentos.</div>';
    return;
  }
  const rows = arr.slice().reverse().slice(0,30).map(it=>{
    const tagStyle = it.correct ? "border-color:rgba(0,255,200,0.28);background:rgba(0,255,200,0.08)" : "border-color:rgba(255,80,80,0.30);background:rgba(255,80,80,0.08)";
    return `<div style="display:flex;gap:10px;justify-content:space-between;padding:10px;border-radius:14px;border:1px solid rgba(255,255,255,0.10);background:rgba(0,0,0,0.18);margin-bottom:8px">
      <div style="flex:1;color:rgba(255,255,255,0.85)">${it.topicLabel}: ${it.prompt}</div>
      <div style="padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,0.14);${tagStyle};white-space:nowrap;font-size:.78rem">${it.correct ? "✔" : "✘"} ${it.userAnswer}</div>
    </div>`;
  }).join("");
  box.innerHTML = rows;
}

function downloadText(filename, text){
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 50);
}

let currentPractice = null;
function normAnswer(s){ return (s||"").trim().toLowerCase().replace(/\s+/g,""); }

function genPractice(topic){
  function rint(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
  const mapLabel = {
    cartesiano: "Producto cartesiano",
    composicion: "Función compuesta",
    inversa: "Función inversa",
    funcion: "¿Es función?",
    discreta: "Función discreta",
    clasificacion: "Clasificación"
  };
  const topicLabel = mapLabel[topic] || topic;

  if (topic === "cartesiano"){
    const a = rint(2,7), b=rint(2,7);
    return { topicLabel,
      prompt: `Si |A|=${a} y |B|=${b}, ¿cuántos pares tiene A×B?`,
      answer: String(a*b),
      hint: `|A×B| = |A|·|B| = ${a}·${b}.`
    };
  }
  if (topic === "composicion"){
    const a=rint(1,5), b=rint(-6,6);
    const c=rint(1,5), d=rint(-6,6);
    const k=rint(-3,3);
    const gx = c*k + d;
    const fog = a*gx + b;
    return { topicLabel,
      prompt: `f(x)=${a}x${b>=0?"+":""}${b}, g(x)=${c}x${d>=0?"+":""}${d}. Calcula (f∘g)(${k}).`,
      answer: String(fog),
      hint: `g(${k})=${gx} → f(g(${k}))=${a}·${gx}${b>=0?"+":""}${b}.`
    };
  }
  if (topic === "inversa"){
    const a=rint(1,6), b=rint(-6,6), y=rint(-5,5);
    const x = (y - b)/a;
    const ans = Number.isInteger(x) ? String(x) : `${y - b}/${a}`;
    return { topicLabel,
      prompt: `Sea f(x)=${a}x${b>=0?"+":""}${b}. Calcula f^{-1}(${y}).`,
      answer: ans,
      hint: `x=(y-${b})/${a}.`
    };
  }
  if (topic === "discreta"){
    const n=rint(4,7);
    const vals=Array.from({length:n},()=>rint(-3,9));
    const idx=rint(1,n);
    return { topicLabel,
      prompt: `Si f(1..${n})=[${vals.join(", ")}], ¿cuál es f(${idx})?`,
      answer: String(vals[idx-1]),
      hint: `Toma el elemento en la posición ${idx}.`
    };
  }
  if (topic === "clasificacion"){
    // ask for a word: inyectiva/sobreyectiva/biyectiva/ninguna
    const dom = [1,2,3];
    const cod = ["a","b","c"];
    const t = rint(1,4);
    let mapping;
    let ans;
    if (t===1){ // bijective
      mapping = "1->a, 2->b, 3->c";
      ans = "biyectiva";
    }else if (t===2){ // injective only (not sur)
      mapping = "1->a, 2->b, 3->a";
      ans = "ninguna";
    }else if (t===3){ // surjective not injective
      mapping = "1->a, 2->a, 3->b";
      ans = "ninguna";
    }else{ // injective not sur by cod bigger
      // expand cod
      return { topicLabel,
        prompt: `A={1,2,3}, B={a,b,c,d}, mapeo: 1->a,2->b,3->c. ¿Es "inyectiva", "sobreyectiva", "biyectiva" o "ninguna"?`,
        answer: "inyectiva",
        hint: "Inyectiva: salidas distintas. Sobreyectiva requiere cubrir todo B."
      };
    }
    return { topicLabel,
      prompt: `A={1,2,3}, B={a,b,c}, mapeo: ${mapping}. ¿Es "inyectiva", "sobreyectiva", "biyectiva" o "ninguna"?`,
      answer: ans,
      hint: "Revisa si repite salidas (inyectiva) y si cubre todo B (sobreyectiva)."
    };
  }

  // funcion?
  const A=[1,2,3,4];
  const pairs=[];
  const dup = Math.random() < 0.45;
  const usedX={};
  for (const x of A){
    const y1=rint(1,5);
    pairs.push([x,y1]); usedX[x]=y1;
  }
  if (dup){
    const x=rint(1,4);
    let y2=usedX[x];
    while (y2===usedX[x]) y2=rint(1,5);
    pairs.push([x,y2]);
  }
  return { topicLabel,
    prompt: `R = { ${pairs.map(p=>`(${p[0]},${p[1]})`).join(", ")} }. ¿Es función? Responde "si" o "no".`,
    answer: dup ? "no" : "si",
    hint: `Es función si cada x tiene UNA sola salida.`
  };
}

function initPractice(){
  const topicSel = $("#practiceTopic");
  const genBtn = $("#genPracticeBtn");
  const chkBtn = $("#checkPracticeBtn");
  const hintBtn = $("#hintPracticeBtn");
  const ansIn = $("#practiceAnswer");
  const qBox = $("#practiceQuestion");
  const fb = $("#practiceFeedback");
  const csvBtn = $("#exportCsvBtn");
  const jsonBtn = $("#exportJsonBtn");
  const clearBtn = $("#clearPracticeBtn");

  if (!topicSel || !genBtn || !chkBtn || !ansIn || !qBox || !fb) return;

  renderPracticeHistory();

  function setFeedback(text, ok=null){
    fb.textContent = text || "";
    fb.classList.remove("ok","bad");
    if (ok === true) fb.classList.add("ok");
    if (ok === false) fb.classList.add("bad");
  }

  function generate(){
    const t = topicSel.value;
    currentPractice = genPractice(t);
    qBox.innerHTML = currentPractice.prompt;
    ansIn.value = "";
    ansIn.focus();
    setFeedback("Escribe tu respuesta y presiona Verificar.", null);
  }

  function check(){
    if (!currentPractice){
      setFeedback("Primero genera un ejercicio.", false);
      return;
    }
    const ua = ansIn.value.trim();
    if (!ua){
      setFeedback("Escribe una respuesta.", false);
      return;
    }
    const ok = normAnswer(ua) === normAnswer(currentPractice.answer);
    const arr = loadPractice();
    arr.push({
      ts: new Date().toISOString(),
      topicLabel: currentPractice.topicLabel,
      prompt: currentPractice.prompt,
      userAnswer: ua,
      correct: ok,
      correctAnswer: currentPractice.answer
    });
    savePractice(arr);
    renderPracticeHistory();

    if (ok){
      setFeedback("Correcto ✅  +50 XP", true);
      awardXp(50, "Práctica");
    }else{
      setFeedback(`Incorrecto ❌  Respuesta: ${currentPractice.answer}`, false);
    }
    checkAchievements();
    renderHud();
  }

  function hint(){
    if (!currentPractice){
      setFeedback("Primero genera un ejercicio.", false);
      return;
    }
    setFeedback("Pista: " + currentPractice.hint, null);
  }

  genBtn.addEventListener("click", generate);
  chkBtn.addEventListener("click", check);
  hintBtn.addEventListener("click", hint);
  ansIn.addEventListener("keydown",(e)=>{ if (e.key==="Enter") check(); });

  csvBtn?.addEventListener("click", ()=>{
    const arr = loadPractice();
    const header = ["timestamp","tema","pregunta","respuesta_usuario","correcto","respuesta_correcta"];
    const rows = arr.map(it=>[
      it.ts, it.topicLabel, it.prompt.replaceAll("\n"," "),
      it.userAnswer, it.correct ? "1" : "0", it.correctAnswer
    ].map(v=>`"${String(v).replaceAll('"','""')}"`).join(","));
    downloadText("mc_practice.csv", header.join(",") + "\n" + rows.join("\n"));
  });

  jsonBtn?.addEventListener("click", ()=>{
    downloadText("mc_practice.json", JSON.stringify(loadPractice(), null, 2));
  });

  clearBtn?.addEventListener("click", ()=>{
    savePractice([]);
    renderPracticeHistory();
    setFeedback("Historial borrado.", null);
    showToast("Historial de práctica borrado");
    checkAchievements();
    renderHud();
  });

  generate();
}

/* --------- Reviews (no XP) --------- */
function loadReviews(){ try{ return JSON.parse(localStorage.getItem("mc_reviews")||"[]")||[]; }catch(e){ return []; } }
function saveReviews(arr){ localStorage.setItem("mc_reviews", JSON.stringify(arr||[])); }
function renderReviews(){
  const list = $("#reviewsList");
  if (!list) return;
  const arr = loadReviews();
  if (!arr.length){
    list.innerHTML = '<div class="soft">Aún no hay reseñas.</div>';
    return;
  }
  list.innerHTML = arr.slice().reverse().slice(0,20).map(r=>`
    <div style="padding:10px;border-radius:14px;border:1px solid rgba(255,255,255,0.10);background:rgba(0,0,0,0.18);margin-bottom:8px">
      <div class="soft small">${new Date(r.ts).toLocaleString()}</div>
      <div style="margin-top:6px;color:rgba(255,255,255,0.88)">${r.text}</div>
    </div>`).join("");
}
function initReviews(){
  const txt = $("#reviewText");
  const btn = $("#saveReview");
  if (!txt || !btn) return;
  renderReviews();
  btn.addEventListener("click", ()=>{
    const t = txt.value.trim();
    if (!t){ showToast("Escribe una reseña primero."); return; }
    const arr = loadReviews();
    arr.push({ ts: Date.now(), text: t });
    saveReviews(arr);
    txt.value = "";
    renderReviews();
    showToast("Reseña guardada.");
  });
}

/* --------- Bootstrap --------- */
document.addEventListener("DOMContentLoaded", ()=>{
  syncTopbarHeight();

  // nav events
  $all(".nav-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>openTab(btn.dataset.tab));
  });
  // hero jump buttons
  $all("[data-tab-jump]").forEach(btn=>{
    btn.addEventListener("click", ()=>openTab(btn.dataset.tabJump));
  });

  // restore last tab
  let last = "inicio";
  try{ last = localStorage.getItem("mc_last_tab") || "inicio"; }catch(e){}
  openTab(last);

  initSidebarSearch();
  initMatlabToggles();

  initProductoCartesiano();
  initFunciones();
  initClasificacion();
  initInversa();
  initCompuesta();
  initDiscreta();

  initPractice();
  initReviews();

  // Ach modal
  $("#achBtn")?.addEventListener("click", openAchModal);
  $("#achModal")?.addEventListener("click",(e)=>{
    if (e.target?.dataset?.close) closeAchModal();
  });
  document.addEventListener("keydown",(e)=>{ if (e.key==="Escape") closeAchModal(); });

  // Sound toggle
  let on = loadSound();
  setSoundBtn(on);
  $("#soundBtn")?.addEventListener("click", ()=>{
    on = !on;
    saveSound(on);
    setSoundBtn(on);
    showToast("Sonido: " + (on ? "on" : "off"));
  });

  updateStreak();
  renderHud();
  checkAchievements();
});
