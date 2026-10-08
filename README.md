# 💈 Barbearia ZN

Sistema web de agendamento para a **Barbearia ZN**, desenvolvido para facilitar o agendamento de serviços pelos clientes e o gerenciamento da agenda pelos barbeiros e proprietário.

O projeto possui uma interface pública para os clientes e um painel administrativo com autenticação e controle de acesso por função.

---

## 📌 Funcionalidades

### 👤 Área do cliente

- Escolha do barbeiro
- Escolha do serviço
- Seleção de data
- Seleção de horário disponível
- Cadastro de nome e telefone
- Confirmação do agendamento
- Verificação automática de horários ocupados
- Integração com WhatsApp para continuidade do atendimento
- Layout responsivo para desktop e dispositivos móveis

### 🧔 Barbeiros

Cada barbeiro possui acesso individual ao painel administrativo.

- Visualização da própria agenda
- Visualização dos dados dos agendamentos permitidos
- Cancelamento de agendamentos
- Acesso protegido por autenticação

### 👑 Proprietário

O usuário com função `owner` possui acesso completo à agenda:

- Visualização dos agendamentos de todos os barbeiros
- Gerenciamento dos agendamentos
- Cancelamento de agendamentos
- Acesso administrativo geral

---

## ✂️ Serviços

Atualmente, a Barbearia ZN oferece:

| Serviço | Preço | Duração |
|---|---:|---:|
| Corte | R$ 45,00 | 40 min |
| Barba | R$ 35,00 | 40 min |
| Corte + Barba | R$ 70,00 | 40 min |
| Infantil | R$ 40,00 | 40 min |
| Sobrancelha | R$ 10,00 | 40 min |
| Corte + Sobrancelha | R$ 55,00 | 40 min |

### Barbeiros

- Robson
- Samuel
- Henrique

---

## 🛠️ Tecnologias utilizadas

### Front-end

- HTML5
- CSS3
- JavaScript
- Design responsivo

### Back-end / Banco de dados

- Supabase
- PostgreSQL
- Supabase Authentication
- Row Level Security (RLS)
- PostgreSQL Functions / RPC

### Hospedagem

- GitHub
- Vercel

---

## 🗄️ Banco de dados

O sistema utiliza o Supabase como backend.

A tabela principal é:

### `appointments`

Responsável por armazenar os agendamentos.

Principais campos:

- `id`
- `barber_name`
- `service_name`
- `service_price`
- `appointment_date`
- `appointment_time`
- `client_name`
- `client_phone`
- `status`
- `created_at`

Também existe a tabela:

### `staff_profiles`

Responsável por relacionar os usuários autenticados do painel às suas funções.

As funções disponíveis são:

- `owner`
- `barber`

---

## 🔐 Segurança

O projeto utiliza **Row Level Security (RLS)** no Supabase.

O acesso aos agendamentos é separado de acordo com o usuário:

- Clientes não possuem acesso de leitura à tabela `appointments`.
- Clientes podem apenas criar novos agendamentos.
- Barbeiros podem visualizar e atualizar somente os agendamentos relacionados ao seu próprio nome.
- O proprietário pode visualizar e gerenciar todos os agendamentos.
- A exclusão definitiva de registros é restrita ao proprietário.

### Disponibilidade dos horários

O site público não consulta diretamente a tabela `appointments`.

Em vez disso, utiliza a função:

```sql
get_booked_times()
```

Essa função retorna somente os horários ocupados de determinado barbeiro e data.

Dessa forma, o cliente consegue saber quais horários estão disponíveis sem ter acesso aos dados pessoais dos outros clientes.

---

## 🚫 Prevenção de agendamentos duplicados

O banco possui um índice único parcial:

```sql
unique_barber_date_time
```

Ele impede que dois agendamentos confirmados sejam registrados para o mesmo:

- barbeiro
- data
- horário

Essa validação acontece diretamente no banco de dados, adicionando uma camada extra de segurança contra conflitos de agenda.

---

## 📂 Estrutura do projeto

```text
barbearia-zn/
│
├── index.html
├── style.css
├── app.js
│
├── admin.html
├── admin.css
├── admin.js
│
├── database.sql
├── README.md
├── .gitignore
├── .env.example
│
└── public/
    └── logo-barbearia.png
```

### Arquivos principais

**`index.html`**

Página pública utilizada pelos clientes para realizar agendamentos.

**`app.js`**

Contém a lógica do sistema de agendamento e comunicação com o Supabase.

**`style.css`**

Estilos da página pública.

**`admin.html`**

Página de login e painel administrativo.

**`admin.js`**

Responsável pela autenticação e gerenciamento da agenda.

**`admin.css`**

Estilos do painel administrativo.

**`database.sql`**

Script contendo a estrutura do banco, índices, policies RLS e função RPC.

---

## 🚀 Como executar

Como o projeto é desenvolvido em HTML, CSS e JavaScript puro, não é necessário instalar dependências ou executar um processo de build.

Basta abrir o projeto em um servidor local ou hospedá-lo em uma plataforma como a Vercel.

---

## ☁️ Deploy

O projeto pode ser hospedado diretamente na Vercel.

Fluxo utilizado:

```text
GitHub
   ↓
Vercel
   ↓
Barbearia ZN
   ↓
Supabase
```

O GitHub armazena o código-fonte, a Vercel hospeda o site e o Supabase fornece autenticação e banco de dados.

---

## ⚙️ Configuração do Supabase

Para reproduzir o projeto:

1. Criar um projeto no Supabase.
2. Executar o conteúdo de `database.sql`.
3. Criar os usuários da equipe através do Supabase Authentication.
4. Criar os respectivos registros na tabela `staff_profiles`.
5. Configurar a URL e a publishable key do projeto no código do frontend.
6. Fazer o deploy.

### Importante

Nunca utilize uma chave `service_role` ou qualquer chave secreta no frontend.

O navegador deve utilizar somente a **Supabase Publishable Key**.

---

## 📱 Responsividade

A interface foi desenvolvida para funcionar em diferentes tamanhos de tela:

- Desktop
- Notebook
- Tablet
- Smartphone

O layout adapta menus, formulários, cards, agenda e demais componentes para dispositivos menores.

---

## 🎯 Objetivo do projeto

O objetivo da Barbearia ZN é fornecer uma solução simples e prática para digitalizar o processo de agendamento da barbearia.

O sistema reduz a necessidade de gerenciamento manual dos horários e permite que clientes realizem seus agendamentos diretamente pelo site.

---

## 🔮 Possíveis melhorias futuras

Algumas funcionalidades que podem ser adicionadas futuramente:

- Dashboard com gráficos e estatísticas
- Histórico de clientes
- Gerenciamento de serviços pelo painel
- Gerenciamento dos barbeiros
- Notificações automáticas
- Integração mais avançada com WhatsApp
- Confirmação automática de agendamentos
- Sistema de horários de funcionamento
- Bloqueio de horários específicos
- Relatórios financeiros
- Sistema de avaliações dos clientes

---

## 👨‍💻 Desenvolvimento

Projeto desenvolvido como uma aplicação web completa, utilizando tecnologias web fundamentais no frontend e Supabase como backend/BaaS.

**Barbearia ZN — Sistema de Agendamento**
