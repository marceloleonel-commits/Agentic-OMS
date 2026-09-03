/* global React, Icon, MSIcon */
/* ──────────────────────────────────────────────────────────────────────────
   WorkflowSection — seção "Workflow" da página de produto (Order Detail →
   Product Detail), com duas visualizações: Etapas (cards independentes por
   etapa) e Timeline (card único com anteriores / agora / seguintes).

   Substitui o bloco marcado "Workflow section" de view-task.jsx
   (ProductDetailView), que hoje renderiza uma lista de <OdStepRow>.

   Uso (dentro de ProductDetailView):

     <WorkflowSection item={item} group={group} order={order} />

   Props
     item     objeto de group.items — usa item.steps
     group    itemGroup do pedido   — usa group.workflow, group.stages, group.supplier
     order    pedido completo       — usa order.seller, order.eta (opcional)

   Sem props, cai nos fixtures do pedido 1621368619303-01 / LB-TN-4409.
   Estilos inline de propósito: o arquivo é autocontido e não depende de
   aiw-extra.css. Ícones: Material Symbols (view_kanban / view_timeline).
   ────────────────────────────────────────────────────────────────────────── */

const { useState: wfUseState } = React;

/* Os estilos continuam inline (o arquivo é autocontido), mas todo valor vem de
   um token: não há mais tabela de cores própria aqui. */
const FG = "var(--sl-color-gray-12, #171717)";
const FG2 = "var(--sl-color-gray-8, #3D516E)";
const FG3 = "var(--sl-color-gray-7, #4E607A)";
const FG4 = "var(--sl-color-gray-6, #5D6C83)";
const BORDER = "var(--sl-color-gray-3, #E3E6EF)";
const BORDER_STRONG = "var(--sl-color-gray-5, #B6C2D5)";
const BG_05 = "rgba(29, 44, 67, 0.05)";
const BG_10 = "rgba(29, 44, 67, 0.10)";
const GREEN = "var(--sl-color-green-10, #017D10)";
const GREEN_SOFT = "var(--sl-color-green-1, #E9FCE3)";
const GREEN_SPINE = "var(--sl-color-green-4, #97EF86)";
const RED = "var(--sl-color-red-10, #D31A15)";
const RED_SOFT = "var(--sl-color-red-2, #FFEDEA)";
const RED_BORDER = "var(--sl-color-red-4, #FFD0C7)";
const BLUE = "var(--sl-color-blue-10, #1E4EE5)";
const NEUTRAL_TAG_FG = "var(--sl-color-gray-9, #2A3F5E)";

/* Tag de estado da §1b: altura 24, raio 9999, 600 12/1, sem borda. */
const stateTag = (fg, bg) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  alignSelf: "flex-start",
  height: 24,
  padding: "0 10px",
  borderRadius: 9999,
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1,
  color: fg,
  background: bg,
  whiteSpace: "nowrap",
});

const ICON_KANBAN =
  "M290-290h60v-380h-60v380Zm320-80h60v-300h-60v300ZM450-490h60v-180h-60v180ZM212.31-140Q182-140 161-161q-21-21-21-51.31v-535.38Q140-778 161-799q21-21 51.31-21h535.38Q778-820 799-799q21 21 21 51.31v535.38Q820-182 799-161q-21 21-51.31 21H212.31Zm0-60h535.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-535.38q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H212.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v535.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85ZM200-760v560-560Z";
const ICON_TIMELINE =
  "M250.77-290h218.46v-60H250.77v60Zm120-160h218.46v-60H370.77v60Zm120-160h218.46v-60H490.77v60ZM212.31-140Q182-140 161-161q-21-21-21-51.31v-535.38Q140-778 161-799q21-21 51.31-21h535.38Q778-820 799-799q21 21 21 51.31v535.38Q820-182 799-161q-21 21-51.31 21H212.31Zm0-60h535.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-535.38q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H212.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v535.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85ZM200-760v560-560Z";
const ICON_CARET =
  "M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z";
/* ── Fixtures (pedido 1621368619303-01, item LB-TN-4409) ───────────────────
   Espelham stepsSellerNoDispatch("14/06/2026") + wf-entrega-domicilio. ── */
const FALLBACK_STEPS = [
  { label: "Autorização de Pagamento", status: "done", time: "13/06/2026 18:25", stage: "Pagamento", owner: "Adyen", agent: true },
  { label: "Captura de Pagamento", status: "done", time: "13/06/2026 18:25", stage: "Pagamento", owner: "Adyen", agent: true },
  { label: "Reserva de Estoque", status: "done", time: "13/06/2026 18:26", stage: "Manuseio", owner: null, agent: true },
  { label: "Picking", status: "done", time: "14/06/2026 05:40", stage: "Manuseio", owner: null, agent: false },
  { label: "Packing", status: "done", time: "14/06/2026 06:02", stage: "Manuseio", owner: null, agent: false },
  { label: "Labeling", status: "done", time: "14/06/2026 06:12", stage: "Manuseio", owner: null, agent: false },
  { label: "Emissão de Nota Fiscal", status: "done", time: "14/06/2026 06:13", stage: "Faturamento", owner: "NFe.io", agent: true },
  { label: "Expedição", status: "active", time: "", stage: "Entrega", owner: null, agent: false, note: "Sem evento de coleta há mais de 4h. Entrega prevista para hoje." },
  { label: "First Mile", status: "pending", time: "", stage: "Entrega", owner: "GFL Logística", agent: true },
  { label: "Last Mile", status: "pending", time: "", stage: "Entrega", owner: "GFL Logística", agent: true },
  { label: "Proof of Delivery", status: "pending", time: "", stage: "Entrega", owner: null, agent: true },
];

/* Só serve de ordem para os fixtures. A grade usa a ordem de aparição das
   tarefas (stageOrderOf), senão um workflow com outras etapas — devolução,
   produto virtual — perdia colunas na tela. */
const STAGE_ORDER = ["Pagamento", "Manuseio", "Faturamento", "Entrega"];
function stageOrderOf(steps) {
  const seen = [];
  steps.forEach((s) => { if (s.stage && seen.indexOf(s.stage) === -1) seen.push(s.stage); });
  return seen.length > 0 ? seen : STAGE_ORDER;
}
/* wf-entrega-domicilio.stages[].responsible */
const STAGE_RESPONSIBLE = { Pagamento: "Gateway", Manuseio: "WMS", Faturamento: "NFe.io", Entrega: "Transportadora" };

/* 24h → 12h com AM/PM */
function fmt12(t) {
  if (!t) return null;
  const hm = (String(t).split(" ")[1] || String(t)).split(":");
  const h24 = parseInt(hm[0], 10);
  if (isNaN(h24)) return String(t);
  const ap = h24 < 12 ? "AM" : "PM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return h12 + ":" + hm[1] + " " + ap;
}

/* Deriva os steps do item + a definição do workflow. Mesma lógica de
   buildItemGroupedSteps(): etapa vem do wfStage que contém a task, owner vem
   da task do workflow. */
function buildSteps({ item, group, workflows, sellerLabel }) {
  const wfDef =
    group && workflows ? workflows.find((w) => w.id === group.workflow) : null;

  let rows;
  if (item && item.steps && item.steps.length > 0 && wfDef) {
    rows = [];
    wfDef.stages.forEach((wfStage, si) => {
      const groupStage = group.stages && group.stages[si];
      wfStage.tasks.forEach((wfTask) => {
        const step = item.steps.find((s) => s.label === wfTask.name);
        if (!step) return;
        rows.push({
          label: step.label,
          status: step.status,
          time: step.time,
          note: step.note,
          connectorStatus: step.connectorStatus || null,
          connectorNote: step.connectorNote || null,
          stage: wfStage.name,
          stageStatus: groupStage ? groupStage.status : "pending",
          /* O prestador da etapa é do workflow. O mapa de quatro nomes abaixo só
             conhecia entrega em domicílio: em devolução e produto virtual toda
             etapa caía no seller, e a coluna dizia "Samsung" quatro vezes. */
          stageResponsible: wfStage.responsible || null,
          owner: wfTask.owner || null,
          agent: !!step.agent,
        });
      });
    });
  } else {
    rows = FALLBACK_STEPS.map((s) => ({ ...s }));
  }

  const seller = sellerLabel || (group && group.supplier) || "Loja Botafogo";

  return rows.map((s) => ({
    ...s,
    timeLabel: fmt12(s.time),
    /* Execução automática é do prestador da task/etapa; manual é do seller. */
    provider: s.agent
      ? s.owner || s.stageResponsible || STAGE_RESPONSIBLE[s.stage] || seller
      : "Manual · " + seller,
    stageProvider: s.stageResponsible || STAGE_RESPONSIBLE[s.stage] || seller,
  }));
}

/* Três estados, não dois. Antes só existia done | blocked, então uma etapa que
   ainda não começou aparecia como "Bloqueada" — o card contradizia o alerta.
   `current` é a tarefa em foco: a etapa que a contém é a bloqueada; as depois
   dela são apenas previstas. */
function stageStatusOf(steps, stageName, current, stalled) {
  const rows = steps.filter((s) => s.stage === stageName);
  if (rows.length === 0) return "future";
  if (rows.every((s) => s.status === "done")) return "done";
  if (current && rows.indexOf(current) !== -1) return stalled ? "blocked" : "running";
  return "future";
}

/* "Em execução" existe porque a etapa que contém a task em foco só está
   bloqueada quando há problema no dado — era o mesmo defeito que o `future`
   corrigiu do outro lado: o card contradizia o alerta. */
const STAGE_TAG = {
  done: { label: "Concluída", fg: GREEN, bg: GREEN_SOFT },
  blocked: { label: "Bloqueada", fg: RED, bg: RED_SOFT },
  running: { label: "Em execução", fg: BLUE, bg: "var(--sl-color-blue-2, #E1F3FF)" },
  future: { label: "Prevista", fg: NEUTRAL_TAG_FG, bg: BG_05 },
};

/* Opção do segmented, com rótulo escrito. Dois ícones sem texto pediam que o
   operador adivinhasse a diferença entre as duas vistas. */
function ViewOption({ active, label, path, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        height: 36,
        padding: "0 16px",
        border: "none",
        borderRadius: 12,
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 14,
        fontWeight: 600,
        lineHeight: "20px",
        whiteSpace: "nowrap",
        background: active ? "#fff" : "transparent",
        color: active ? FG : FG3,
        boxShadow: active ? "var(--sl-shadow-1)" : "none",
      }}
    >
      <svg width="18" height="18" viewBox="0 -960 960 960" fill="currentColor" style={{ flexShrink: 0 }}>
        <path d={path} />
      </svg>
      {label}
    </button>
  );
}

/* ── Alerta da task bloqueada ──
   Regra: qualquer alerta gerado dentro do workflow que tenha uma
   iniciativa/tarefa "dona" no contexto (canvas → pedido → produto) volta
   pra ela via CTA "Ver iniciativa <id>". Fora desse contexto o botão some
   (pedido standalone não tem a quem apontar).

   O texto sai do dado da task em foco. Antes era fixo — "sem evento de coleta
   há mais de 4h", "o carrier Jadlog não registrou coleta", "Labeling às 6:12" —
   e aparecia em qualquer workflow: no de devolução o modal acusava coleta que
   nunca existiu, e no de produto virtual atribuía a falha da NF-e a um carrier.

   Os sinais são os mesmos de `orderProblemAlerts` (§5) — falha de conector na
   task ativa, ou projeção do grupo em erro — para que o alerta do modal e o do
   topo do pedido nunca discordem. Task só em execução não é problema. */
function blockedAlertOf(current, doneRows, group) {
  if (!current) return null;
  const connector = !!current.connectorStatus;
  const groupStalled = ((group && group.projections) || []).some((p) => p.status === "error");
  if (!connector && !groupStalled) return null;

  const last = doneRows && doneRows.length ? doneRows[doneRows.length - 1] : null;
  const raw = current.connectorNote || current.note || "Etapa parada sem evento novo";
  return {
    tone: connector ? "critical" : "warning",
    title: `${current.label} parada`,
    desc: (/[.!?]$/.test(raw) ? raw : raw + ".")
      + (last ? ` Último evento registrado: ${last.label}, ${last.timeLabel}.` : ""),
  };
}

function BlockedAlert({ alert, onOpenInitiative, initiativeLabel, bare, onDismiss }) {
  /* Handoff §2/§5: a anatomia é a de `4g` — as classes `.od-alert*` são a
     mesma fonte, para os dois lugares em que o pedido fala de problema
     falarem igual.

     SPEC CONFLICT: `4d` §4.1 pede a ação como secundário com `chevron_right`,
     e `4g` (rodada 4 §5) pede primário com `bolt`. No modal vale o `4d`, que é
     o documento desta superfície; o alerta do canvas do pedido segue no
     primário até o desenho reconciliar os dois. */
  if (!alert) return null;

  return (
    <div className="od-alert" data-tone={alert.tone}>
      <span className="od-alert-icon">
        <Icon name={alert.tone === "critical" ? "error-outline" : "warning-amber"} size={20} />
      </span>
      <div className="od-alert-body">
        <span className="od-alert-title">{alert.title}</span>
        <span className="od-alert-desc">{alert.desc}</span>
        {onOpenInitiative && initiativeLabel && (
          <div className="od-alert-actions">
            <button
              type="button"
              className={bare ? "od-alert-secondary" : "od-alert-primary"}
              onClick={onOpenInitiative}
            >
              {!bare && <MSIcon name="bolt" size={16} />}
              Ver iniciativa {initiativeLabel}
              <Icon name="chevron-right" size={bare ? 18 : 16} />
            </button>
          </div>
        )}
      </div>
      {onDismiss && (
        <button type="button" className="od-alert-close" onClick={onDismiss} aria-label="Fechar alerta" title="Fechar">
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );
}

/* ══ Visualização 1 — Etapas ══════════════════════════════════════════════
   Etapas são independentes (não há eixo entre elas): cada coluna é um
   cabeçalho (nome / prestador / status) + um card por task. ── */
function StagesView({ steps, stalled, doneCount, pendingCount, current, bare }) {
  const stages = stageOrderOf(steps);

  const body = (
    <>
      {/* Uma coluna por etapa. Em workflow de quatro etapas isso é o
          `repeat(4, 1fr)` do handoff; o teto fixo de quatro quebrava a quinta
          etapa da devolução para uma segunda linha, abrindo um buraco no meio
          da grade. */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${stages.length || 1}, minmax(0, 1fr))`, gap: 16, alignItems: "start" }}>
        {stages.map((stageName) => {
            const tasks = steps.filter((s) => s.stage === stageName);
            if (tasks.length === 0) return null;
            const tag = STAGE_TAG[stageStatusOf(steps, stageName, current, stalled)];
            return (
              <div key={stageName} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px", background: BG_05, borderRadius: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: FG, letterSpacing: "-0.14px", lineHeight: "20px" }}>{stageName}</span>
                    <span style={{ fontSize: 12, lineHeight: "16px", color: FG3 }}>{tasks[0].stageProvider}</span>
                  </div>
                  <span style={stateTag(tag.fg, tag.bg)}>{tag.label}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {tasks.map((s) => {
                    const pending = s.status === "pending";
                    const active = s === current;
                    return (
                      <div
                        key={s.label}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                          padding: "10px 12px",
                          border: "1px " + (pending ? "dashed " : "solid ") + (active && stalled ? RED_BORDER : BORDER),
                          background: active && stalled ? RED_SOFT : "#fff",
                          borderRadius: 12,
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: pending ? FG4 : FG, lineHeight: "20px" }}>
                            {s.label}
                          </div>
                          {s.timeLabel && (
                            <div style={{ fontSize: 12, lineHeight: "16px", color: FG3, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                              {s.timeLabel}
                            </div>
                          )}
                        </div>
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            marginTop: 5,
                            borderRadius: "50%",
                            boxSizing: "border-box",
                            flexShrink: 0,
                            background: pending ? "#fff" : active ? (stalled ? RED : BLUE) : GREEN,
                            border: "2px solid " + (pending ? BORDER_STRONG : active ? (stalled ? RED : BLUE) : GREEN),
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </>
  );

  /* No modal do pacote o enquadramento é do host: a barra "Etapas do workflow"
     repetia o contador que já vive na barra de contexto, e a moldura desenhava
     uma segunda caixa dentro do painel. */
  if (bare) return body;

  return (
    <div style={{ border: "1px solid " + BORDER, borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 24px", borderBottom: "1px solid " + BORDER, background: "#fff" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: FG }}>Etapas do workflow</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: FG3, whiteSpace: "nowrap" }}>
          {doneCount} concluídas · {pendingCount} previstas
        </span>
      </div>
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>{body}</div>
    </div>
  );
}

/* ══ Visualização 2 — Timeline ════════════════════════════════════════════
   Card único: barra de topo (toggle), bloco "Agora" sempre visível e, quando
   aberto, as anteriores acima e as previstas abaixo, no mesmo card. ── */
function TimelineView({ steps, stalled, doneRows, futureRows, current, doneCount, pendingCount, order }) {
  const [open, setOpen] = wfUseState(false);
  const previous = doneRows[doneRows.length - 1];
  const seller = current ? current.provider : "—";
  /* Handoff §2: a borda de 3px do "Agora" segue o estado — red-10 parado,
     blue-10 em execução. Antes era sempre vermelha, então um workflow saudável
     aparecia como problema. */
  const nowTone = stalled ? RED : BLUE;

  const Row = ({ s, future }) => (
    <div style={{ display: "grid", gridTemplateColumns: "92px 1fr", minHeight: future ? 48 : 44 }}>
      <div style={{ textAlign: "right", padding: future ? "16px 16px 0 0" : "6px 16px 0 0", fontSize: 12, lineHeight: "16px", color: future ? FG4 : FG3, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
        {future ? "previsto" : s.timeLabel}
      </div>
      <div style={{ position: "relative", padding: future ? "12px 0 0 26px" : "4px 0 6px 26px", borderLeft: "2px " + (future ? "dashed " + BORDER : "solid " + GREEN_SPINE) }}>
        <span
          style={{
            position: "absolute",
            left: -6,
            top: future ? 18 : 10,
            width: 10,
            height: 10,
            borderRadius: "50%",
            boxSizing: "border-box",
            background: future ? "#fff" : GREEN,
            border: future ? "2px solid " + BORDER_STRONG : "none",
          }}
        />
        <div style={{ fontSize: 14, fontWeight: future ? 400 : 500, color: future ? FG4 : FG, lineHeight: "20px" }}>{s.label}</div>
        <div style={{ fontSize: 12, lineHeight: "16px", color: future ? FG4 : FG3, marginTop: 1 }}>{s.provider}</div>
      </div>
    </div>
  );

  return (
    <div style={{ border: "1px solid " + BORDER, borderRadius: 12, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 20px",
          border: "none",
          borderBottom: "1px solid " + BORDER,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
        className="wf-timeline-toggle"
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 256 256" fill={FG3} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d={ICON_CARET} />
        </svg>
        <span style={{ fontSize: 14, fontWeight: 600, lineHeight: "20px", color: FG }}>
          {open ? "Ocultar tarefas anteriores e seguintes" : "Exibir tarefas anteriores e seguintes"}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: FG3, whiteSpace: "nowrap" }}>
          {doneCount} concluídas · {pendingCount} previstas
        </span>
      </button>

      {open && (
        <div style={{ padding: "16px 20px 8px", borderBottom: "1px solid " + BORDER }}>
          {doneRows.map((s) => <Row key={s.label} s={s} />)}
        </div>
      )}

      {current && (
        /* A tarefa em foco carrega a cor do estado na borda esquerda, para se
           distinguir das concluídas sem repetir o alerta. */
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, borderLeft: "3px solid " + nowTone }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, lineHeight: "16px", color: FG3 }}>Agora</span>
            <span style={stateTag(nowTone, stalled ? RED_SOFT : "var(--sl-color-blue-2, #E1F3FF)")}>
              {stalled && <span style={{ width: 6, height: 6, borderRadius: "50%", background: nowTone }} />}
              {stalled ? "Bloqueada" : "Em execução"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <h4 style={{ margin: 0, fontSize: 24, fontWeight: 600, lineHeight: "32px", letterSpacing: "-0.48px" }}>{current.label}</h4>
            <span style={{ fontSize: 12, lineHeight: "16px", color: FG3 }}>
              {steps.indexOf(current) + 1}ª de {steps.length} · etapa {current.stage}
            </span>
          </div>

          <p style={{ margin: 0, fontSize: 14, lineHeight: "22px", color: FG2, maxWidth: "56ch", textWrap: "pretty" }}>
            {current.note || "Tarefa em execução."}{" "}
            {previous && "Último evento registrado pelo seller foi o " + previous.label + ", às " + previous.timeLabel + "."}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, padding: "14px 0 0", borderTop: "1px solid " + BORDER }}>
            <div>
              <div style={{ fontSize: 12, lineHeight: "16px", color: FG3 }}>Executor</div>
              {/* Só quem executa a task em foco. O "· Jadlog" fixo que estava
                  aqui aparecia em devolução e produto virtual, onde não há
                  transportadora, e repetia o seller quando havia. */}
              <div style={{ fontSize: 14, lineHeight: "20px", marginTop: 2 }}>{seller}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, lineHeight: "16px", color: FG3 }}>Progresso</div>
              <div style={{ fontSize: 14, lineHeight: "20px", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                {doneCount} de {steps.length} tarefas
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, lineHeight: "16px", color: FG3 }}>Previsão</div>
              <div style={{ fontSize: 14, lineHeight: "20px", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                {(order && order.eta) || "—"}
              </div>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div style={{ padding: "12px 20px 20px", borderTop: "1px solid " + BORDER }}>
          {/* Workflow no fim: sem "seguintes" a lista ficava vazia sem dizer
              por quê. */}
          {futureRows.length > 0
            ? futureRows.map((s) => <Row key={s.label} s={s} future />)
            : <div style={{ fontSize: 14, color: FG3 }}>Workflow concluído — nenhuma tarefa seguinte.</div>}
        </div>
      )}
    </div>
  );
}

/* Segmented da §1c: contêiner r16 com 3px de folga, opção de 36px/r12. */
function WorkflowViewToggle({ view, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Visualização do workflow"
      style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, padding: 3, background: BG_05, borderRadius: 16 }}
    >
      <ViewOption active={view === "stages"} label="Etapas" path={ICON_KANBAN} onClick={() => onChange("stages")} />
      <ViewOption active={view === "timeline"} label="Timeline" path={ICON_TIMELINE} onClick={() => onChange("timeline")} />
    </div>
  );
}

/* ══ Seção ════════════════════════════════════════════════════════════════ */
function WorkflowSection({ item, group, order, workflows, defaultView = "stages", onOpenInitiative, initiativeLabel, view: viewProp, onViewChange, hideHeader = false }) {
  const [ownView, setOwnView] = wfUseState(defaultView);
  /* O modal do pacote hospeda o segmented na própria barra de contexto, então
     pode controlar a view de fora; no Product Detail a seção segue dona dela. */
  const view = viewProp || ownView;
  const setView = onViewChange || setOwnView;

  const wfs = workflows || (typeof window !== "undefined" && window.AIWData ? window.AIWData.workflows : null);
  const steps = buildSteps({
    item,
    group,
    workflows: wfs,
    sellerLabel: order && order.seller,
  });

  const doneRows = steps.filter((s) => s.status === "done");
  const rest = steps.filter((s) => s.status !== "done");
  const current = rest[0] || null;
  const futureRows = rest.slice(1);
  const alert = blockedAlertOf(current, doneRows, group);
  /* Fechar o alerta é local à sessão da vista: ao trocar de item o alerta do
     novo escopo volta a aparecer, porque a chave muda. */
  const alertKey = alert ? `${item && item.sku}·${alert.title}` : null;
  const [dismissedKey, setDismissedKey] = wfUseState(null);
  const alertVisible = alert && dismissedKey !== alertKey;

  return (
    <section style={{ padding: 0, border: "none", color: FG, display: "flex", flexDirection: "column", gap: 16 }}>
      {!hideHeader && (
        /* Sem hairline nem padding-top: segue `.detail-section-head--no-border`,
           o mesmo cabeçalho das outras seções do pedido e do produto. */
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, lineHeight: "28px", letterSpacing: "-0.4px" }}>Workflow</h3>
          <WorkflowViewToggle view={view} onChange={setView} />
        </div>
      )}

      {/* Primeiro elemento do painel, nas duas vistas: quem abre está atrás do
          problema, e lê-lo não pode depender de rolar até o fim nem de escolher
          a vista certa. */}
      {alertVisible && (
        <BlockedAlert
          alert={alert}
          onOpenInitiative={onOpenInitiative}
          initiativeLabel={initiativeLabel}
          bare={hideHeader}
          onDismiss={() => setDismissedKey(alertKey)}
        />
      )}

      {view === "stages" ? (
        <StagesView
          steps={steps}
          stalled={!!alert}
          doneCount={doneRows.length}
          pendingCount={futureRows.length}
          current={current}
          bare={hideHeader}
        />
      ) : (
        <TimelineView
          steps={steps}
          stalled={!!alert}
          doneRows={doneRows}
          futureRows={futureRows}
          current={current}
          doneCount={doneRows.length}
          pendingCount={futureRows.length}
          order={order}
        />
      )}
    </section>
  );
}

/* A barra de contexto do modal do pacote diz "N concluídas · N previstas" do
   escopo corrente. Os números saem daqui, do mesmo buildSteps que alimenta as
   duas vistas, para nunca discordarem do que a tela mostra. */
function workflowStepCounts({ item, group, workflows, sellerLabel }) {
  const steps = buildSteps({ item, group, workflows, sellerLabel });
  const done = steps.filter((s) => s.status === "done").length;
  const rest = steps.length - done;
  return { total: steps.length, done, pending: Math.max(rest - 1, 0) };
}

if (typeof window !== "undefined") {
  window.WorkflowSection = WorkflowSection;
  window.WorkflowViewToggle = WorkflowViewToggle;
  window.workflowStepCounts = workflowStepCounts;
}
