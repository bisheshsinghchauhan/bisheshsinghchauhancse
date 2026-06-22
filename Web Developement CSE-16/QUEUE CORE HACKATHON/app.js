const STORAGE_KEY = "queue-cure-26-state";
const MY_TOKEN_KEY = "queue-cure-26-my-token";
const UNLOCKED_ROLES_KEY = "queue-cure-26-unlocked-roles";
const channel = "BroadcastChannel" in window ? new BroadcastChannel("queue-cure-26") : null;

const accessCodes = {
  reception: "2468",
  doctor: "1357",
  analytics: "9999",
};

const doctors = {
  "dr-sharma": { name: "Dr. Sharma", avgMinutes: 8 },
  "dr-verma": { name: "Dr. Verma", avgMinutes: 10 },
  "dr-khan": { name: "Dr. Khan", avgMinutes: 7 },
};

const demoPatients = [
  ["Nisha Rao", "Fever / infection", "dr-sharma"],
  ["Kabir Jain", "Follow-up", "dr-sharma"],
  ["Meera Das", "Report review", "dr-verma"],
  ["Rohan Iyer", "General consultation", "dr-sharma"],
  ["Anika Sen", "General consultation", "dr-khan"],
];

const $ = (selector) => document.querySelector(selector);
const state = loadState();
let selectedDoctor = "dr-sharma";
let pendingView = null;
let toastTimer;

function makeId() {
  return `qc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);

  const initial = {
    nextToken: 106,
    patients: demoPatients.map(([name, reason, doctorId], index) => ({
      id: makeId(),
      token: 101 + index,
      name,
      phone: "90000 00000",
      reason,
      doctorId,
      status: index === 0 && doctorId === "dr-sharma" ? "CALLED" : "WAITING",
      joinedAt: Date.now() - (25 - index * 4) * 60_000,
      calledAt: index === 0 ? Date.now() - 5 * 60_000 : null,
      completedAt: null,
    })),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveState(announce = true) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (announce && channel) channel.postMessage({ type: "queue:update" });
  render();
}

function getDoctorQueue(doctorId = selectedDoctor) {
  return state.patients
    .filter((patient) => patient.doctorId === doctorId)
    .sort((a, b) => a.token - b.token);
}

function getWaitingQueue(doctorId = selectedDoctor) {
  return getDoctorQueue(doctorId).filter((patient) => patient.status === "WAITING");
}

function getCurrentPatient(doctorId = selectedDoctor) {
  return getDoctorQueue(doctorId).find((patient) => patient.status === "CALLED");
}

function estimateWait(patient, doctorId = selectedDoctor) {
  if (!patient) return 0;
  if (patient.status === "CALLED") return 0;
  const queue = getDoctorQueue(doctorId).filter((item) => ["WAITING", "CALLED"].includes(item.status));
  const index = queue.findIndex((item) => item.id === patient.id);
  return Math.max(0, index) * doctors[doctorId].avgMinutes;
}

function positionOf(patient, doctorId = selectedDoctor) {
  const active = getDoctorQueue(doctorId).filter((item) => ["WAITING", "CALLED"].includes(item.status));
  return active.findIndex((item) => item.id === patient.id) + 1;
}

function getUnlockedRoles() {
  return JSON.parse(sessionStorage.getItem(UNLOCKED_ROLES_KEY) || '["patient"]');
}

function unlockRole(view) {
  const roles = new Set(getUnlockedRoles());
  roles.add(view);
  sessionStorage.setItem(UNLOCKED_ROLES_KEY, JSON.stringify([...roles]));
  updateRoleLocks();
}

function canOpenView(view) {
  return view === "patient" || getUnlockedRoles().includes(view);
}

function updateRoleLocks() {
  const unlocked = getUnlockedRoles();
  document.querySelectorAll(".role-tab").forEach((tab) => {
    const locked = tab.dataset.view !== "patient" && !unlocked.includes(tab.dataset.view);
    tab.classList.toggle("is-locked", locked);
    tab.setAttribute("aria-label", locked ? `${tab.textContent.trim()} locked` : tab.textContent.trim());
  });
}

function requestAccess(view) {
  pendingView = view;
  const labels = {
    reception: "Reception Desk",
    doctor: "Doctor Console",
    analytics: "Analytics Dashboard",
  };
  $("#access-title").textContent = `Unlock ${labels[view]}`;
  $("#access-copy").textContent = "This staff-only panel needs an access code.";
  $("#access-code").value = "";
  $("#access-modal").classList.add("is-open");
  $("#access-modal").setAttribute("aria-hidden", "false");
  setTimeout(() => $("#access-code").focus(), 0);
}

function closeAccessModal() {
  pendingView = null;
  $("#access-modal").classList.remove("is-open");
  $("#access-modal").setAttribute("aria-hidden", "true");
}

function setView(view) {
  if (!canOpenView(view)) {
    requestAccess(view);
    return;
  }

  document.querySelectorAll(".role-tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === `${view}-view`);
  });
  const titles = {
    patient: "Patient Dashboard",
    reception: "Reception Desk",
    doctor: "Doctor Console",
    analytics: "Analytics Dashboard",
  };
  $("#view-title").textContent = titles[view];
}

function joinQueue(event) {
  event.preventDefault();
  const patient = {
    id: makeId(),
    token: state.nextToken++,
    name: $("#patient-name").value.trim(),
    phone: $("#patient-phone").value.trim(),
    reason: $("#visit-reason").value,
    doctorId: selectedDoctor,
    status: "WAITING",
    joinedAt: Date.now(),
    calledAt: null,
    completedAt: null,
  };
  state.patients.push(patient);
  localStorage.setItem(MY_TOKEN_KEY, patient.id);
  $("#join-form").reset();
  saveState();
  showToast(`Token ${patient.token} joined ${doctors[selectedDoctor].name}'s queue.`);
}

function callNext(doctorId = selectedDoctor) {
  const current = getCurrentPatient(doctorId);
  if (current) current.status = "COMPLETED";
  const next = getWaitingQueue(doctorId)[0];
  if (!next) {
    saveState();
    showToast("No waiting patients in this queue.");
    return;
  }
  next.status = "CALLED";
  next.calledAt = Date.now();
  saveState();
  showToast(`Calling token ${next.token}: ${next.name}`);
}

function completeCurrent(doctorId = selectedDoctor) {
  const current = getCurrentPatient(doctorId);
  if (!current) {
    showToast("No active patient to complete.");
    return;
  }
  current.status = "COMPLETED";
  current.completedAt = Date.now();
  saveState();
  showToast(`Completed token ${current.token}.`);
}

function skipCurrent(doctorId = selectedDoctor) {
  const current = getCurrentPatient(doctorId);
  if (!current) {
    showToast("No active patient to skip.");
    return;
  }
  current.status = "SKIPPED";
  saveState();
  showToast(`Skipped token ${current.token}.`);
}

function addWalkIn() {
  const names = ["Priya Nair", "Dev Patel", "Isha Kapoor", "Arjun Roy", "Tara Bedi"];
  const reasons = ["General consultation", "Fever / infection", "Follow-up", "Report review"];
  const patient = {
    id: makeId(),
    token: state.nextToken++,
    name: names[Math.floor(Math.random() * names.length)],
    phone: "98888 12345",
    reason: reasons[Math.floor(Math.random() * reasons.length)],
    doctorId: selectedDoctor,
    status: "WAITING",
    joinedAt: Date.now(),
    calledAt: null,
    completedAt: null,
  };
  state.patients.push(patient);
  saveState();
  showToast(`Walk-in token ${patient.token} added.`);
}

function updatePatient(id, action) {
  const patient = state.patients.find((item) => item.id === id);
  if (!patient) return;

  if (action === "call") {
    const current = getCurrentPatient(patient.doctorId);
    if (current) current.status = "COMPLETED";
    patient.status = "CALLED";
    patient.calledAt = Date.now();
  }
  if (action === "complete") {
    patient.status = "COMPLETED";
    patient.completedAt = Date.now();
  }
  if (action === "skip") patient.status = "SKIPPED";
  if (action === "up") patient.token -= 1.5;
  if (action === "down") patient.token += 1.5;

  if (["up", "down"].includes(action)) normalizeTokens(patient.doctorId);
  saveState();
}

function normalizeTokens(doctorId) {
  getDoctorQueue(doctorId).forEach((patient, index) => {
    patient.token = 101 + index;
  });
  state.nextToken = Math.max(...state.patients.map((patient) => patient.token), 100) + 1;
}

function render() {
  const queue = getDoctorQueue();
  const waiting = getWaitingQueue();
  const current = getCurrentPatient();
  const served = state.patients.filter((patient) => patient.status === "COMPLETED").length;

  $("#doctor-name").textContent = doctors[selectedDoctor].name;
  $("#current-token").textContent = current ? current.token : "-";
  $("#waiting-count").textContent = waiting.length;
  $("#avg-time").textContent = `${doctors[selectedDoctor].avgMinutes} min`;
  $("#served-count").textContent = served;

  renderPatientCard(queue);
  renderPatientStrip(queue);
  renderQueueTable(queue);
  renderDoctorCard(current);
  renderAnalytics(queue);
}

function renderPatientCard(queue) {
  const myId = localStorage.getItem(MY_TOKEN_KEY);
  const mine = state.patients.find((patient) => patient.id === myId);
  const inSelectedQueue = mine && mine.doctorId === selectedDoctor;
  const activeCount = queue.filter((patient) => ["WAITING", "CALLED"].includes(patient.status)).length || 1;

  if (!mine) {
    $("#my-token").textContent = "Not joined";
    $("#my-status").textContent = "Join the queue to see your live position and wait time.";
    $("#queue-progress").style.width = "0%";
    $("#near-turn-badge").textContent = "Waiting for token";
    return;
  }

  $("#my-token").textContent = `#${mine.token}`;

  if (!inSelectedQueue) {
    $("#my-status").textContent = `You are queued with ${doctors[mine.doctorId].name}. Switch doctor to view details.`;
    $("#queue-progress").style.width = "0%";
    $("#near-turn-badge").textContent = "Different queue";
    return;
  }

  const position = positionOf(mine);
  const wait = estimateWait(mine);
  const progress = mine.status === "COMPLETED" ? 100 : Math.max(8, 100 - ((position - 1) / activeCount) * 100);
  $("#my-status").textContent = statusCopy(mine, position, wait);
  $("#queue-progress").style.width = `${progress}%`;
  $("#near-turn-badge").textContent = position <= 2 && mine.status === "WAITING" ? "Your turn is near" : mine.status;
}

function statusCopy(patient, position, wait) {
  if (patient.status === "CALLED") return "Please proceed to the consultation room now.";
  if (patient.status === "COMPLETED") return "Your visit is completed. Thank you.";
  if (patient.status === "SKIPPED") return "Your token was skipped. Please contact reception.";
  return `Position ${position}. Estimated wait ${wait} minutes.`;
}

function renderPatientStrip(queue) {
  const myId = localStorage.getItem(MY_TOKEN_KEY);
  const active = queue.filter((patient) => ["WAITING", "CALLED"].includes(patient.status)).slice(0, 8);
  $("#patient-list").innerHTML = active.length
    ? active
        .map(
          (patient) => `
          <article class="queue-chip ${patient.status === "CALLED" ? "is-called" : ""} ${patient.id === myId ? "is-mine" : ""}">
            <small>${patient.status}</small>
            <strong>#${patient.token}</strong>
            <span>${patient.name}</span>
          </article>`
        )
        .join("")
    : `<p class="muted">No active patients in this queue.</p>`;
}

function renderQueueTable(queue) {
  $("#queue-table").innerHTML = queue
    .map(
      (patient) => `
      <tr>
        <td><strong>#${patient.token}</strong></td>
        <td>${patient.name}<br><small>${patient.phone}</small></td>
        <td>${patient.reason}</td>
        <td><span class="status ${patient.status}">${patient.status}</span></td>
        <td>${patient.status === "WAITING" ? `${estimateWait(patient)} min` : "-"}</td>
        <td>
          <div class="row-actions">
            <button data-action="call" data-id="${patient.id}">Call</button>
            <button data-action="complete" data-id="${patient.id}">Done</button>
            <button data-action="skip" data-id="${patient.id}">Skip</button>
            <button data-action="up" data-id="${patient.id}">Up</button>
            <button data-action="down" data-id="${patient.id}">Down</button>
          </div>
        </td>
      </tr>`
    )
    .join("");
}

function renderDoctorCard(current) {
  $("#current-patient-card").innerHTML = current
    ? `<span>Current patient</span><strong>#${current.token} ${current.name}</strong><p>${current.reason}</p>`
    : `<span>Current patient</span><strong>No patient called</strong><p>Use Call next to begin.</p>`;
}

function renderAnalytics(queue) {
  const active = queue.filter((patient) => ["WAITING", "CALLED"].includes(patient.status)).length;
  const estimated = active * doctors[selectedDoctor].avgMinutes;
  $("#prediction-title").textContent = `${estimated} min estimated wait`;
  $("#prediction-copy").textContent = `Based on ${active} active patients and ${doctors[selectedDoctor].avgMinutes} minutes per consultation.`;
  $("#peak-load").textContent = estimated > 45 ? "High" : estimated > 20 ? "Moderate" : "Light";

  const counts = ["WAITING", "CALLED", "COMPLETED", "SKIPPED"].map((status) => ({
    status,
    count: queue.filter((patient) => patient.status === status).length,
  }));
  const max = Math.max(...counts.map((item) => item.count), 1);
  $("#chart-bars").innerHTML = counts
    .map(
      (item) => `
      <div class="bar-row">
        <span>${item.status}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(item.count / max) * 100}%"></div></div>
        <strong>${item.count}</strong>
      </div>`
    )
    .join("");
}

function showToast(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").classList.add("is-visible");
  toastTimer = setTimeout(() => $("#toast").classList.remove("is-visible"), 2800);
}

document.querySelectorAll(".role-tab").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

$("#access-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!pendingView) return;

  if ($("#access-code").value.trim() !== accessCodes[pendingView]) {
    showToast("Invalid access code.");
    $("#access-code").select();
    return;
  }

  const nextView = pendingView;
  unlockRole(nextView);
  closeAccessModal();
  setView(nextView);
  showToast(`${$("#view-title").textContent} unlocked for this session.`);
});

$("#close-access").addEventListener("click", closeAccessModal);
$("#access-modal").addEventListener("click", (event) => {
  if (event.target.id === "access-modal") closeAccessModal();
});

$("#doctor-filter").addEventListener("change", (event) => {
  selectedDoctor = event.target.value;
  render();
});

$("#join-form").addEventListener("submit", joinQueue);
$("#add-walkin").addEventListener("click", addWalkIn);
$("#call-next").addEventListener("click", () => callNext());
$("#doctor-next").addEventListener("click", () => callNext());
$("#doctor-complete").addEventListener("click", () => completeCurrent());
$("#doctor-skip").addEventListener("click", () => skipCurrent());
$("#reset-demo").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(MY_TOKEN_KEY);
  sessionStorage.removeItem(UNLOCKED_ROLES_KEY);
  Object.assign(state, loadState());
  setView("patient");
  updateRoleLocks();
  saveState();
  showToast("Demo data reset.");
});

$("#queue-table").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  updatePatient(button.dataset.id, button.dataset.action);
});

window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY || !event.newValue) return;
  Object.assign(state, JSON.parse(event.newValue));
  render();
});

if (channel) {
  channel.addEventListener("message", () => {
    Object.assign(state, loadState());
    render();
  });
}

updateRoleLocks();
render();