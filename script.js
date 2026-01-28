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
    // Animación: reset clase active
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList && tabcontent[i].classList.remove("active");
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
        
        // Animación: activar
        if (currentTab.classList) {
            requestAnimationFrame(() => currentTab.classList.add("active"));
        }
document.documentElement.style.setProperty('--gold-primary', newColor);
    }

    // Activar botón
    if (evt && evt.currentTarget) {
        evt.currentTarget.className += " active";
        evt.currentTarget.style.borderColor = newColor;
        evt.currentTarget.style.color = newColor;
    }
    try{ ensureMiniMissions(); updateMiniMission(tabName); }catch(e){}


    try{ cleanupNonGameTabs(); }catch(e){}
}

// --- CALCULADORAS ---
function calcCartesian() {
    try{ awardXp(40, "Producto cartesiano"); }catch(e){}
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


// =============================
// UI helpers (toast / download / pair builder)
// =============================
function showToast(msg, type="info", ms=2600) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.className = "toast toast-" + type;
    el.textContent = msg;
    el.style.display = "block";
    el.style.opacity = "1";
    clearTimeout(el.__t);
    el.__t = setTimeout(() => {
        el.style.opacity = "0";
        setTimeout(()=>{ el.style.display = "none"; }, 250);
    }, ms);
}

function downloadCode(codeId, filename="script.m") {
    const el = document.getElementById(codeId);
    if (!el) return;
    const txt = el.textContent || "";
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    showToast("Descargado: " + filename, "ok");
}

// Pair builder store
const pairStore = Object.create(null);

function addPair(prefix, mapInputId) {
    const xEl = document.getElementById(prefix + "PairX");
    const yEl = document.getElementById(prefix + "PairY");
    const listEl = document.getElementById(prefix + "PairsList");
    const mapEl = document.getElementById(mapInputId);

    if (!xEl || !yEl || !listEl || !mapEl) return;

    const x = (xEl.value || "").trim();
    const y = (yEl.value || "").trim();
    if (!x || !y) {
        showToast("Completa x e y.", "warn");
        return;
    }

    pairStore[prefix] = pairStore[prefix] || [];
    const idx = pairStore[prefix].findIndex(p => p[0] === x);
    if (idx >= 0) pairStore[prefix][idx] = [x, y];
    else pairStore[prefix].push([x, y]);

    xEl.value = ""; yEl.value = "";
    syncPairs(prefix, mapInputId);
}

function removePair(prefix, mapInputId, encodedX) {
    const x = decodeURIComponent(encodedX || "");
    pairStore[prefix] = (pairStore[prefix] || []).filter(p => p[0] !== x);
    syncPairs(prefix, mapInputId);
}

function clearPairs(prefix, mapInputId) {
    pairStore[prefix] = [];
    syncPairs(prefix, mapInputId);
    showToast("Pares borrados.", "info");
}

function syncPairs(prefix, mapInputId) {
    const listEl = document.getElementById(prefix + "PairsList");
    const mapEl = document.getElementById(mapInputId);
    if (!listEl || !mapEl) return;

    const arr = pairStore[prefix] || [];
    mapEl.value = arr.map(([x,y]) => `${x}->${y}`).join(", ");

    if (!arr.length) {
        listEl.innerHTML = `<span class="pairs-empty">Sin pares (usa + para agregar)</span>`;
        return;
    }

    listEl.innerHTML = arr.map(([x,y]) => {
        const ex = encodeURIComponent(x);
        return `<span class="pair-chip"><strong>${escapeHtml(x)}</strong>→${escapeHtml(y)} <button class="chip-x" onclick="removePair('${prefix}','${mapInputId}','${ex}')">×</button></span>`;
    }).join("");
}

// When user writes mapping manually, try to reflect it into the builder list
function syncPairsFromInput(prefix, mapInputId) {
    const mapEl = document.getElementById(mapInputId);
    if (!mapEl) return;
    const parsed = parseMapping(mapEl.value);
    if (parsed.errors.length) return; // don't overwrite with bad input
    pairStore[prefix] = parsed.pairs.map(([x,y]) => [x,y]);
    syncPairs(prefix, mapInputId);
}

function clearSection(sectionId) {
    if (sectionId === "clasificacion") {
        ["classDomain","classCodomain","classMap","classPairX","classPairY"].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=""; });
        const out = document.getElementById("classResult"); if(out) out.textContent="Esperando entrada...";
        const wrap = document.getElementById("classMatlabWrap"); if(wrap) wrap.style.display="none";
        pairStore["class"] = []; syncPairs("class","classMap");
    }
    if (sectionId === "inversa") {
        ["invDomain","invCodomain","invMap","invQuery","invPairX","invPairY"].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=""; });
        const out = document.getElementById("invResult"); if(out) out.textContent="Esperando entrada...";
        const wrap = document.getElementById("invMatlabWrap"); if(wrap) wrap.style.display="none";
        pairStore["inv"] = []; syncPairs("inv","invMap");
    }
    if (sectionId === "compuesta") {
        ["compDomain","compMid","compCodomain","compMapF","compMapG","compFPairX","compFPairY","compGPairX","compGPairY"].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=""; });
        const out = document.getElementById("compResult"); if(out) out.textContent="Esperando entrada...";
        const wrap = document.getElementById("compMatlabWrap"); if(wrap) wrap.style.display="none";
        pairStore["compF"] = []; pairStore["compG"] = [];
        syncPairs("compF","compMapF"); syncPairs("compG","compMapG");
    }
    if (sectionId === "discreta") {
        ["discX","discY"].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=""; });
        const out = document.getElementById("discResult"); if(out) out.textContent="Esperando entrada...";
        const wrap = document.getElementById("discMatlabWrap"); if(wrap) wrap.style.display="none";
        const canvas = document.getElementById("discCanvas");
        if (canvas && canvas.getContext) canvas.getContext("2d").clearRect(0,0,canvas.width,canvas.height);
    }
    showToast("Listo: sección limpia.", "ok");
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
            showToast("Copiado ✓", "ok");
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
        showToast("Copiado ✓", "ok");
    }
}

function badge(text, type="ok") {
    const cls = type === "ok" ? "badge-ok" : (type === "warn" ? "badge-warn" : "badge-bad");
    return `<span class="pill ${cls}">${escapeHtml(text)}</span>`;
}

// --------- CLASIFICACIÓN ----------
function classifyFunction() {
    try{ awardXp(60, "Clasificación"); }catch(e){}
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
    try{ awardXp(60, "Inversa"); }catch(e){}
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
    try{ awardXp(70, "Composición"); }catch(e){}
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
    try{ awardXp(70, "Gráfica discreta"); }catch(e){}
    let xs = parseList(document.getElementById("discX")?.value).map(Number);
    let ys = parseList(document.getElementById("discY")?.value).map(Number);
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

    // opciones
    const plotType = document.getElementById("discPlotType")?.value || "stem";
    const useGrid = !!document.getElementById("discGrid")?.checked;
    const sortX = !!document.getElementById("discSortX")?.checked;

    if (sortX) {
        const zipped = xs.map((x,i)=>({x, y: ys[i]})).sort((a,b)=>a.x-b.x);
        xs = zipped.map(p=>p.x);
        ys = zipped.map(p=>p.y);
    }

    const pairs = xs.map((x,i)=>[String(x), String(ys[i])]);
    out.innerHTML = badge("Datos cargados", "ok") + `<div style="margin-top:12px">${pairsTable(pairs,"x","f(x)")}</div>`;

    if (canvas && canvas.getContext) {
        drawDiscretePlot(canvas, xs, ys, { plotType, useGrid });
        ensurePlotTooltip(canvas);
    }

    const matlab =
`% FUNCIÓN DISCRETA (gráfica)
x = [${xs.join(" ")}];
y = [${ys.join(" ")}];

% stem / plot / scatter
${plotType === "stem" ? "stem(x, y, 'filled');" : plotType === "line" ? "plot(x, y, '-o');" : "scatter(x, y, 'filled');"}
grid ${useGrid ? "on" : "off"};
xlabel('x'); ylabel('f(x)');
title('Función discreta');`;
    setMatlab("discMatlab","discMatlabWrap", matlab, true);
}

function drawDiscretePlot(canvas, xs, ys, opts={}) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);

    const plotType = opts.plotType || "stem";
    const useGrid = !!opts.useGrid;

    // margins
    const mx = 48, my = 34;

    // ranges
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(0, ...ys), maxY = Math.max(...ys);

    const xScale = (w - 2*mx) / (maxX - minX || 1);
    const yScale = (h - 2*my) / (maxY - minY || 1);

    const xToPx = x => mx + (x - minX) * xScale;
    const yToPx = y => h - my - (y - minY) * yScale;

    // grid
    if (useGrid) {
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        const n = 6;
        for (let i=1;i<n;i++){
            const gx = mx + i*(w-2*mx)/n;
            const gy = my + i*(h-2*my)/n;
            ctx.beginPath(); ctx.moveTo(gx,my); ctx.lineTo(gx,h-my); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(mx,gy); ctx.lineTo(w-mx,gy); ctx.stroke();
        }
    }

    // axes
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx, h-my);
    ctx.lineTo(w-mx, h-my);
    ctx.stroke();

    // ticks labels (simple)
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "12px Exo 2, sans-serif";
    ctx.fillText(String(minX), mx, h-my+18);
    ctx.fillText(String(maxX), w-mx-18, h-my+18);
    ctx.fillText(String(maxY), 8, my+4);
    ctx.fillText(String(minY), 8, h-my);

    // points for tooltip
    const points = xs.map((x,i)=>({
        x, y: ys[i],
        px: xToPx(x),
        py: yToPx(ys[i]),
        p0: yToPx(0)
    }));
    canvas.__points = points;

    // draw
    ctx.strokeStyle = "rgba(255, 215, 0, 0.9)";
    ctx.fillStyle = "rgba(255, 215, 0, 0.9)";
    ctx.lineWidth = 2;

    if (plotType === "line") {
        ctx.beginPath();
        points.forEach((p, i)=>{
            if(i===0) ctx.moveTo(p.px, p.py);
            else ctx.lineTo(p.px, p.py);
        });
        ctx.stroke();
    }

    points.forEach((p)=>{
        if (plotType === "stem") {
            ctx.beginPath();
            ctx.moveTo(p.px, p.p0);
            ctx.lineTo(p.px, p.py);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(p.px, p.py, 4, 0, Math.PI*2);
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
    const avgEl = document.getElementById("avgRating");
    if (!list) return;

    // promedio
    if (avgEl) {
        if (!arr.length) { avgEl.textContent = "—"; }
        else {
            const avg = arr.reduce((s,r)=>s + Number(r.rating||0), 0) / arr.length;
            avgEl.textContent = avg.toFixed(1) + " ★";
        }
    }
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
    // pair-builder sync on blur
    [["class","classMap"],["inv","invMap"],["compF","compMapF"],["compG","compMapG"]].forEach(([p,id])=>{
        const el=document.getElementById(id);
        if(el){ el.addEventListener("blur", ()=>syncPairsFromInput(p,id)); syncPairs(p,id); }
    });
    // star picker
    initStarPicker();
});

window.__MC_APP_LOADED__ = true;


function ensurePlotTooltip(canvas) {
    if (canvas.__tooltipBound) return;
    canvas.__tooltipBound = true;
    const tip = document.getElementById("plotTip");
    if (!tip) return;

    canvas.addEventListener("mousemove", (e) => {
        const pts = canvas.__points || [];
        if (!pts.length) return;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        // nearest point
        let best = null, bestD = Infinity;
        for (const p of pts) {
            const d = (p.px - mx)*(p.px - mx) + (p.py - my)*(p.py - my);
            if (d < bestD) { bestD = d; best = p; }
        }
        if (best && bestD < 250) {
            tip.style.display = "block";
            tip.innerHTML = `x = <strong>${escapeHtml(best.x)}</strong><br>f(x) = <strong>${escapeHtml(best.y)}</strong>`;
            tip.style.left = (e.pageX + 12) + "px";
            tip.style.top = (e.pageY + 12) + "px";
        } else {
            tip.style.display = "none";
        }
    });
    canvas.addEventListener("mouseleave", () => {
        const tip = document.getElementById("plotTip");
        if (tip) tip.style.display = "none";
    });
}


function initStarPicker() {
    const picker = document.getElementById("starPicker");
    const sel = document.getElementById("revRating");
    if (!picker || !sel) return;

    function paint(v) {
        const stars = picker.querySelectorAll(".star");
        stars.forEach(btn=>{
            const n = Number(btn.dataset.v);
            btn.classList.toggle("on", n <= v);
        });
    }

    const v0 = Number(sel.value || 5);
    paint(v0);

    picker.addEventListener("click", (e)=>{
        const btn = e.target.closest(".star");
        if (!btn) return;
        const v = Number(btn.dataset.v);
        sel.value = String(v);
        paint(v);
        showToast("Rating: " + v + "/5", "info", 1200);
    });

    sel.addEventListener("change", ()=>paint(Number(sel.value||5)));
}


/* ==========================================================
   UI EXTRAS: progress bar + volver arriba (scroll en main-content)
   ========================================================== */
(function initUiExtras(){
    const bar = document.getElementById("scrollProgress");
    const topBtn = document.getElementById("toTopBtn");
    const scroller = document.querySelector(".main-content") || window;

    function getScrollInfo(){
        if (scroller === window){
            const doc = document.documentElement;
            const scrollTop = doc.scrollTop || document.body.scrollTop || 0;
            const scrollHeight = (doc.scrollHeight || 0) - (doc.clientHeight || 0);
            return { scrollTop, scrollHeight };
        } else {
            return { scrollTop: scroller.scrollTop, scrollHeight: scroller.scrollHeight - scroller.clientHeight };
        }
    }

    function onScroll(){
        const { scrollTop, scrollHeight } = getScrollInfo();
        const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        if (bar) bar.style.width = Math.min(100, Math.max(0, pct)) + "%";
        if (topBtn) topBtn.style.display = scrollTop > 420 ? "flex" : "none";
    }

    if (scroller !== window){
        scroller.addEventListener("scroll", onScroll, { passive: true });
    } else {
        window.addEventListener("scroll", onScroll, { passive: true });
    }
    onScroll();

    if (topBtn){
        topBtn.addEventListener("click", () => {
            if (scroller === window){
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                scroller.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    }
})();/* ==========================================================
   FIX: estabilidad de altura en móvil (evita saltos de tamaño)
   ========================================================== */
(function setAppHeight(){
    const root = document.documentElement;
    function apply(){
        // iOS/Android: innerHeight cambia con la barra del navegador al hacer scroll.
        // Congelamos altura real en px para mantener layout consistente.
        root.style.setProperty('--app-height', window.innerHeight + 'px');
    }
    apply();
    window.addEventListener('resize', apply);
    window.addEventListener('orientationchange', apply);
})();


/* ==========================================================
   MODO MISIÓN / PROGRESO (localStorage)
   ========================================================== */
const MISSIONS = [
  { id: "prod-cartesiano", label: "Producto cartesiano" },
  { id: "funciones", label: "Funciones" },
  { id: "ejercicios", label: "Ejemplos / Hojas" },
  { id: "clasificacion", label: "Clasificación" },
  { id: "inversa", label: "Función inversa" },
  { id: "compuesta", label: "Función compuesta" },
  { id: "discreta", label: "Función discreta" }
];

function loadMissions(){
  try{
    return JSON.parse(localStorage.getItem("mc_missions") || "{}") || {};
  }catch(e){ return {}; }
}
function saveMissions(state){
  localStorage.setItem("mc_missions", JSON.stringify(state || {}));
}
function getMissionState(){
  return loadMissions();
}
function setMissionDone(id, done=true){
  const st = loadMissions();
  st[id] = !!done;
  saveMissions(st);
  renderMissions();
  updateMiniMission(id);
}
function resetMissions(){
  localStorage.removeItem("mc_missions");
  renderMissions();
  // actualizar mini barras
  MISSIONS.forEach(m => updateMiniMission(m.id));
  if (typeof showToast === "function") showToast("Progreso reiniciado");
}

function computeMissionStats(){
  const st = loadMissions();
  const total = MISSIONS.length;
  const done = MISSIONS.filter(m => st[m.id]).length;
  const pct = total ? Math.round((done/total)*100) : 0;
  return { total, done, pct };
}

function renderMissions(){
  const list = document.getElementById("missionList");
  const fill = document.getElementById("missionBarFill");
  const pctEl = document.getElementById("missionPct");
  const xpEl = document.getElementById("xpValue");

  if (!list) return;
  const st = loadMissions();
  list.innerHTML = "";

  MISSIONS.forEach(m => {
    
    
    if (["video","resenas"].includes(m.id)) return;
if (["video","resenas"].includes(m.id)) return;
const li = document.createElement("li");
    li.className = "mission-item" + (st[m.id] ? " done" : "");
    const left = document.createElement("div");
    left.className = "left";
    left.innerHTML = `<i class="fas ${st[m.id] ? "fa-circle-check" : "fa-circle"}"></i>
                      <span class="label">${m.label}</span>`;
    const state = document.createElement("span");
    state.className = "state";
    state.textContent = st[m.id] ? "Completada" : "Pendiente";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = st[m.id] ? "Desmarcar" : "Completar";
    btn.addEventListener("click", () => setMissionDone(m.id, !st[m.id]));

    li.appendChild(left);
    li.appendChild(state);
    li.appendChild(btn);
    list.appendChild(li);
  });

  const stats = computeMissionStats();
  if (fill) fill.style.width = stats.pct + "%";
  if (pctEl) pctEl.textContent = stats.pct + "%";
  if (xpEl) xpEl.textContent = stats.done * 120; // XP simple (120 por misión)

  // feedback visual en gold-primary según progreso
}

function ensureMiniMissions(){
  // Inserta una mini barra al inicio de cada tab-content (solo una vez)
  const st = loadMissions();
  MISSIONS.forEach(m => {
    const tab = document.getElementById(m.id);
    if (!tab) return;
    if (tab.querySelector(".mission-mini")) return;

    const bar = document.createElement("div");
    bar.className = "mission-mini";
    bar.dataset.mission = m.id;
    bar.innerHTML = `
      <div class="mini-left">
        <i class="fas fa-bullseye"></i>
        <div class="mini-title">Misión: ${m.label}</div>
      </div>
      <button type="button" class="mini-btn ${st[m.id] ? "done" : ""}">
        ${st[m.id] ? "Completada ✓" : "Marcar completada"}
      </button>
    `;
    const btn = bar.querySelector("button");
    btn.addEventListener("click", () => {
      const now = !!loadMissions()[m.id];
      setMissionDone(m.id, !now);
      if (typeof showToast === "function") showToast(!now ? "Misión completada" : "Misión desmarcada");
    });

    tab.insertBefore(bar, tab.firstChild);
  });
}

function updateMiniMission(id){
  const st = loadMissions();
  const tab = document.getElementById(id);
  if (!tab) return;
  const mini = tab.querySelector(".mission-mini");
  if (!mini) return;
  const btn = mini.querySelector("button");
  if (!btn) return;
  const done = !!st[id];
  btn.classList.toggle("done", done);
  btn.textContent = done ? "Completada ✓" : "Marcar completada";
}

document.addEventListener("DOMContentLoaded", () => {
  renderMissions();
  ensureMiniMissions();
});


/* ==========================================================
   SIDEBAR DRAWER CONTROLS
   ========================================================== */
(function initSidebarDrawer(){
    const btn = document.getElementById("sidebarToggle");
    const backdrop = document.getElementById("sidebarBackdrop");
    function close(){
        document.body.classList.remove("sidebar-open");
    }
    function toggle(){
        document.body.classList.toggle("sidebar-open");
    }
    if (btn) btn.addEventListener("click", toggle);
    if (backdrop) backdrop.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
    });
    // cerrar drawer al tocar un link
    document.addEventListener("click", (e) => {
        const a = e.target && e.target.closest ? e.target.closest(".tab-link") : null;
        if (a && window.matchMedia && window.matchMedia("(max-width: 1200px)").matches){
            close();
        }
    });
})();


/* ==========================================================
   MODO JUEGO: XP + LOGROS (simple, localStorage)
   ========================================================== */
const ACHIEVEMENTS = [
  { id: "xp_300", xp: 300, title: "Aprendiz Lógico", desc: "Alcanza 300 XP" },
  { id: "xp_700", xp: 700, title: "Explorador de Funciones", desc: "Alcanza 700 XP" },
  { id: "xp_1200", xp: 1200, title: "Maestro del Dominio", desc: "Alcanza 1200 XP" }
];

function loadXp(){
  return parseInt(localStorage.getItem("mc_xp") || "0", 10) || 0;
}
function saveXp(v){
  localStorage.setItem("mc_xp", String(v));
  const xpEl = document.getElementById("xpValue");
  if (xpEl) xpEl.textContent = v;
}
// HUD
updateLevelHud(v);

function loadAch(){
  try{ return JSON.parse(localStorage.getItem("mc_ach") || "{}") || {}; }catch(e){ return {}; }
}
function saveAch(st){ localStorage.setItem("mc_ach", JSON.stringify(st||{})); }

function awardXp(amount, reason){
  const xp = loadXp() + amount;
  saveXp(xp);
  if (typeof showToast === "function") showToast(`+${amount} XP${reason ? " · " + reason : ""}`);
  checkAchievements(xp);
}

function checkAchievements(xp){
  const st = loadAch();
  let unlocked = 0;
  ACHIEVEMENTS.forEach(a => {
    if (!st[a.id] && xp >= a.xp){
      st[a.id] = true;
      unlocked++;
      if (typeof showToast === "function") showToast(`Logro desbloqueado: ${a.title}`);
    }
  });
  if (unlocked) saveAch(st);
}

// Inicializar XP badge al cargar
document.addEventListener("DOMContentLoaded", () => {
  const xp = loadXp();
  saveXp(xp);
});


/* ==========================================================
   LEVEL HUD (LV + barra de XP)
   ========================================================== */
function updateLevelHud(xp){
  const levelSize = 500; // XP por nivel
  const level = Math.floor((xp || 0) / levelSize) + 1;
  const inLevel = (xp || 0) % levelSize;
  const pct = Math.round((inLevel / levelSize) * 100);

  const lvlEl = document.getElementById("levelValue");
  const barEl = document.getElementById("xpBar");
  if (lvlEl) lvlEl.textContent = level;
  if (barEl) barEl.style.width = pct + "%";
}


/* ==========================================================
   FX: glow que sigue el cursor (ligero)
   ========================================================== */
(function initCursorGlow(){
  const root = document.documentElement;
  function setPos(x,y){
    root.style.setProperty('--mx', x + 'px');
    root.style.setProperty('--my', y + 'px');
  }
  window.addEventListener('mousemove', (e)=>{ setPos(e.clientX, e.clientY); }, { passive:true });
  window.addEventListener('touchmove', (e)=>{
    const t = e.touches && e.touches[0];
    if (t) setPos(t.clientX, t.clientY);
  }, { passive:true });
  setPos(window.innerWidth * 0.5, window.innerHeight * 0.25);
})();


function cleanupNonGameTabs(){
  ["video","resenas"].forEach(id=>{
    const tab = document.getElementById(id);
    if(!tab) return;
    const mini = tab.querySelector(".mission-mini");
    if(mini) mini.remove();
  });
}
document.addEventListener("DOMContentLoaded", cleanupNonGameTabs);


/* ==========================================================
   FIX: mostrar una pestaña por defecto (evita pantalla vacía)
   ========================================================== */
(function initDefaultTabVisible(){
  function run(){
    // intenta activar la pestaña que ya viene visible en HTML, si existe
    const visible = document.querySelector('.tab-content[style*="display: block"]') || document.getElementById('inicio') || document.querySelector('.tab-content');
    if (!visible) return;

    // Si no está activa, actívala
    visible.classList && visible.classList.add('active');

    // Asegura color por sección y menú coherente
    const id = visible.id || 'inicio';
    try{
      document.documentElement.style.setProperty('--gold-primary', (sectionColors && sectionColors[id]) ? sectionColors[id] : '#FFD700');
    }catch(e){}
  }
  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
