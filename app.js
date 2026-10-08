// ========================================
// BARBEARIA RV - APP.JS
// ========================================

// SUPABASE
const SUPABASE_URL = "https://udoitfmocoveypdthshm.supabase.co";
const SUPABASE_KEY = "sb_publishable_UGe0fWqyqfD5C6S4XjmZWA_asSc4_4d";

let supabaseClient = null;

const supabaseConfigurado =
  SUPABASE_URL.startsWith("https://") &&
  SUPABASE_URL.includes(".supabase.co") &&
  SUPABASE_KEY.length > 20;

if (supabaseConfigurado && window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

console.log("BARBEARIA ZN carregada!");

// ========================================
// BARBEIROS
// ========================================

const barbeiros = {
  Robson: {
    telefone: "5515981587413",
  },

  Samuel: {
    telefone: "15996204775",
  },

  Henrique: {
    telefone: "15981260825",
  },
};

// ========================================
// SERVIÇOS
// ========================================

const servicos = {
  Corte: {
    nome: "Corte",
    preco: 45,
    duracao: 40,
  },

  Barba: {
    nome: "Barba",
    preco: 35,
    duracao: 40,
  },

  "Corte + Barba": {
    nome: "Corte + Barba",
    preco: 70,
    duracao: 40,
  },

  Infantil: {
    nome: "Infantil",
    preco: 40,
    duracao: 40,
  },

  Sobrancelha: {
    nome: "Sobrancelha",
    preco: 10,
    duracao: 40,
  },

  "Corte + Sobrancelha": {
    nome: "Corte + Sobrancelha",
    preco: 55,
    duracao: 40,
  },
};

// ========================================
// HORÁRIOS
// ========================================

const horarios = [
  "09:00",
  "09:40",
  "10:20",
  "11:00",
  "11:40",
  "12:20",
  "13:00",
  "13:40",
  "14:20",
  "15:00",
  "15:40",
  "16:20",
  "17:00",
  "17:40",
];

// ========================================
// AGENDAMENTO
// ========================================

let agendamento = {
  barbeiro: null,
  servico: null,
  preco: null,
  duracao: null,
  data: null,
  horario: null,
  nome: null,
  telefone: null,
};

// ========================================
// ESCOLHER BARBEIRO
// ========================================

function selectBarber(nome, elemento) {
  agendamento.barbeiro = nome;

  document.querySelectorAll("[data-barber]").forEach(function (item) {
    item.classList.remove("selected");
  });

  if (elemento) {
    elemento.classList.add("selected");
  }

  console.log("Barbeiro:", nome);
}

// ========================================
// ESCOLHER SERVIÇO
// ========================================

function selectService(nome, preco, duracao, elemento) {
  agendamento.servico = nome;
  agendamento.preco = preco;
  agendamento.duracao = duracao;

  document
    .querySelectorAll(".services-options .option")
    .forEach(function (item) {
      item.classList.remove("selected");
    });

  if (elemento) {
    elemento.classList.add("selected");
  }

  console.log("Serviço:", nome);
  console.log("Preço:", preco);
  console.log("Duração:", duracao);
}

// ========================================
// IR PARA UMA ETAPA
// ========================================

function nextStep(step) {
  // ETAPA 2
  if (step === 2) {
    if (!agendamento.barbeiro) {
      alert("Selecione um barbeiro primeiro.");
      return;
    }
  }

  // ETAPA 3
  if (step === 3) {
    if (!agendamento.servico) {
      alert("Selecione um serviço primeiro.");
      return;
    }
  }

  // ETAPA 4
  if (step === 4) {
    if (!agendamento.data) {
      alert("Selecione uma data.");
      return;
    }

    if (!agendamento.horario) {
      alert("Selecione um horário.");
      return;
    }

    atualizarResumo();
  }

  // Esconde todas as etapas
  document.querySelectorAll(".step").forEach(function (element) {
    element.classList.remove("active");
  });

  // Mostra a etapa escolhida
  const etapa = document.getElementById("step" + step);

  if (etapa) {
    etapa.classList.add("active");
  }

  // Rola para o agendamento
  const booking = document.getElementById("agendamento");

  if (booking) {
    booking.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// ========================================
// DATA
// ========================================

function configurarData() {
  const campoData = document.getElementById("date");

  if (!campoData) {
    return;
  }

  // Data de hoje
  const hoje = new Date();

  const ano = hoje.getFullYear();

  const mes = String(hoje.getMonth() + 1).padStart(2, "0");

  const dia = String(hoje.getDate()).padStart(2, "0");

  const dataHoje = `${ano}-${mes}-${dia}`;

  // Impede datas passadas
  campoData.min = dataHoje;

  // Quando escolher uma data
  campoData.addEventListener("change", function () {
    agendamento.data = this.value;

    agendamento.horario = null;

    carregarHorarios();
  });
}

// ========================================
// CARREGAR HORÁRIOS
// ========================================

async function carregarHorarios() {
  const container = document.getElementById("hours");

  const loading = document.getElementById("loading");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (loading) {
    loading.textContent = "Carregando horários...";
  }

  if (!agendamento.data) {
    if (loading) {
      loading.textContent = "Selecione uma data";
    }

    return;
  }

  // Se Supabase ainda não foi configurado,
  // mostra os horários normalmente
  if (!supabaseClient) {
    mostrarHorarios(horarios, []);

    if (loading) {
      loading.textContent = "Horários disponíveis";
    }

    return;
  }

  try {
    const { data, error } = await supabaseClient.rpc("get_booked_times", {
      p_barber_name: agendamento.barbeiro,
      p_appointment_date: agendamento.data,
    });

    if (error) {
      console.error(error);

      mostrarHorarios(horarios, []);

      return;
    }

    const ocupados = data.map(function (item) {
      return item.appointment_time;
    });

    mostrarHorarios(horarios, ocupados);

    if (loading) {
      loading.textContent = "Horários disponíveis";
    }
  } catch (erro) {
    console.error(erro);

    mostrarHorarios(horarios, []);
  }
}

// ========================================
// MOSTRAR HORÁRIOS
// ========================================

function mostrarHorarios(listaHorarios, ocupados) {
  const container = document.getElementById("hours");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  listaHorarios.forEach(function (horario) {
    const ocupado = ocupados.includes(horario);

    const botao = document.createElement("button");

    botao.type = "button";

    botao.className = "time-option";

    botao.textContent = horario;

    if (ocupado) {
      botao.classList.add("disabled");

      botao.disabled = true;
    } else {
      botao.addEventListener("click", function () {
        selecionarHorario(horario, botao);
      });
    }

    container.appendChild(botao);
  });
}

// ========================================
// ESCOLHER HORÁRIO
// ========================================

function selecionarHorario(horario, elemento) {
  agendamento.horario = horario;

  document.querySelectorAll(".time-option").forEach(function (item) {
    item.classList.remove("selected");
  });

  if (elemento) {
    elemento.classList.add("selected");
  }

  console.log("Horário:", horario);
}

// ========================================
// ATUALIZAR RESUMO
// ========================================

function atualizarResumo() {
  const servico = servicos[agendamento.servico];

  if (!servico) {
    return;
  }

  const summary = document.getElementById("summary");

  if (!summary) {
    return;
  }

  summary.innerHTML = `

        <div class="summary-item">
            <span>Barbeiro</span>
            <strong>
                ${agendamento.barbeiro}
            </strong>
        </div>

        <div class="summary-item">
            <span>Serviço</span>
            <strong>
                ${servico.nome}
            </strong>
        </div>

        <div class="summary-item">
            <span>Data</span>
            <strong>
                ${formatarData(agendamento.data)}
            </strong>
        </div>

        <div class="summary-item">
            <span>Horário</span>
            <strong>
                ${agendamento.horario}
            </strong>
        </div>

        <div class="summary-item">
            <span>Valor</span>
            <strong>
                R$ ${servico.preco.toFixed(2).replace(".", ",")}
            </strong>
        </div>

    `;
}

// ========================================
// FORMATAR DATA
// ========================================

function formatarData(data) {
  if (!data) {
    return "";
  }

  const partes = data.split("-");

  if (partes.length !== 3) {
    return data;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// ========================================
// CONFIRMAR AGENDAMENTO
// ========================================

async function confirmAppointment() {
  const nomeInput = document.getElementById("clientName");

  const telefoneInput = document.getElementById("clientPhone");

  const nome = nomeInput ? nomeInput.value.trim() : "";

  const telefone = telefoneInput ? telefoneInput.value.trim() : "";

  if (!nome) {
    alert("Digite seu nome para continuar.");

    return;
  }

  if (!telefone) {
    alert("Digite seu WhatsApp para continuar.");

    return;
  }

  agendamento.nome = nome;

  agendamento.telefone = telefone;

  if (!agendamento.barbeiro) {
    alert("Selecione um barbeiro.");

    return;
  }

  if (!agendamento.servico) {
    alert("Selecione um serviço.");

    return;
  }

  if (!agendamento.data) {
    alert("Selecione uma data.");

    return;
  }

  if (!agendamento.horario) {
    alert("Selecione um horário.");

    return;
  }

  const servico = servicos[agendamento.servico];

  // ====================================
  // SUPABASE
  // ====================================

  if (!supabaseClient) {
    alert(
      "O Supabase ainda não foi configurado. Coloque a URL e a chave no app.js.",
    );

    return;
  }

  // Feedback visual enquanto o agendamento é salvo
  const confirmButton = document.getElementById("confirmButton");

  const reservationLoading = document.getElementById("reservationLoading");

  if (confirmButton) {
    confirmButton.disabled = true;
    confirmButton.classList.add("is-loading");
    confirmButton.setAttribute("aria-busy", "true");
  }

  if (reservationLoading) {
    reservationLoading.classList.add("is-visible");
    reservationLoading.setAttribute("aria-hidden", "false");
  }

  try {
    const { error } = await supabaseClient.from("appointments").insert([
      {
        barber_name: agendamento.barbeiro,

        service_name: servico.nome,

        appointment_date: agendamento.data,

        appointment_time: agendamento.horario,

        client_name: agendamento.nome,

        client_phone: agendamento.telefone,

        service_price: servico.preco,

        status: "confirmed",
      },
    ]);

    if (error) {
      console.error(error);

      if (error.code === "23505") {
        alert(
          "Esse horário ja está reservado. Por favor escolha outro horário.",
        );

        carregarHorarios();

        return;
      }

      alert("Erro ao salvar o agendamento.");

      return;
    }

    // O agendamento foi salvo com sucesso.
    // O WhatsApp agora é aberto somente após o clique do usuário,
    // evitando bloqueios de popup do Safari.
    mostrarConfirmacao(servico);
  } catch (erro) {
    console.error(erro);

    alert("Ocorreu um erro ao confirmar o agendamento.");
  } finally {
    // Libera o botão se o fluxo terminar com erro.
    // Em caso de sucesso, o navegador seguirá para o WhatsApp.
    if (confirmButton) {
      confirmButton.disabled = false;
      confirmButton.classList.remove("is-loading");
      confirmButton.removeAttribute("aria-busy");
    }

    if (reservationLoading) {
      reservationLoading.classList.remove("is-visible");
      reservationLoading.setAttribute("aria-hidden", "true");
    }
  }
}

// ========================================
// CONFIRMAÇÃO NA TELA
// ========================================

function mostrarConfirmacao(servico) {
  const modal = document.getElementById("confirmationModal");
  const details = document.getElementById("confirmationDetails");

  if (!modal || !details) {
    return;
  }

  details.innerHTML = `
        <div class="confirmation-row">
            <span>Barbeiro</span>
            <strong>${agendamento.barbeiro}</strong>
        </div>
        <div class="confirmation-row">
            <span>Serviço</span>
            <strong>${servico.nome}</strong>
        </div>
        <div class="confirmation-row">
            <span>Data</span>
            <strong>${formatarData(agendamento.data)}</strong>
        </div>
        <div class="confirmation-row">
            <span>Horário</span>
            <strong>${agendamento.horario}</strong>
        </div>
        <div class="confirmation-row">
            <span>Valor</span>
            <strong>R$ ${servico.preco.toFixed(2).replace(".", ",")}</strong>
        </div>
    `;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("confirmation-open");
}

function fecharConfirmacao() {
  const modal = document.getElementById("confirmationModal");
  if (!modal) return;

  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("confirmation-open");
}

function continuarWhatsApp() {
  const servico = servicos[agendamento.servico];
  if (!servico) return;

  abrirWhatsApp(servico);
}

// ========================================
// WHATSAPP
// ========================================

function abrirWhatsApp(servico) {
  const barbeiro = barbeiros[agendamento.barbeiro];

  if (!barbeiro) {
    alert("Barbeiro não encontrado.");

    return;
  }

  const mensagem = `Olá! Gostaria de confirmar meu agendamento na BARBEARIA ZONA NORTE. ✂️

Nome: ${agendamento.nome}
Serviço: ${servico.nome}
Data: ${formatarData(agendamento.data)}
Horário: ${agendamento.horario}
Barbeiro: ${agendamento.barbeiro}
Valor: R$ ${servico.preco.toFixed(2).replace(".", ",")}`;

  const link = `https://wa.me/${barbeiro.telefone}?text=${encodeURIComponent(mensagem)}`;

  window.open(link, "_blank");
}

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("BARBEARIA ZN pronta!");

  configurarData();
});
