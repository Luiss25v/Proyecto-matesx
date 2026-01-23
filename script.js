// ACTIVAR COLOREADO DE CÓDIGO
document.addEventListener('DOMContentLoaded', () => {
    if (window.hljs && typeof window.hljs.highlightAll === 'function') {
        window.hljs.highlightAll();
    }
});

// --- DICCIONARIO DE COLORES NEÓN VIBRANTES ---
const sectionColors = {
    'inicio': '#FFD700',          // Dorado (Original)
    'prod-cartesiano': '#00FF00', // Verde Matrix
    'funciones': '#ff001e',       // <--- CAMBIO AQUÍ: ROJO NEÓN
    'ejercicios': '#00FFFF',      // Turquesa Neón
    'clasificacion': '#BC13FE',   // Púrpura Eléctrico
    'inversa': '#006aff',         // Rojo Neón Intenso
    'compuesta': '#FF00FF',       // Magenta Láser
    'discreta': '#7bff00',        // Naranja Fuego
    'video': '#ff8400',           // Azul Eléctrico
    'resenas': '#00FF9C'          // Menta Tóxico
};

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    // Evitar salto al inicio por href="#"
    if (evt && evt.preventDefault) evt.preventDefault();

    // Color por sección (siempre definido)
    var newColor = sectionColors[tabName] || '#FFD700';

    // Ocultar contenidos
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Resetear botones
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
        tablinks[i].style.borderColor = "transparent";
        tablinks[i].style.color = "#e0e0e0";
    }

    // Mostrar pestaña actual
    var currentTab = document.getElementById(tabName);
    if (currentTab) {
        currentTab.style.display = "block";
        document.documentElement.style.setProperty('--gold-primary', newColor);
    }

    // Activar botón
    if (evt && evt.currentTarget) {
        evt.currentTarget.className += " active";
        evt.currentTarget.style.borderColor = newColor;
        evt.currentTarget.style.color = newColor;
    }
}

// --- CALCULADORAS ---
function calcCartesian() {
    const rawA = document.getElementById('setA').value;
    const rawB = document.getElementById('setB').value;
    const resDiv = document.getElementById('resCartesiano');
    
    if (!rawA || !rawB) { 
        resDiv.innerHTML = "⚠️ DATOS FALTANTES"; 
        resDiv.style.color = "red";
        return; 
    }

    const A = rawA.split(',').map(s => s.trim());
    const B = rawB.split(',').map(s => s.trim());
    let pairs = [];

    A.forEach(a => {
        B.forEach(b => {
            pairs.push(`(${a},${b})`);
        });
    });

    resDiv.style.color = "var(--gold-primary)";
    resDiv.innerHTML = `<strong>PARES GENERADOS:</strong><br>{ ${pairs.join(', ')} }`;
}

// =========================
//  NUEVAS SECCIONES (MC)
//  Clasificación / Inversa / Compuesta / Discreta / Video / Reseñas
// =========================

function parseList(raw) {
    if (!raw) return [];
    return raw.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
}

function parseMapping(raw) {
    const out = { map: {}, pairs: [], errors: [] };
    if (!raw) { out.errors.push("⚠️ Ingresa el mapeo."); return out; }

    let cleaned = raw.replace(/[{}]/g, '').trim();
    cleaned = cleaned.replace(/\(/g, '').replace(/\)/g, '');

    const parts = cleaned.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);

    // Si el usuario puso "1,a,2,b" lo emparejamos
    let chunks = parts;
    const hasArrow = cleaned.includes("->") || cleaned.includes(":") || cleaned.includes("=");
    if (!hasArrow && parts.length % 2 === 0) {
        chunks = [];
        for (let i = 0; i < parts.length; i += 2) chunks.push(parts[i] + "," + parts[i+1]);
    }

    const seps = ["->", ":", "="];
    for (const p of chunks) {
        let x = "", y = "";

        let found = false;
        for (const sep of seps) {
            if (p.includes(sep)) {
                const tmp = p.split(sep);
                x = (tmp[0] || "").trim();
                y = (tmp[1] || "").trim();
                found = true;
                break;
            }
        }
        if (!found && p.includes(",")) {
            const tmp = p.split(",");
            x = (tmp[0] || "").trim();
            y = (tmp[1] || "").trim();
            found = true;
        }

        if (!x || !y) {
            out.errors.push(`⚠️ Par inválido: "${p}"`);
            continue;
        }

        if (Object.prototype.hasOwnProperty.call(out.map, x) && out.map[x] !== y) {
            out.errors.push(`❌ No es función: "${x}" tiene dos salidas (${out.map[x]} y ${y}).`);
            continue;
        }

        out.map[x] = y;
        out.pairs.push([x, y]);
    }

    if (out.pairs.length === 0 && out.errors.length === 0) out.errors.push("⚠️ No se detectaron pares.");
    return out;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}

function pairsTable(pairs, h1="x", h2="f(x)") {
    const rows = pairs.map(([a,b]) => `<tr><td>${escapeHtml(a)}</td><td>${escapeHtml(b)}</td></tr>`).join("");
    return `<table class="mini-table"><thead><tr><th>${escapeHtml(h1)}</th><th>${escapeHtml(h2)}</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function setMatlab(codeId, wrapId, codeStr, autoOpen=true) {
    const codeEl = document.getElementById(codeId);
    const wrap = document.getElementById(wrapId);
    if (!codeEl || !wrap) return;
    codeEl.textContent = codeStr || "";
    if (autoOpen) wrap.style.display = "block";

    // highlight.js (si existe)
    if (window.hljs && typeof window.hljs.highlightElement === "function") {
        try { window.hljs.highlightElement(codeEl); } catch {}
    }
}

function toggleMatlab(wrapId, btnEl) {
    const wrap = document.getElementById(wrapId);
    if (!wrap) return;
    const isHidden = (wrap.style.display === "none" || wrap.style.display === "");
    wrap.style.display = isHidden ? "block" : "none";
    if (btnEl) btnEl.textContent = isHidden ? "Ocultar MATLAB" : "Ver MATLAB";
}

async function copyCode(codeId) {
    const el = document.getElementById(codeId);
    if (!el) return;
    const txt = el.textContent || "";
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(txt);
        } else {
            throw new Error("no clipboard");
        }
    } catch {
        const ta = document.createElement("textarea");
        ta.value = txt;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
    }
}

function badge(text, type="ok") {
    const cls = type === "ok" ? "badge-ok" : (type === "warn" ? "badge-warn" : "badge-bad");
    return `<span class="pill ${cls}">${escapeHtml(text)}</span>`;
}

// --------- CLASIFICACIÓN ----------
function classifyFunction() {
    const domain = parseList(document.getElementById("classDomain")?.value);
    const codomain = parseList(document.getElementById("classCodomain")?.value);
    const mapping = parseMapping(document.getElementById("classMap")?.value);
    const out = document.getElementById("classResult");

    if (!out) return;

    const errors = [];
    if (domain.length === 0) errors.push("⚠️ Dominio A vacío.");
    if (codomain.length === 0) errors.push("⚠️ Codominio B vacío.");
    errors.push(...mapping.errors);

    if (errors.length) {
        out.innerHTML = `<div class="alert-bad">${errors.map(e => `<div>${escapeHtml(e)}</div>`).join("")}</div>`;
        setMatlab("classMatlab", "classMatlabWrap", "% Corrige los datos primero para generar el script MATLAB.", false);
        return;
    }

    // Validar que todo x del dominio tenga imagen
    const missingX = domain.filter(x => !Object.prototype.hasOwnProperty.call(mapping.map, x));
    const extraX = Object.keys(mapping.map).filter(x => !domain.includes(x));

    let isFunction = missingX.length === 0 && mapping.errors.length === 0;

    // Validar que imágenes estén en codominio
    const badY = Object.values(mapping.map).filter(y => !codomain.includes(y));
    if (badY.length) {
        isFunction = false;
        errors.push(`❌ Hay salidas fuera del codominio: ${[...new Set(badY)].join(", ")}`);
    }

    if (!isFunction) {
        const html = [
            badge("NO es función", "bad"),
            missingX.length ? `<div class="alert-warn">Faltan mapeos para: ${escapeHtml(missingX.join(", "))}</div>` : "",
            extraX.length ? `<div class="alert-warn">Sobran entradas (no están en A): ${escapeHtml(extraX.join(", "))}</div>` : "",
            errors.length ? `<div class="alert-bad">${errors.map(e => `<div>${escapeHtml(e)}</div>`).join("")}</div>` : "",
            pairsTable(mapping.pairs, "x", "imagen")
        ].join("");
        out.innerHTML = html;

        setMatlab("classMatlab","classMatlabWrap",
`% CLASIFICACIÓN (revisa datos: no es función con el dominio/codominio actual)
A = {${domain.map(x=>`'${x}'`).join(", ")}};
B = {${codomain.map(x=>`'${x}'`).join(", ")}};
% Mapeo (x -> y)
pairs = {${mapping.pairs.map(([x,y])=>`'${x}','${y}'`).join(", ")}};
% Sugerencia: valida que cada x en A tenga exactamente una salida en B.`, true);
        return;
    }

    // Injectiva: todas las imágenes únicas
    const images = domain.map(x => mapping.map[x]);
    const uniqueImages = new Set(images);
    const injective = uniqueImages.size === images.length;

    // Sobreyectiva: todas las y del codominio aparecen
    const imageSet = new Set(images);
    const surjective = codomain.every(y => imageSet.has(y));

    const bijective = injective && surjective;

    const html = [
        badge("Es función", "ok"),
        injective ? badge("Inyectiva", "ok") : badge("No inyectiva", "warn"),
        surjective ? badge("Sobreyectiva", "ok") : badge("No sobreyectiva", "warn"),
        bijective ? badge("Biyectiva", "ok") : badge("No biyectiva", "warn"),
        `<div style="margin-top:12px">${pairsTable(domain.map(x=>[x, mapping.map[x]]), "x", "f(x)")}</div>`
    ].join(" ");
    out.innerHTML = html;

    // MATLAB script
    const matlab =
`% CLASIFICACIÓN DE UNA FUNCIÓN (discreta)
A = {${domain.map(x=>`'${x}'`).join(", ")}};
B = {${codomain.map(x=>`'${x}'`).join(", ")}};

% Pares (x -> y)
X = {${domain.map(x=>`'${x}'`).join(", ")}};
Y = {${domain.map(x=>`'${mapping.map[x]}'`).join(", ")}};

% Inyectiva: todas las imágenes distintas
isInjective = numel(unique(Y)) == numel(Y);

% Sobreyectiva: cubre todo el codominio
isSurjective = all(ismember(B, Y));

% Biyectiva
isBijective = isInjective && isSurjective;

disp(isInjective); disp(isSurjective); disp(isBijective);`;
    setMatlab("classMatlab","classMatlabWrap", matlab, true);
}

// --------- INVERSA ----------
function invertFunction() {
    const domain = parseList(document.getElementById("invDomain")?.value);
    const codomain = parseList(document.getElementById("invCodomain")?.value);
    const mapping = parseMapping(document.getElementById("invMap")?.value);
    const query = (document.getElementById("invQuery")?.value || "").trim();
    const out = document.getElementById("invResult");
    if (!out) return;

    const errors = [];
    if (domain.length === 0) errors.push("⚠️ Dominio A vacío.");
    if (codomain.length === 0) errors.push("⚠️ Codominio B vacío.");
    errors.push(...mapping.errors);

    if (errors.length) {
        out.innerHTML = `<div class="alert-bad">${errors.map(e => `<div>${escapeHtml(e)}</div>`).join("")}</div>`;
        setMatlab("invMatlab","invMatlabWrap","% Corrige los datos para generar el script MATLAB.", false);
        return;
    }

    // Validar que todo x del dominio tenga imagen y en B
    const missingX = domain.filter(x => !Object.prototype.hasOwnProperty.call(mapping.map, x));
    const images = domain.filter(x=>Object.prototype.hasOwnProperty.call(mapping.map,x)).map(x => mapping.map[x]);
    const badY = images.filter(y => !codomain.includes(y));

    if (missingX.length || badY.length) {
        out.innerHTML = badge("NO es biyectiva → no hay inversa", "bad") +
            (missingX.length ? `<div class="alert-warn">Faltan mapeos para: ${escapeHtml(missingX.join(", "))}</div>` : "") +
            (badY.length ? `<div class="alert-bad">Hay salidas fuera de B: ${escapeHtml([...new Set(badY)].join(", "))}</div>` : "");
        setMatlab("invMatlab","invMatlabWrap","% No hay inversa: revisa dominio/codominio y el mapeo.", true);
        return;
    }

    const injective = (new Set(images)).size === images.length;
    const surjective = codomain.every(y => new Set(images).has(y));
    const bijective = injective && surjective;

    if (!bijective) {
        out.innerHTML = badge("Es función, pero NO biyectiva → no hay inversa", "warn");
        setMatlab("invMatlab","invMatlabWrap","% No hay inversa: se requiere biyectividad.", true);
        return;
    }

    const inv = {};
    domain.forEach(x => { inv[mapping.map[x]] = x; });
    const invPairs = Object.keys(inv).map(y => [y, inv[y]]);

    let queryHtml = "";
    if (query) {
        queryHtml = Object.prototype.hasOwnProperty.call(inv, query)
            ? `<div class="alert-ok">f⁻¹(${escapeHtml(query)}) = <b>${escapeHtml(inv[query])}</b></div>`
            : `<div class="alert-warn">No existe f⁻¹(${escapeHtml(query)}) con el mapeo actual.</div>`;
    }

    out.innerHTML = [
        badge("Biyectiva → inversa existe", "ok"),
        queryHtml,
        `<div style="margin-top:12px">${pairsTable(invPairs, "y", "f⁻¹(y)")}</div>`
    ].join("");

    const matlab =
`% INVERSA DE UNA FUNCIÓN BIYECTIVA (discreta)
A = {${domain.map(x=>`'${x}'`).join(", ")}};
B = {${codomain.map(x=>`'${x}'`).join(", ")}};

X = {${domain.map(x=>`'${x}'`).join(", ")}};
Y = {${domain.map(x=>`'${mapping.map[x]}'`).join(", ")}};

% Verificar biyectividad
isInjective = numel(unique(Y)) == numel(Y);
isSurjective = all(ismember(B, Y));
if ~(isInjective && isSurjective)
    error('No es biyectiva, no existe inversa.');
end

% Construir inversa (y -> x)
invMap = containers.Map(Y, X);

% Consultar ejemplo
yq = '${query || (codomain[0] || "")}';
if isKey(invMap, yq)
    disp(invMap(yq));
else
    disp('No existe f^{-1}(y) para ese valor.');
end`;
    setMatlab("invMatlab","invMatlabWrap", matlab, true);
}

// --------- COMPUESTA ----------
function composeFunctions() {
    const A = parseList(document.getElementById("compDomain")?.value);
    const B = parseList(document.getElementById("compMid")?.value);
    const C = parseList(document.getElementById("compCodomain")?.value);
    const f = parseMapping(document.getElementById("compMapF")?.value);
    const g = parseMapping(document.getElementById("compMapG")?.value);
    const out = document.getElementById("compResult");
    if (!out) return;

    const errors = [];
    if (A.length === 0) errors.push("⚠️ A vacío.");
    if (B.length === 0) errors.push("⚠️ B vacío.");
    if (C.length === 0) errors.push("⚠️ C vacío.");
    errors.push(...f.errors.map(e=>"f: "+e), ...g.errors.map(e=>"g: "+e));

    if (errors.length) {
        out.innerHTML = `<div class="alert-bad">${errors.map(e => `<div>${escapeHtml(e)}</div>`).join("")}</div>`;
        setMatlab("compMatlab","compMatlabWrap","% Corrige los datos para generar el script MATLAB.", false);
        return;
    }

    // Validar f: A->B y g: B->C
    const missingF = A.filter(x => !Object.prototype.hasOwnProperty.call(f.map, x));
    const fOut = A.filter(x=>Object.prototype.hasOwnProperty.call(f.map,x)).map(x=>f.map[x]);
    const badF = fOut.filter(y => !B.includes(y));

    const gKeys = Object.keys(g.map);
    const badGIn = gKeys.filter(y => !B.includes(y));
    const gOut = gKeys.map(y=>g.map[y]);
    const badGOut = gOut.filter(z => !C.includes(z));

    if (missingF.length || badF.length || badGIn.length || badGOut.length) {
        out.innerHTML =
            badge("No se puede componer (datos inconsistentes)", "bad") +
            (missingF.length ? `<div class="alert-warn">f no está definida para: ${escapeHtml(missingF.join(", "))}</div>` : "") +
            (badF.length ? `<div class="alert-bad">f(x) fuera de B: ${escapeHtml([...new Set(badF)].join(", "))}</div>` : "") +
            (badGIn.length ? `<div class="alert-warn">g tiene entradas fuera de B: ${escapeHtml([...new Set(badGIn)].join(", "))}</div>` : "") +
            (badGOut.length ? `<div class="alert-bad">g(y) fuera de C: ${escapeHtml([...new Set(badGOut)].join(", "))}</div>` : "");
        setMatlab("compMatlab","compMatlabWrap","% Revisa que f: A->B y g: B->C.", true);
        return;
    }

    const compPairs = [];
    const stepsRows = [];
    for (const x of A) {
        const y = f.map[x];
        const z = g.map[y];
        compPairs.push([x, z]);
        stepsRows.push([x, y, z]);
    }

    const stepsTable = `<table class="mini-table"><thead><tr><th>x</th><th>f(x)</th><th>g(f(x))</th></tr></thead><tbody>${
        stepsRows.map(r=>`<tr><td>${escapeHtml(r[0])}</td><td>${escapeHtml(r[1])}</td><td>${escapeHtml(r[2])}</td></tr>`).join("")
    }</tbody></table>`;

    out.innerHTML = badge("Compuesta g∘f calculada", "ok") +
        `<div style="margin-top:12px">${stepsTable}</div>` +
        `<div style="margin-top:12px">${pairsTable(compPairs,"x","(g∘f)(x)")}</div>`;

    const matlab =
`% FUNCIÓN COMPUESTA h = g ∘ f
A = {${A.map(x=>`'${x}'`).join(", ")}};
B = {${B.map(x=>`'${x}'`).join(", ")}};
C = {${C.map(x=>`'${x}'`).join(", ")}};

% f: A->B
Xf = {${A.map(x=>`'${x}'`).join(", ")}};
Yf = {${A.map(x=>`'${f.map[x]}'`).join(", ")}};

% g: B->C  (definida en los valores que usa f)
Xg = {${B.map(x=>`'${x}'`).join(", ")}};
% Ajusta Yg según tu mapeo
% Ejemplo (rellena según tu entrada):
% Yg = {...};

% Para usar en MATLAB con maps:
fMap = containers.Map(Xf, Yf);

% gMap (ejemplo): define gMap con tus pares
% gMap = containers.Map(Xg, Yg);

% Calcular h(x) = g(f(x))
% h = cell(size(A));
% for i=1:numel(A)
%   y = fMap(A{i});
%   h{i} = gMap(y);
% end`;
    setMatlab("compMatlab","compMatlabWrap", matlab, true);
}

// --------- DISCRETA ----------
function plotDiscrete() {
    const xs = parseList(document.getElementById("discX")?.value).map(Number);
    const ys = parseList(document.getElementById("discY")?.value).map(Number);
    const out = document.getElementById("discResult");
    const canvas = document.getElementById("discCanvas");

    if (!out) return;

    if (xs.length === 0 || ys.length === 0) {
        out.innerHTML = `<div class="alert-warn">⚠️ Ingresa listas X e Y.</div>`;
        return;
    }
    if (xs.length !== ys.length || xs.some(Number.isNaN) || ys.some(Number.isNaN)) {
        out.innerHTML = `<div class="alert-bad">❌ X e Y deben tener la misma cantidad de números (y ser numéricos).</div>`;
        return;
    }

    const pairs = xs.map((x,i)=>[String(x), String(ys[i])]);
    out.innerHTML = badge("Datos cargados", "ok") + `<div style="margin-top:12px">${pairsTable(pairs,"x","f(x)")}</div>`;

    if (canvas && canvas.getContext) {
        drawDiscretePlot(canvas, xs, ys);
    }

    const matlab =
`% FUNCIÓN DISCRETA (gráfica tipo stem)
x = [${xs.join(" ")}];
y = [${ys.join(" ")}];

stem(x, y, 'filled');
grid on;
xlabel('x'); ylabel('f(x)');
title('Función discreta');`;
    setMatlab("discMatlab","discMatlabWrap", matlab, true);
}

function drawDiscretePlot(canvas, xs, ys) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);

    // margins
    const mx = 40, my = 30;

    // ranges
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(0, ...ys), maxY = Math.max(...ys);

    const xScale = (w - 2*mx) / (maxX - minX || 1);
    const yScale = (h - 2*my) / (maxY - minY || 1);

    const xToPx = x => mx + (x - minX) * xScale;
    const yToPx = y => h - my - (y - minY) * yScale;

    // axes
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx, h-my);
    ctx.lineTo(w-mx, h-my);
    ctx.stroke();

    // stems
    ctx.strokeStyle = "rgba(255, 215, 0, 0.9)";
    ctx.fillStyle = "rgba(255, 215, 0, 0.9)";
    xs.forEach((x,i)=>{
        const px = xToPx(x);
        const py = yToPx(ys[i]);
        const p0 = yToPx(0);
        ctx.beginPath();
        ctx.moveTo(px, p0);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI*2);
        ctx.fill();
    });
}

// --------- RESEÑAS ----------
const REV_KEY = "mc_reviews_v1";

function loadReviews() {
    try {
        const raw = localStorage.getItem(REV_KEY);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch { return []; }
}

function saveReviews(arr) {
    try { localStorage.setItem(REV_KEY, JSON.stringify(arr)); } catch {}
}

function stars(n) {
    const k = Math.max(0, Math.min(5, Number(n)||0));
    return "★".repeat(k) + "☆".repeat(5-k);
}

function renderReviews() {
    const list = document.getElementById("reviewsList");
    if (!list) return;
    const arr = loadReviews();
    if (arr.length === 0) {
        list.innerHTML = `<div class="review-card"><div class="review-text">Aún no hay reseñas.</div></div>`;
        return;
    }
    list.innerHTML = arr.slice().reverse().map(r => {
        const name = escapeHtml(r.name || "Anónimo");
        const text = escapeHtml(r.text || "");
        const date = escapeHtml(r.date || "");
        const rating = Number(r.rating)||0;
        return `<div class="review-card">
            <div class="review-top">
                <div>
                    <div class="review-name">${name}</div>
                    <div class="review-date">${date}</div>
                </div>
                <div class="review-stars">${stars(rating)}</div>
            </div>
            <div class="review-text">${text}</div>
        </div>`;
    }).join("");
}

function addReview() {
    const nameEl = document.getElementById("revName");
    const ratingEl = document.getElementById("revRating");
    const textEl = document.getElementById("revText");
    const msg = document.getElementById("revMsg");

    const name = (nameEl?.value || "").trim();
    const rating = Number(ratingEl?.value || 5);
    const text = (textEl?.value || "").trim();

    if (!text) {
        if (msg) msg.textContent = "Escribe una reseña.";
        return;
    }

    const arr = loadReviews();
    arr.push({
        name: name || "Anónimo",
        rating: Math.max(1, Math.min(5, rating)),
        text,
        date: new Date().toLocaleString()
    });
    saveReviews(arr);
    if (textEl) textEl.value = "";
    if (msg) msg.textContent = "Reseña guardada ✅";
    renderReviews();
}

function clearReviews() {
    try { localStorage.removeItem(REV_KEY); } catch {}
    const msg = document.getElementById("revMsg");
    if (msg) msg.textContent = "Reseñas eliminadas.";
    renderReviews();
}

// Inicialización segura
document.addEventListener("DOMContentLoaded", () => {
    try { renderReviews(); } catch {}
});

window.__MC_APP_LOADED__ = true;
