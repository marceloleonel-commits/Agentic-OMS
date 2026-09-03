/* global React, ReactDOM, AppData */
const { useCallback } = React;

/* ── Hover tooltip (v3 port: ComposerHoverTooltip) ──────────────────────────
 * Portal-based floating tooltip (position: fixed) so it never gets clipped by
 * the sidebar's overflow. Mirrors v3 logic: show delay 140ms, leave delay
 * 360ms, placements right / top / bottom. `asChild` — clones the single child
 * to attach ref + pointer handlers (no extra wrapper that would break layout).
 */
const TOOLTIP_GAP = 8;
const TOOLTIP_GAP_RIGHT = 16;
/* Folga mínima até a borda da viewport, para que o tooltip de uma âncora
   encostada na direita abra deslocado em vez de sair da tela. */
const TOOLTIP_VIEWPORT_PAD = 8;
const TOOLTIP_SHOW_DELAY = 140;
const TOOLTIP_LEAVE_DELAY = 360;

function SidebarTooltip({ label, placement = "right", enabled = true, children }) {
  const wrapRef = React.useRef(null);
  const tipRef = React.useRef(null);
  const [coords, setCoords] = React.useState(null);
  const [shift, setShift] = React.useState(0);
  const [visible, setVisible] = React.useState(false);
  const showTimer = React.useRef(null);
  const leaveTimer = React.useRef(null);

  const computeCoords = React.useCallback(() => {
    const el = wrapRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (placement === "right") return { top: rect.top + rect.height / 2, left: rect.right + TOOLTIP_GAP_RIGHT };
    if (placement === "top")   return { top: rect.top - TOOLTIP_GAP,      left: rect.left + rect.width / 2 };
    return { top: rect.bottom + TOOLTIP_GAP, left: rect.left + rect.width / 2 };
  }, [placement]);

  const show = React.useCallback(() => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null; }
    showTimer.current = setTimeout(() => {
      setShift(0);
      setCoords(computeCoords());
      setVisible(true);
      showTimer.current = null;
    }, TOOLTIP_SHOW_DELAY);
  }, [computeCoords]);

  const hide = React.useCallback(() => {
    if (showTimer.current) { clearTimeout(showTimer.current); showTimer.current = null; }
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => { setVisible(false); leaveTimer.current = null; }, TOOLTIP_LEAVE_DELAY);
  }, []);

  React.useEffect(() => () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  }, []);

  React.useLayoutEffect(() => {
    if (!visible) return undefined;
    const onMove = () => { setShift(0); setCoords(computeCoords()); };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [visible, computeCoords]);

  /* Nas colocações centradas (top/bottom) a âncora encostada numa das bordas
     jogaria metade do tooltip fora da tela. Mede o balão já posicionado e
     desloca só o que falta para caber. */
  React.useLayoutEffect(() => {
    if (!visible || !coords || placement === "right") return;
    const el = tipRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const overflowRight = rect.right - (window.innerWidth - TOOLTIP_VIEWPORT_PAD);
    const overflowLeft = TOOLTIP_VIEWPORT_PAD - rect.left;
    const delta = overflowRight > 0 ? -overflowRight : overflowLeft > 0 ? overflowLeft : 0;
    if (delta) setShift((s) => s + delta);
  }, [visible, coords, placement, label]);

  if (!enabled || !label) return children;

  const child = React.Children.only(children);
  const cloned = React.cloneElement(child, {
    ref: wrapRef,
    onPointerEnter: (e) => { if (child.props.onPointerEnter) child.props.onPointerEnter(e); show(); },
    onPointerLeave: (e) => { if (child.props.onPointerLeave) child.props.onPointerLeave(e); hide(); },
  });

  return (
    <React.Fragment>
      {cloned}
      {visible && coords && ReactDOM.createPortal(
        <div ref={tipRef} className="sl-tooltip" data-placement={placement} style={{ position: "fixed", top: coords.top, left: coords.left + shift }} aria-hidden>
          {label}
        </div>,
        document.body
      )}
    </React.Fragment>
  );
}

/* ── v3 icons (ai-workspace-shell-template/components/icons) ── */
const SvgAssistant = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M18.2329 3.18494C19.8749 2.42991 21.5701 4.12508 20.8151 5.7671L17.9491 12L20.8151 18.2329C21.5701 19.8749 19.8749 21.5701 18.2329 20.8151L12 17.9491L5.7671 20.8151C4.12508 21.5701 2.42992 19.8749 3.18494 18.2329L6.05095 12L3.18494 5.7671C2.42992 4.12508 4.12508 2.42992 5.7671 3.18494L12 6.05095L18.2329 3.18494Z" fill="currentColor"/>
  </svg>
);
const SvgOrders = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M15.55 13C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C21.25 4.82 20.77 4 20.01 4H5.21L4.27 2H1V4H3L6.6 11.59L5.25 14.03C4.52 15.37 5.48 17 7 17H19V15H7L8.1 13H15.55ZM6.16 6H18.31L15.55 11H8.53L6.16 6ZM7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" fill="currentColor"/>
  </svg>
);
const SvgInitiative = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V16H8.56C9.25 17.19 10.53 18 12.01 18C13.49 18 14.76 17.19 15.46 16H19V19ZM19 14H14.01C14.01 15.1 13.11 16 12.01 16C10.91 16 10.01 15.1 10.01 14H5V5H19V14Z" fill="currentColor"/>
  </svg>
);
const SvgChat = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M5 17.17L6.17 16H19V6H5V17.17ZM5 4H19C20.1 4 21 4.9 21 6V16C21 17.1 20.1 18 19 18H7L4.70711 20.2929C4.07714 20.9229 3 20.4767 3 19.5858V6C3 4.9 3.9 4 5 4Z" fill="currentColor"/>
  </svg>
);
const SvgSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
  </svg>
);
const SvgNotifications = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16ZM16 17H8V11C8 8.52 9.51 6.5 12 6.5C14.49 6.5 16 8.52 16 11V17Z" fill="currentColor"/>
  </svg>
);
const SvgTasksCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M7.00026 19.9998V8.97477C7.00026 8.42477 7.20026 7.9581 7.60026 7.57477C8.00026 7.19144 8.47526 6.99977 9.02526 6.99977H20.0003C20.5503 6.99977 21.0211 7.1956 21.4128 7.58727C21.8044 7.97894 22.0003 8.44977 22.0003 8.99977V16.9998L17.0003 21.9998H9.00026C8.45026 21.9998 7.97942 21.8039 7.58776 21.4123C7.19609 21.0206 7.00026 20.5498 7.00026 19.9998ZM2.02526 6.24977C1.92526 5.69977 2.03359 5.20394 2.35026 4.76227C2.66692 4.3206 3.10026 4.04977 3.65026 3.94977L14.5003 2.02477C15.0503 1.92477 15.5461 2.0331 15.9878 2.34977C16.4294 2.66644 16.7003 3.09977 16.8003 3.64977L17.0503 4.99977H15.0003L14.8253 3.99977L4.00026 5.92477L5.00026 11.5748V18.5498C4.73359 18.3998 4.50442 18.1998 4.31276 17.9498C4.12109 17.6998 4.00026 17.4164 3.95026 17.0998L2.02526 6.24977ZM9.00026 8.99977V19.9998H16.0003V15.9998H20.0003V8.99977H9.00026Z" fill="currentColor"/>
  </svg>
);
const SvgChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="currentColor"/>
  </svg>
);

const NAV_ITEMS = [
  { id: "assistant",   Icon: SvgAssistant,   label: "My Assistant"    },
  { id: "tasks",       Icon: SvgTasksCheck,  label: "Minhas Tarefas"  },
  { id: "orders",      Icon: SvgOrders,      label: "Orders"          },
  { id: "initiatives", Icon: SvgInitiative,  label: "My Initiatives"  },
  { id: "chats",       Icon: SvgChat,        label: "Chats"           },
];

/* v3 icon: My AI Team (apps grid) */
const SvgAITeam = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" fill="currentColor"/>
  </svg>
);

function isInteractiveEl(el) {
  return !!el.closest('button, a, [role="button"], input, select, textarea');
}

function Sidebar({ route, setRoute, conversations, openConversation, activeConvId, collapsed, setCollapsed, onOpenAITeam }) {
  /* Click anywhere on the collapsed rail expands it (non-interactive area only) */
  const handleSidebarClick = useCallback((e) => {
    if (!collapsed) return;
    if (!isInteractiveEl(e.target)) setCollapsed(false);
  }, [collapsed, setCollapsed]);

  return (
    <aside
      data-sl-sidebar=""
      data-collapsed={collapsed ? "true" : "false"}
      onClick={handleSidebarClick}
    >
      {/* ── Header: store avatar + name + collapse button ── */}
      <div data-sl-sidebar-header="">
        <SidebarTooltip label="Demo Store" placement="right" enabled={collapsed}>
          <button
            data-sl-sidebar-item=""
            data-sl-sidebar-logo=""
            aria-label="Demo Store"
            style={{ cursor: "default", flex: 1 }}
          >
            <span data-sl-sidebar-icon="">
              <span data-sl-avatar="" data-sl-sidebar-store-avatar="" style={{
                backgroundImage: `url(${AppData.AVATARS.store})`,
                backgroundSize: "cover", backgroundPosition: "center",
              }} />
            </span>
            <div data-sl-sidebar-section-inner="">
              <span data-sl-sidebar-section-label="" style={{ fontWeight: 600, fontSize: 14 }}>Demo Store</span>
            </div>
          </button>
        </SidebarTooltip>

        {/* Hidden when collapsed via CSS */}
        <button
          data-sl-sidebar-collapse-button=""
          onClick={() => setCollapsed(true)}
          title="Recolher"
        >
          <SvgChevronLeft />
        </button>
      </div>

      {/* ── Nav sections ── */}
      <div data-sl-sidebar-content="">
        {NAV_ITEMS.map(item => {
          const isActive = route.name === item.id;
          return (
            <div
              key={item.id}
              data-sl-sidebar-section=""
              data-active={isActive ? "true" : undefined}
            >
              <div data-sl-sidebar-section-header="">
                <div data-sl-sidebar-section-header-main="">
                  <SidebarTooltip label={item.label} placement="right" enabled={collapsed}>
                    <button
                      data-sl-sidebar-section-header-link=""
                      aria-label={item.label}
                      onClick={() => setRoute({ name: item.id })}
                    >
                      <span data-sl-sidebar-icon="">
                        <item.Icon />
                      </span>
                      <div data-sl-sidebar-section-inner="">
                        <span data-sl-sidebar-section-label="">{item.label}</span>
                      </div>
                    </button>
                  </SidebarTooltip>
                </div>
              </div>
            </div>
          );
        })}

        {/* Recent chats (Chats route sub-items) */}
        {route.name === "chats" && conversations && conversations.length > 0 && (
          <div data-sl-sidebar-section-content="" style={{ marginTop: 4 }}>
            {conversations.slice(0, 8).map(c => (
              <button
                key={c.id}
                data-sl-sidebar-item=""
                data-selected={activeConvId === c.id ? "true" : undefined}
                onClick={() => openConversation(c.id)}
              >
                <span data-sl-sidebar-label="">
                  <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", minWidth: 0 }}>{c.title}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div data-sl-sidebar-footer="">
        <SidebarTooltip label="My AI Team" placement={collapsed ? "right" : "top"}>
          <button
            data-sl-sidebar-item=""
            aria-label="My AI Team"
            onClick={() => onOpenAITeam && onOpenAITeam()}
          >
            <span data-sl-sidebar-icon=""><SvgAITeam /></span>
            <div data-sl-sidebar-section-inner=""><span data-sl-sidebar-section-label="">My AI Team</span></div>
          </button>
        </SidebarTooltip>

        <SidebarTooltip label="Buscar" placement={collapsed ? "right" : "top"}>
          <button data-sl-sidebar-item="" aria-label="Buscar" onClick={() => {}}>
            <span data-sl-sidebar-icon=""><SvgSearch /></span>
            <div data-sl-sidebar-section-inner=""><span data-sl-sidebar-section-label="">Buscar</span></div>
          </button>
        </SidebarTooltip>

        <SidebarTooltip label="Notificações" placement={collapsed ? "right" : "top"}>
          <button data-sl-sidebar-item="" aria-label="Notificações" style={{ position: "relative" }} onClick={() => {}}>
            <span data-sl-sidebar-icon="" style={{ position: "relative" }}>
              <SvgNotifications />
              <span data-sl-sidebar-badge="" style={{
                position: "absolute", top: 4, right: 4,
                width: 14, height: 14, borderRadius: "50%",
                background: "#EF4444", color: "#fff",
                fontSize: 8, fontWeight: 700,
                display: "grid", placeItems: "center",
                pointerEvents: "none",
              }}>3</span>
            </span>
            <div data-sl-sidebar-section-inner=""><span data-sl-sidebar-section-label="">Notificações</span></div>
          </button>
        </SidebarTooltip>

        <SidebarTooltip label="Minha Conta" placement={collapsed ? "right" : "top"}>
          <button data-sl-sidebar-item="" data-sl-app-sidebar-profile-item="" aria-label="Minha Conta">
            <span data-sl-sidebar-icon="">
              <span data-sl-avatar="" style={{
                width: 28, height: 28, borderRadius: "50%",
                display: "block",
                backgroundImage: `url(${AppData.AVATARS.you})`,
                backgroundSize: "cover", backgroundPosition: "center",
                border: "none",
              }} />
            </span>
            <div data-sl-sidebar-section-inner=""><span data-sl-sidebar-section-label="">Minha Conta</span></div>
          </button>
        </SidebarTooltip>
      </div>
    </aside>
  );
}

window.Sidebar = Sidebar;
