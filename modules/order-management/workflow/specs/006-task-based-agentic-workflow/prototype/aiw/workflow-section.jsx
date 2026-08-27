/* global React */
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

/* ── Tokens usados (styles.css do protótipo) ── */
const T = {
  fg: "#0F1115",
  fg2: "#3A3F47",
  fg3: "#6B7280",
  fg4: "#9AA0A8",
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",
  bgSoft: "#F7F8FA",
  bgMuted: "#F2F2F3",
  primary: "#2962FF",
  green: "#169B61",
  greenSoft: "#F0FDF4",
  greenBorder: "#BBF7D0",
  greenSpine: "#D1FAE5",
  red: "#DC2626",
  redSoft: "#FEF2F2",
  redBorder: "#FECACA",
  shadow: "0 4px 14px rgba(15,17,21,.06), 0 1px 2px rgba(15,17,21,.04)",
  font: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
};

const ICON_KANBAN =
  "M290-290h60v-380h-60v380Zm320-80h60v-300h-60v300ZM450-490h60v-180h-60v180ZM212.31-140Q182-140 161-161q-21-21-21-51.31v-535.38Q140-778 161-799q21-21 51.31-21h535.38Q778-820 799-799q21 21 21 51.31v535.38Q820-182 799-161q-21 21-51.31 21H212.31Zm0-60h535.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-535.38q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H212.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v535.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85ZM200-760v560-560Z";
const ICON_TIMELINE =
  "M250.77-290h218.46v-60H250.77v60Zm120-160h218.46v-60H370.77v60Zm120-160h218.46v-60H490.77v60ZM212.31-140Q182-140 161-161q-21-21-21-51.31v-535.38Q140-778 161-799q21-21 51.31-21h535.38Q778-820 799-799q21 21 21 51.31v535.38Q820-182 799-161q-21 21-51.31 21H212.31Zm0-60h535.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-535.38q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H212.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v535.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85ZM200-760v560-560Z";
const ICON_CARET =
  "M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z";
const ICON_WARNING =
  "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm-8,56a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm8,104a12,12,0,1,1,12-12A12,12,0,0,1,128,184Z";

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

const STAGE_ORDER = ["Pagamento", "Manuseio", "Faturamento", "Entrega"];
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
          stage: wfStage.name,
          stageStatus: groupStage ? groupStage.status : "pending",
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
      ? s.owner || STAGE_RESPONSIBLE[s.stage] || seller
      : "Manual · " + seller,
    stageProvider: STAGE_RESPONSIBLE[s.stage] || seller,
  }));
}

function stageStatusOf(steps, stageName) {
  const rows = steps.filter((s) => s.stage === stageName);
  if (rows.length === 0) return "pending";
  if (rows.every((s) => s.status === "done")) return "done";
  return "active";
}

/* ── Tooltip escura (mesma linguagem do SidebarTooltip do protótipo) ── */
function IconToggle({ active, tip, path, onClick }) {
  const [hover, setHover] = wfUseState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={tip}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      style={{
        position: "relative",
        border: "none",
        width: 32,
        height: 32,
        borderRadius: 8,
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        background: active ? "#fff" : "transparent",
        color: active ? T.fg : T.fg3,
        boxShadow: active ? "0 1px 2px rgba(15,17,21,.08)" : "none",
      }}
    >
      <svg width="20" height="20" viewBox="0 -960 960 960" fill="currentColor">
        <path d={path} />
      </svg>
      {hover && (
        <span
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: T.fg,
            color: "#fff",
            font: "500 12px/1.4 " + T.font,
            padding: "4px 8px",
            borderRadius: 6,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          {tip}
        </span>
      )}
    </button>
  );
}

/* ── Alerta da task bloqueada ──
   Regra: qualquer alerta gerado dentro do workflow que tenha uma
   iniciativa/tarefa "dona" no contexto (canvas → pedido → produto) volta
   pra ela via CTA "Ver iniciativa <id>". Fora desse contexto o botão some
   (pedido standalone não tem a quem apontar). */
function BlockedAlert({ current, onOpenInitiative, initiativeLabel }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "14px 16px",
        border: "1px solid " + T.redBorder,
        background: T.redSoft,
        borderRadius: 12,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 256 256" fill={T.red} style={{ flexShrink: 0, marginTop: 1 }}>
        <path fillRule="evenodd" d={ICON_WARNING} />
      </svg>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.fg }}>
          {current.label} sem evento de coleta há mais de 4h
        </div>
        <div style={{ fontSize: 13, color: T.fg2, marginTop: 3 }}>
          Último evento do seller: Labeling, 14/06 6:12 AM. O carrier Jadlog não registrou coleta. Entrega prevista para hoje.
        </div>
        {onOpenInitiative && initiativeLabel && (
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              type="button"
              onClick={onOpenInitiative}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                border: "1px solid " + T.border,
                background: "#fff",
                color: T.fg,
                font: "500 13px " + T.font,
                cursor: "pointer",
              }}
            >
              Ver iniciativa {initiativeLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══ Visualização 1 — Etapas ══════════════════════════════════════════════
   Etapas são independentes (não há eixo entre elas): cada coluna é um
   cabeçalho (nome / prestador / status) + um card por task. ── */
function StagesView({ steps, doneCount, pendingCount, current, onOpenInitiative, initiativeLabel }) {
  return (
    <div style={{ border: "1px solid " + T.border, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 24px", borderBottom: "1px solid " + T.border, background: "#fff" }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: T.fg }}>Etapas do workflow</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: T.fg3, whiteSpace: "nowrap" }}>
          {doneCount} concluídas · {pendingCount} previstas
        </span>
      </div>

      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, alignItems: "start" }}>
          {STAGE_ORDER.map((stageName) => {
            const tasks = steps.filter((s) => s.stage === stageName);
            if (tasks.length === 0) return null;
            const st = stageStatusOf(steps, stageName);
            const chip = st === "done"
              ? { fg: T.green, bg: T.greenSoft, border: T.greenBorder, label: "Concluída" }
              : { fg: T.red, bg: T.redSoft, border: T.redBorder, label: "Bloqueada" };
            return (
              <div key={stageName} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 12px", background: T.bgSoft, borderRadius: 10 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.fg, letterSpacing: "-0.01em" }}>{stageName}</span>
                    <span style={{ fontSize: 11.5, color: T.fg3 }}>{tasks[0].stageProvider}</span>
                  </div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      alignSelf: "flex-start",
                      fontSize: 11,
                      fontWeight: 600,
                      color: chip.fg,
                      background: chip.bg,
                      border: "1px solid " + chip.border,
                      borderRadius: 99,
                      padding: "2px 9px",
                    }}
                  >
                    {chip.label}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {tasks.map((s) => {
                    const pending = s.status === "pending";
                    const active = s.status === "active";
                    return (
                      <div
                        key={s.label}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                          padding: "10px 12px",
                          border: "1px " + (pending ? "dashed " : "solid ") + (active ? T.redBorder : T.border),
                          background: active ? T.redSoft : "#fff",
                          borderRadius: 10,
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 12.5, fontWeight: active ? 600 : 500, color: pending ? T.fg4 : T.fg, lineHeight: 1.35 }}>
                            {s.label}
                          </div>
                          {s.timeLabel && (
                            <div style={{ fontSize: 11, color: T.fg4, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                              {s.timeLabel}
                            </div>
                          )}
                        </div>
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            marginTop: 3,
                            borderRadius: "50%",
                            boxSizing: "border-box",
                            flexShrink: 0,
                            background: pending ? "#fff" : active ? T.red : T.green,
                            border: "2px solid " + (pending ? T.borderStrong : active ? T.red : T.green),
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

        {current && <BlockedAlert current={current} onOpenInitiative={onOpenInitiative} initiativeLabel={initiativeLabel} />}
      </div>
    </div>
  );
}

/* ══ Visualização 2 — Timeline ════════════════════════════════════════════
   Card único: barra de topo (toggle), bloco "Agora" sempre visível e, quando
   aberto, as anteriores acima e as previstas abaixo, no mesmo card. ── */
function TimelineView({ steps, doneRows, futureRows, current, doneCount, pendingCount, order, onOpenInitiative, initiativeLabel }) {
  const [open, setOpen] = wfUseState(false);
  const previous = doneRows[doneRows.length - 1];
  const seller = current ? current.provider : "—";

  const Row = ({ s, future }) => (
    <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", minHeight: future ? 52 : 44 }}>
      <div style={{ textAlign: "right", padding: future ? "18px 16px 0 0" : "8px 16px 0 0", fontSize: 11, color: T.fg4, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
        {future ? "previsto" : s.timeLabel}
      </div>
      <div style={{ position: "relative", padding: future ? "14px 0 0 26px" : "6px 0 6px 26px", borderLeft: "2px " + (future ? "dashed " + T.border : "solid " + T.greenSpine) }}>
        <span
          style={{
            position: "absolute",
            left: -6,
            top: future ? 20 : 12,
            width: 10,
            height: 10,
            borderRadius: "50%",
            boxSizing: "border-box",
            background: future ? "#fff" : T.green,
            border: future ? "2px solid " + T.borderStrong : "none",
          }}
        />
        <div style={{ fontSize: future ? 13.5 : 13, fontWeight: 500, color: future ? T.fg4 : T.fg2 }}>{s.label}</div>
        <div style={{ fontSize: 11.5, color: future ? "#B6BBC2" : T.fg4, marginTop: 1 }}>{s.provider}</div>
      </div>
    </div>
  );

  return (
    <div style={{ border: "1px solid " + T.border, borderRadius: 16, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 24px",
          border: "none",
          borderBottom: "1px solid " + T.border,
          background: "#fff",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 256 256" fill={T.fg3} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d={ICON_CARET} />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 500, color: T.fg }}>
          {open ? "Ocultar tarefas anteriores e seguintes" : "Exibir tarefas anteriores e seguintes"}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: T.fg3, whiteSpace: "nowrap" }}>
          {doneCount} concluídas · {pendingCount} previstas
        </span>
      </button>

      {open && (
        <div style={{ padding: "16px 24px 8px", borderBottom: "1px solid " + T.border }}>
          {doneRows.map((s) => <Row key={s.label} s={s} />)}
        </div>
      )}

      {current && (
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: T.fg3 }}>Agora</span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                fontWeight: 600,
                color: T.red,
                background: T.redSoft,
                border: "1px solid " + T.redBorder,
                borderRadius: 99,
                padding: "2px 9px",
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.red }} />
              bloqueada
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <h4 style={{ margin: 0, font: "600 28px/34px " + T.font, letterSpacing: "-0.02em" }}>{current.label}</h4>
            <span style={{ fontSize: 13, color: T.fg3 }}>
              {steps.indexOf(current) + 1}ª de {steps.length} · etapa {current.stage}
            </span>
          </div>

          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: T.fg2, maxWidth: "56ch" }}>
            {current.note || "Tarefa em execução."}{" "}
            {previous && "Último evento registrado pelo seller foi o " + previous.label + ", às " + previous.timeLabel + "."}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, padding: "14px 0 0", borderTop: "1px solid " + T.border }}>
            <div>
              <div style={{ fontSize: 11, color: T.fg3 }}>Executor</div>
              <div style={{ fontSize: 13.5, fontWeight: 500, marginTop: 2 }}>{seller}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.fg3 }}>Responsável pela etapa</div>
              <div style={{ fontSize: 13.5, fontWeight: 500, marginTop: 2 }}>
                {current.stageProvider}
                {order && order.supplier ? " · " + order.supplier : " · Jadlog"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.fg3 }}>Anterior</div>
              <div style={{ fontSize: 13.5, fontWeight: 500, marginTop: 2 }}>
                {previous ? previous.label + " · " + previous.timeLabel : "—"}
              </div>
            </div>
          </div>

          <BlockedAlert current={current} onOpenInitiative={onOpenInitiative} initiativeLabel={initiativeLabel} />
        </div>
      )}

      {open && (
        <div style={{ padding: "12px 24px 20px", borderTop: "1px solid " + T.border }}>
          {futureRows.map((s) => <Row key={s.label} s={s} future />)}
        </div>
      )}
    </div>
  );
}

/* ══ Seção ════════════════════════════════════════════════════════════════ */
function WorkflowSection({ item, group, order, workflows, defaultView = "stages", onOpenInitiative, initiativeLabel }) {
  const [view, setView] = wfUseState(defaultView);

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

  return (
    <section style={{ padding: 0, border: "none", fontFamily: T.font, color: T.fg }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          marginBottom: 16,
          padding: "32px 0 0",
          borderTop: "1px solid " + T.border,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0, font: "600 1.5rem/2rem " + T.font, letterSpacing: "-0.02rem" }}>Workflow</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 2, padding: 3, background: T.bgMuted, borderRadius: 10 }}>
          <IconToggle active={view === "stages"} tip="Ver em etapas" path={ICON_KANBAN} onClick={() => setView("stages")} />
          <IconToggle active={view === "timeline"} tip="Ver em timeline" path={ICON_TIMELINE} onClick={() => setView("timeline")} />
        </div>
      </div>

      {view === "stages" ? (
        <StagesView
          steps={steps}
          doneCount={doneRows.length}
          pendingCount={futureRows.length}
          current={current}
          onOpenInitiative={onOpenInitiative}
          initiativeLabel={initiativeLabel}
        />
      ) : (
        <TimelineView
          steps={steps}
          doneRows={doneRows}
          futureRows={futureRows}
          current={current}
          doneCount={doneRows.length}
          pendingCount={futureRows.length}
          order={group}
          onOpenInitiative={onOpenInitiative}
          initiativeLabel={initiativeLabel}
        />
      )}
    </section>
  );
}

if (typeof window !== "undefined") window.WorkflowSection = WorkflowSection;
