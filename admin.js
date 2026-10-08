const SUPABASE_URL = "https://udoitfmocoveypdthshm.supabase.co";
const SUPABASE_KEY = "sb_publishable_UGe0fWqyqfD5C6S4XjmZWA_asSc4_4d";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const loginView = document.getElementById("loginView"),
  dashboardView = document.getElementById("dashboardView"),
  loginForm = document.getElementById("loginForm"),
  loginError = document.getElementById("loginError"),
  appointmentsBody = document.getElementById("appointmentsBody"),
  emptyState = document.getElementById("emptyState");
const filterDate = document.getElementById("filterDate"),
  filterBarber = document.getElementById("filterBarber"),
  filterStatus = document.getElementById("filterStatus");

function brl(v) {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function formatDate(v) {
  if (!v) return "";
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
}

async function loadSession() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  if (session) {
    await openDashboard(session);
  }
}

async function openDashboard(session) {
  const { data: profile, error } = await supabaseClient
    .from("staff_profiles")
    .select("full_name,role,barber_name")
    .eq("id", session.user.id)
    .single();
  if (error || !profile) {
    await supabaseClient.auth.signOut();
    loginError.textContent = "Usuário sem permissão para acessar o painel.";
    return;
  }
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
  document.getElementById("userName").textContent =
    profile.full_name || session.user.email;
  filterDate.value = today();
  if (profile.role === "barber" && profile.barber_name) {
    filterBarber.value = profile.barber_name;
    filterBarber.disabled = true;
  }
  await loadAppointments(profile);
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "Entrando...";
  const { error } = await supabaseClient.auth.signInWithPassword({
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
  });
  if (error) {
    loginError.textContent = "E-mail ou senha inválidos.";
    return;
  }
  loginError.textContent = "";
  await loadSession();
});

document.getElementById("logoutButton").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  location.reload();
});
document
  .getElementById("refreshButton")
  .addEventListener("click", () => loadAppointments());
[filterDate, filterBarber, filterStatus].forEach((el) =>
  el.addEventListener("change", () => loadAppointments()),
);

async function loadAppointments(profile) {
  appointmentsBody.innerHTML = "<tr><td colspan=8>Carregando...</td></tr>";
  emptyState.classList.add("hidden");
  let q = supabaseClient
    .from("appointments")
    .select(
      "id,barber_name,service_name,service_price,appointment_date,appointment_time,client_name,client_phone,status",
    )
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });
  if (filterDate.value) q = q.eq("appointment_date", filterDate.value);
  if (filterBarber.value) q = q.eq("barber_name", filterBarber.value);
  if (filterStatus.value) q = q.eq("status", filterStatus.value);
  const { data, error } = await q;
  if (error) {
    appointmentsBody.innerHTML = `<tr><td colspan=8>Erro ao carregar agenda.</td></tr>`;
    console.error(error);
    return;
  }
  document.getElementById("tableMeta").textContent =
    `${data.length} agendamento(s)`;
  const todayRows = data.filter(
    (x) => x.appointment_date === today() && x.status === "confirmed",
  );
  document.getElementById("todayCount").textContent = todayRows.length;
  document.getElementById("confirmedCount").textContent = data.filter(
    (x) => x.status === "confirmed",
  ).length;
  document.getElementById("todayRevenue").textContent = brl(
    todayRows.reduce((s, x) => s + Number(x.service_price || 0), 0),
  );
  if (!data.length) {
    appointmentsBody.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }
  appointmentsBody.innerHTML = data
    .map(
      (a) =>
        `<tr><td><strong>${String(a.appointment_time).slice(0, 5)}</strong><br><small>${formatDate(a.appointment_date)}</small></td><td>${escapeHtml(a.client_name)}</td><td><a href="https://wa.me/${String(a.client_phone).replace(/\D/g, "")}" target="_blank" rel="noopener" style="color:#cdb26c">${escapeHtml(a.client_phone)}</a></td><td>${escapeHtml(a.service_name)}</td><td>${escapeHtml(a.barber_name)}</td><td>${brl(a.service_price)}</td><td><span class="status ${a.status}">${a.status}</span></td><td>${a.status === "confirmed" ? `<button class="row-action" data-id="${a.id}">Cancelar</button>` : ""}</td></tr>`,
    )
    .join("");
  appointmentsBody
    .querySelectorAll(".row-action")
    .forEach((b) =>
      b.addEventListener("click", () => cancelAppointment(b.dataset.id)),
    );
}

async function cancelAppointment(id) {
  if (!confirm("Cancelar este agendamento?")) return;
  const { error } = await supabaseClient
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", id);
  if (error) {
    alert("Não foi possível cancelar o agendamento.");
    console.error(error);
    return;
  }
  await loadAppointments();
}
function escapeHtml(v) {
  return String(v ?? "").replace(
    /[&<>\'\"]/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\'": "&#39;",
        '"': "&quot;",
      })[c],
  );
}

supabaseClient.auth.onAuthStateChange((_event, session) => {
  if (!session) {
    loginView.classList.remove("hidden");
    dashboardView.classList.add("hidden");
  }
});
loadSession();
