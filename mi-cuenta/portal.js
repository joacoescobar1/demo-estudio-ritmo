const ALUMNAS = {
  "30111222": {
    nombre: "Lucía Molina",
    iniciales: "LM",
    plan: "Plan 8 clases por mes",
    hechas: 3,
    cupo: 8,
    cuota: { mes: "noviembre", monto: "$18.000", vence: "10/12", detalle: "Pagada", estado: "al-dia", nota: "La de diciembre vence el 10/12." },
    reservas: [
      { dia: "Lunes", hora: "19:00", nombre: "Zumba Fitness", profe: "Profe Ana" },
      { dia: "Sábado", hora: "10:00", nombre: "Coreo grupal", profe: "Profe Ana" }
    ]
  },
  "30222333": {
    nombre: "Marina López",
    iniciales: "ML",
    plan: "Plan 8 clases por mes",
    hechas: 5,
    cupo: 8,
    cuota: { mes: "noviembre", monto: "$18.000", vence: "15/11", detalle: "Vence el 15/11", estado: "vence-pronto" },
    reservas: [
      { dia: "Miércoles", hora: "19:00", nombre: "Zumba Fitness", profe: "Profe Ana" },
      { dia: "Jueves", hora: "19:00", nombre: "Funcional con ritmo", profe: "Profe Nico" }
    ]
  },
  "30333444": {
    nombre: "Carla Gómez",
    iniciales: "CG",
    plan: "Plan 8 clases por mes",
    hechas: 8,
    cupo: 8,
    cuota: { mes: "noviembre", monto: "$18.000", vence: "05/11", detalle: "Venció el 5/11", estado: "vencida" },
    reservas: [
      { dia: "Lunes", hora: "20:15", nombre: "Ritmo latino", profe: "Profe Nico" }
    ]
  }
};

const PAY_KEY = "ritmo-portal-pagos";
const $ = (id) => document.getElementById(id);
const modalPago = $("modal-pago");
let currentDni = null;

function normDni(s) { return String(s || "").replace(/\D/g, ""); }
function loadPays() { try { return JSON.parse(localStorage.getItem(PAY_KEY) || "{}"); } catch { return {}; } }
function savePays(d) { localStorage.setItem(PAY_KEY, JSON.stringify(d)); }

function estadoDe(alumna, dni) {
  if (loadPays()[dni]) return "al-dia";
  return alumna.cuota.estado;
}

function badge(estado) {
  if (estado === "al-dia") return { cls: "badge badge-ok", txt: "Al día" };
  if (estado === "vence-pronto") return { cls: "badge badge-pend", txt: "Vence pronto" };
  return { cls: "badge badge-late", txt: "Vencida" };
}

function esc(s) { return String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch])); }

function renderAccount(dni) {
  const alumna = ALUMNAS[dni];
  const estado = estadoDe(alumna, dni);
  const left = Math.max(0, alumna.cupo - alumna.hechas);
  const used = Math.round((alumna.hechas / alumna.cupo) * 100);
  const b = badge(estado);
  const pagada = estado === "al-dia";
  const detalle = pagada ? "Pagada" : alumna.cuota.detalle;
  const nota = pagada
    ? (alumna.cuota.nota || "La próxima cuota es la de diciembre.")
    : "";
  const reservas = alumna.reservas.length
    ? `<ul>${alumna.reservas.map((r) => `<li><span class="when">${esc(r.hora)}<small>${esc(r.dia)}</small></span><span class="what">${esc(r.nombre)}<small>${esc(r.profe)}</small></span></li>`).join("")}</ul>`
    : `<p class="empty">No tenés clases reservadas este mes.</p>`;
  const payBtn = pagada
    ? `<button class="btn btn-mp" type="button" id="btn-mp" disabled>Cuota al día</button>`
    : `<button class="btn btn-mp" type="button" id="btn-mp">Pagar cuota</button>`;

  $("account-panel").hidden = false;
  $("account-panel").innerHTML = `
    <div class="account-head">
      <div class="avatar" aria-hidden="true">${esc(alumna.iniciales)}</div>
      <div><strong>${esc(alumna.nombre)}</strong><span>${esc(alumna.plan)}</span></div>
      <div class="account-actions"><button class="btn-text" type="button" id="btn-salir">Cambiar DNI</button></div>
    </div>
    <div class="stat">
      <p class="stat-label">Clases de este mes</p>
      <p class="stat-value">Te quedan <b>${left}</b> de ${alumna.cupo}</p>
      <div class="meter" aria-hidden="true"><i style="width:${used}%"></i></div>
    </div>
    <div class="fee-row">
      <div>
        <strong>Cuota de ${esc(alumna.cuota.mes)}</strong>
        <span>${esc(alumna.cuota.monto)} · ${esc(detalle)}</span>
        ${nota ? `<span class="fee-note">${esc(nota)}</span>` : ""}
      </div>
      <span class="${b.cls}">${b.txt}</span>
    </div>
    <div class="reservas">
      <h2>Próximas clases</h2>
      ${reservas}
    </div>
    ${payBtn}
    <p class="fine-print">Usuaria de ejemplo. El pago es una simulación: no se cobra nada.</p>
  `;
  document.body.classList.add("logged-in");
  $("pago-titulo").textContent = `Cuota de ${alumna.cuota.mes}`;
  $("pago-resumen").textContent = `${alumna.plan} · Estudio Ritmo`;
  $("btn-salir").addEventListener("click", logout);
  const btn = $("btn-mp");
  if (btn && !btn.disabled) btn.addEventListener("click", openPago);
  $("account-panel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function login(raw) {
  const dni = normDni(raw);
  const error = $("dni-error");
  if (!ALUMNAS[dni]) {
    error.hidden = false;
    $("account-panel").hidden = true;
    $("account-panel").innerHTML = "";
    document.body.classList.remove("logged-in");
    currentDni = null;
    $("dni").focus();
    return false;
  }
  error.hidden = true;
  currentDni = dni;
  $("dni").value = raw.trim();
  renderAccount(dni);
  return true;
}

function logout() {
  currentDni = null;
  document.body.classList.remove("logged-in");
  $("account-panel").hidden = true;
  $("account-panel").innerHTML = "";
  $("dni").value = "";
  $("dni-error").hidden = true;
  $("dni").focus();
}

function openPago() {
  $("pago-form").hidden = false;
  $("pago-ok").hidden = true;
  modalPago.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeModal() {
  modalPago.hidden = true;
  document.body.style.overflow = "";
  if (currentDni) renderAccount(currentDni);
}

$("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  login($("dni").value);
});

document.querySelectorAll("[data-dni]").forEach((btn) => {
  btn.addEventListener("click", () => {
    $("dni").value = btn.dataset.dni;
    login(btn.dataset.dni);
  });
});

$("btn-pagar").addEventListener("click", (e) => {
  const b = e.currentTarget;
  b.classList.add("loading");
  b.textContent = "Procesando";
  setTimeout(() => {
    b.classList.remove("loading");
    b.textContent = "Pagar $18.000";
    if (currentDni) {
      const pays = loadPays();
      pays[currentDni] = Date.now();
      savePays(pays);
    }
    $("pago-form").hidden = true;
    $("pago-ok").hidden = false;
  }, 1100);
});

modalPago.addEventListener("click", (e) => {
  if (e.target === modalPago || e.target.closest("[data-close]")) closeModal();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

const header = document.querySelector(".site-header");
const menuBtn = document.querySelector(".menu-btn");
const nav = $("nav");
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
  nav.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
}));

const q = new URLSearchParams(location.search).get("dni");
if (q) login(q);
