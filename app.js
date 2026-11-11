const IMG = {
  zumba: "img/clase-zumba.webp", latino: "img/clase-latino.webp", hiit: "img/clase-hiit.webp",
  coreo: "img/clase-coreo.webp", funcional: "img/clase-funcional.webp", stretch: "img/clase-stretch.webp"
};
const CLASSES = [
  { id: "lun-19", day: "Lunes", time: "19:00", end: "20:00", name: "Zumba Fitness", type: "zumba", teacher: "Profe Ana", cap: 18, spots: 4 },
  { id: "lun-20", day: "Lunes", time: "20:15", end: "21:30", name: "Ritmo latino", type: "latino", teacher: "Profe Nico", cap: 16, spots: 1 },
  { id: "mar-18", day: "Martes", time: "18:00", end: "19:00", name: "Coreo grupal", type: "coreo", teacher: "Profe Ana", cap: 18, spots: 6 },
  { id: "mar-19", day: "Martes", time: "19:30", end: "20:30", name: "Dance HIIT", type: "hiit", teacher: "Profe Lara", cap: 14, spots: 0 },
  { id: "mie-19", day: "Miércoles", time: "19:00", end: "20:00", name: "Zumba Fitness", type: "zumba", teacher: "Profe Ana", cap: 18, spots: 9 },
  { id: "mie-20", day: "Miércoles", time: "20:15", end: "21:00", name: "Stretch & mobility", type: "stretch", teacher: "Profe Lara", cap: 14, spots: 7 },
  { id: "jue-19", day: "Jueves", time: "19:00", end: "20:00", name: "Funcional con ritmo", type: "funcional", teacher: "Profe Nico", cap: 14, spots: 2 },
  { id: "vie-18", day: "Viernes", time: "18:30", end: "19:30", name: "Zumba Fitness", type: "zumba", teacher: "Profe Ana", cap: 18, spots: 11 },
  { id: "vie-20", day: "Viernes", time: "20:00", end: "21:15", name: "Ritmo latino", type: "latino", teacher: "Profe Nico", cap: 16, spots: 0 },
  { id: "sab-10", day: "Sábado", time: "10:00", end: "11:00", name: "Coreo grupal", type: "coreo", teacher: "Profe Ana", cap: 18, spots: 8 },
  { id: "sab-11", day: "Sábado", time: "11:15", end: "12:15", name: "Zumba Fitness", type: "zumba", teacher: "Profe Lara", cap: 18, spots: 5 }
];
const DAYS = [...new Set(CLASSES.map((c) => c.day))];
const KEY = "ritmo-reservas-demo";
let currentDay = DAYS[0];

const $ = (id) => document.getElementById(id);
function loadReservas() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } }
function saveReservas(d) { localStorage.setItem(KEY, JSON.stringify(d)); }

function spotsHTML(c, reserved) {
  const left = Math.max(0, c.spots - (reserved ? 1 : 0));
  const pct = Math.round(((c.cap - left) / c.cap) * 100);
  let cls = "ok", txt = `Quedan ${left} lugares`;
  if (reserved) { cls = "ok"; txt = "Tenés tu lugar"; }
  else if (c.spots === 0) { cls = "full"; txt = "Clase completa"; }
  else if (c.spots <= 2) { cls = "warn"; txt = c.spots === 1 ? "Queda 1 lugar" : "Quedan 2 lugares"; }
  return `<div class="spots ${cls}"><span class="bar"><i style="width:${pct}%"></i></span>${txt}</div>`;
}

function renderDays() {
  $("days").innerHTML = DAYS.map((d) => {
    const n = CLASSES.filter((c) => c.day === d).length;
    return `<button class="day" role="tab" type="button" aria-selected="${d === currentDay}" data-day="${d}"><b>${d.slice(0, 3)}</b><small>${n} ${n === 1 ? "clase" : "clases"}</small></button>`;
  }).join("");
}

function renderSchedule() {
  const reservas = loadReservas();
  $("schedule").innerHTML = CLASSES.filter((c) => c.day === currentDay).map((c) => {
    const reserved = Boolean(reservas[c.id]);
    const full = c.spots === 0 && !reserved;
    const btn = reserved
      ? `<button class="btn btn-ghost" type="button" disabled>Reservado</button>`
      : full
        ? `<button class="btn btn-ghost" type="button" disabled>Sin lugar</button>`
        : `<button class="btn btn-coral" type="button" data-reserve="${c.id}">Reservar</button>`;
    return `<article class="slot">
      <div class="slot-time">${c.time}<small>a ${c.end}</small></div>
      <img src="${IMG[c.type]}" alt="" loading="lazy" width="96" height="72">
      <div class="slot-info"><h3>${c.name}</h3><p class="slot-sub">${c.teacher} · ${c.cap} lugares</p>${spotsHTML(c, reserved)}</div>
      ${btn}
    </article>`;
  }).join("");
}

const modalReserva = $("modal-reserva"), modalPago = $("modal-pago");
let currentClass = null;
function openModal(el) { el.hidden = false; document.body.style.overflow = "hidden"; }
function closeModals() { modalReserva.hidden = true; modalPago.hidden = true; document.body.style.overflow = ""; }

function openReserva(id) {
  currentClass = CLASSES.find((c) => c.id === id);
  if (!currentClass) return;
  $("reserva-form").hidden = false; $("reserva-ok").hidden = true;
  $("nombre").value = ""; $("whatsapp").value = "";
  $("reserva-resumen").textContent = `${currentClass.name} · ${currentClass.day} ${currentClass.time} a ${currentClass.end} · ${currentClass.teacher}`;
  openModal(modalReserva);
  setTimeout(() => $("nombre").focus(), 50);
}
function codigo() { return "ER-" + Math.random().toString(36).slice(2, 6).toUpperCase(); }
function hhmm() { const d = new Date(); return d.toTimeString().slice(0, 5); }
function esc(s) { return s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch])); }

function confirmar() {
  const nombre = $("nombre").value.trim(), whatsapp = $("whatsapp").value.trim();
  if (!nombre) { $("nombre").reportValidity(); $("nombre").focus(); return; }
  if (!whatsapp) { $("whatsapp").reportValidity(); $("whatsapp").focus(); return; }
  const reservas = loadReservas(), code = codigo();
  reservas[currentClass.id] = { nombre, whatsapp, code, at: Date.now() };
  saveReservas(reservas);
  const first = esc(nombre.split(" ")[0]);
  $("reserva-form").hidden = true; $("reserva-ok").hidden = false;
  $("ok-resumen").textContent = `${currentClass.name}, ${currentClass.day.toLowerCase()} a las ${currentClass.time}.`;
  $("ok-wa").innerHTML = `<p>¡Hola ${first}! Tu lugar en <b>${esc(currentClass.name)}</b> quedó reservado.<br>${currentClass.day} ${currentClass.time} · Código ${code}<br><br>Traé agua y toalla. Si no podés venir, respondé <b>CANCELAR</b> y liberamos el lugar.</p><time>${hhmm()}</time>`;
  renderSchedule();
}

$("days").addEventListener("click", (e) => {
  const b = e.target.closest("[data-day]"); if (!b) return;
  currentDay = b.dataset.day; renderDays(); renderSchedule();
});
$("schedule").addEventListener("click", (e) => {
  const b = e.target.closest("[data-reserve]"); if (b) openReserva(b.dataset.reserve);
});
$("btn-confirmar").addEventListener("click", confirmar);

$("btn-mp").addEventListener("click", () => {
  if ($("badge-dic").classList.contains("badge-ok")) return;
  $("pago-form").hidden = false; $("pago-ok").hidden = true;
  openModal(modalPago);
});
$("btn-pagar").addEventListener("click", (e) => {
  const b = e.currentTarget; b.classList.add("loading"); b.textContent = "Procesando";
  setTimeout(() => {
    b.classList.remove("loading"); b.textContent = "Pagar $18.000";
    $("pago-form").hidden = true; $("pago-ok").hidden = false;
    const badge = $("badge-dic"); badge.className = "badge badge-ok"; badge.textContent = "Pagada";
    $("btn-mp").textContent = "Cuota al día"; $("btn-mp").disabled = true;
  }, 1100);
});

document.querySelectorAll(".modal").forEach((m) => m.addEventListener("click", (e) => {
  if (e.target === m || e.target.closest("[data-close]")) closeModals();
}));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModals(); });

const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("solid", window.scrollY > 40 || nav.classList.contains("open"));
const menuBtn = document.querySelector(".menu-btn"), nav = $("nav");
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", String(open)); onScroll();
});
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); onScroll(); }));
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

renderDays();
renderSchedule();
