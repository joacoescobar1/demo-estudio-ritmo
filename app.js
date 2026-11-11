const CLASSES = [
  { id: "lun-19", day: "Lunes", time: "19:00", end: "20:00", name: "Zumba Fitness", teacher: "Profe Ana (ficticia)", spots: 4 },
  { id: "lun-20", day: "Lunes", time: "20:15", end: "21:15", name: "Ritmo latino", teacher: "Profe Nico (ficticio)", spots: 1 },
  { id: "mar-18", day: "Martes", time: "18:00", end: "19:00", name: "Zumba Kids", teacher: "Profe Ana (ficticia)", spots: 6 },
  { id: "mar-19", day: "Martes", time: "19:30", end: "20:30", name: "Dance HIIT", teacher: "Profe Lara (ficticia)", spots: 0 },
  { id: "mie-19", day: "Miércoles", time: "19:00", end: "20:00", name: "Zumba Fitness", teacher: "Profe Ana (ficticia)", spots: 9 },
  { id: "mie-20", day: "Miércoles", time: "20:15", end: "21:00", name: "Stretch & mobility", teacher: "Profe Lara (ficticia)", spots: 7 },
  { id: "jue-19", day: "Jueves", time: "19:00", end: "20:00", name: "Funcional con ritmo", teacher: "Profe Nico (ficticio)", spots: 2 },
  { id: "vie-18", day: "Viernes", time: "18:30", end: "19:30", name: "Zumba Fitness", teacher: "Profe Ana (ficticia)", spots: 11 },
  { id: "vie-20", day: "Viernes", time: "20:00", end: "21:15", name: "Ritmo latino", teacher: "Profe Nico (ficticio)", spots: 0 },
  { id: "sab-10", day: "Sábado", time: "10:00", end: "11:00", name: "Zumba Kids", teacher: "Profe Ana (ficticia)", spots: 8 },
  { id: "sab-11", day: "Sábado", time: "11:15", end: "12:15", name: "Zumba Fitness", teacher: "Profe Lara (ficticia)", spots: 5 }
];

const KEY = "ritmo-reservas-demo";

function loadReservas() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}
function saveReservas(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function pill(spots, reserved) {
  if (reserved) return '<span class="pill ok">Ya reservaste</span>';
  if (spots === 0) return '<span class="pill no">Completa</span>';
  if (spots === 1) return '<span class="pill warn">Queda 1 lugar</span>';
  return `<span class="pill ok">Quedan ${spots} lugares</span>`;
}

function renderSchedule() {
  const root = document.getElementById("schedule");
  if (!root) return;
  const reservas = loadReservas();
  const days = [];
  CLASSES.forEach((c) => {
    if (!days.includes(c.day)) days.push(c.day);
  });
  root.innerHTML = days.map((day) => {
    const items = CLASSES.filter((c) => c.day === day).map((c) => {
      const reserved = Boolean(reservas[c.id]);
      const full = c.spots === 0 && !reserved;
      const btn = full
        ? `<button class="btn btn-ghost" type="button" disabled>Sin lugar</button>`
        : reserved
          ? `<button class="btn btn-ghost" type="button" disabled>Reservado</button>`
          : `<button class="btn btn-primary" type="button" data-reserve="${c.id}">Reservar lugar</button>`;
      return `<article class="class-card${full ? " full" : ""}">
        <div class="class-time">${c.time}<small>${c.end}</small></div>
        <div class="class-meta">
          <h3>${c.name}</h3>
          <p>${c.teacher}</p>
          <div class="pills">${pill(c.spots, reserved)}</div>
        </div>
        ${btn}
      </article>`;
    }).join("");
    return `<div class="day-label">${day}</div>${items}`;
  }).join("");
}

const modalReserva = document.getElementById("modal-reserva");
const modalAviso = document.getElementById("modal-aviso");
let currentClass = null;

function openModal(el) {
  el.hidden = false;
  const closeBtn = el.querySelector("[data-close]");
  if (closeBtn) closeBtn.focus();
}
function closeModals() {
  if (modalReserva) modalReserva.hidden = true;
  if (modalAviso) modalAviso.hidden = true;
}

function openReserva(id) {
  currentClass = CLASSES.find((c) => c.id === id);
  if (!currentClass) return;
  document.getElementById("reserva-form").hidden = false;
  document.getElementById("reserva-ok").hidden = true;
  document.getElementById("nombre").value = "";
  document.getElementById("whatsapp").value = "";
  document.getElementById("reserva-resumen").textContent =
    `${currentClass.day} · ${currentClass.time} a ${currentClass.end} · ${currentClass.name}`;
  openModal(modalReserva);
  document.getElementById("nombre").focus();
}

function codigo() {
  return "ER-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function confirmar() {
  const nombre = document.getElementById("nombre").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  if (!nombre || !whatsapp || !currentClass) {
    document.getElementById("nombre").reportValidity();
    if (!nombre) { document.getElementById("nombre").focus(); return; }
    document.getElementById("whatsapp").focus();
    return;
  }
  const reservas = loadReservas();
  const code = codigo();
  reservas[currentClass.id] = { nombre, whatsapp, code, at: Date.now(), classId: currentClass.id };
  saveReservas(reservas);
  document.getElementById("reserva-form").hidden = true;
  document.getElementById("reserva-ok").hidden = false;
  document.getElementById("ok-resumen").textContent =
    `${nombre}, te anotamos en ${currentClass.name} el ${currentClass.day} a las ${currentClass.time}.`;
  document.getElementById("ok-codigo").textContent = code;
  renderSchedule();
}

document.getElementById("schedule")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-reserve]");
  if (btn) openReserva(btn.getAttribute("data-reserve"));
});
document.getElementById("btn-confirmar")?.addEventListener("click", confirmar);

document.getElementById("btn-mp")?.addEventListener("click", () => {
  document.getElementById("aviso-titulo").textContent = "Pago de demostración";
  document.getElementById("aviso-texto").textContent =
    "En tu web, este botón abre el checkout real de Mercado Pago y acredita la cuota. Acá no se cobra nada: es solo para que veas cómo se vería.";
  openModal(modalAviso);
});

document.getElementById("btn-wa")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("aviso-titulo").textContent = "WhatsApp de demostración";
  document.getElementById("aviso-texto").textContent =
    "Este botón es un placeholder. En tu web iría al WhatsApp real de tu estudio (un enlace wa.me con tu número). Acá no abre un chat verdadero.";
  openModal(modalAviso);
});

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-close]")) closeModals();
  });
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModals();
});

const menuBtn = document.querySelector(".menu-btn");
const nav = document.getElementById("nav");
menuBtn?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});
nav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
  nav.classList.remove("open");
  menuBtn?.setAttribute("aria-expanded", "false");
}));

renderSchedule();
