/* global React */
const {
  useState: rsUseState,
  useRef: rsUseRef,
  useEffect: rsUseEffect,
  useLayoutEffect: rsUseLayoutEffect,
} = React;

/* Deve acompanhar a duração de chat-panel-slide-in em aiw-extra.css. */
const CHAT_ENTER_MS = 320;
const RESIZER_W = 6;

/**
 * Resizable split layout — chat on left, canvas on right, drag handle in middle.
 * Children: [chat, canvas]
 *
 * Três modos (handoff-topbar-canvas §8) — nunca existe tela sem chat e sem
 * canvas:
 *   both    chat + resizer + canvas, chat em `initialWidth`      (padrão)
 *   canvas  `chatOpen=false`   — só o canvas, largura total
 *   chat    `canvasOpen=false` — só o chat, largura total
 */
function ResizableSplit({ children, initialWidth = 460, min = 320, max = 900, screenLabel, chatOpen = true, canvasOpen = true }) {
  const [chat, canvas] = React.Children.toArray(children);
  const [w, setW] = rsUseState(initialWidth);
  const dragRef = rsUseRef(false);
  const rootRef = rsUseRef(null);

  /* Fechar o canvas nunca deixa a tela vazia: o chat assume a largura toda,
     mesmo que `chatOpen` esteja em false. */
  const showChat = chatOpen || !canvasOpen;
  const split = showChat && canvasOpen;

  /* Slide-in a cada ativação do chat — só na transição fechado → aberto, para
     a tela que já nasce com o chat em cena não repetir a animação. Só no modo
     `both`: em largura total o painel não vem da borda, ele já é a tela.
     Precisa ser layout effect: num efeito comum a classe só chegaria depois da
     pintura, e o painel apareceria já posicionado antes de recuar para animar. */
  const wasChatOpenRef = rsUseRef(showChat);
  const [chatEntering, setChatEntering] = rsUseState(false);

  rsUseLayoutEffect(() => {
    const wasOpen = wasChatOpenRef.current;
    wasChatOpenRef.current = showChat;
    if (!showChat || wasOpen || !split) return;
    setChatEntering(true);
    const timer = setTimeout(() => setChatEntering(false), CHAT_ENTER_MS);
    return () => clearTimeout(timer);
  }, [showChat, split]);

  rsUseEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current || !rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const next = Math.max(min, Math.min(max, e.clientX - rect.left));
      setW(next);
    };
    const onUp = () => {
      if (!dragRef.current) return;
      dragRef.current = false;
      document.body.classList.remove("resizing-x");
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [min, max]);

  return (
    <div
      ref={rootRef}
      className={`main split-main resizable-split${showChat ? "" : " resizable-split--chat-closed"}${canvasOpen ? "" : " resizable-split--canvas-closed"}${chatEntering ? " resizable-split--chat-entering" : ""}`}
      style={{
        gridTemplateColumns: split ? `${w}px ${RESIZER_W}px 1fr` : "1fr",
        /* Distância do slide: painel e resizer partem juntos de fora da borda
           esquerda, mantendo a posição relativa durante todo o percurso. */
        "--chat-enter-x": `-${w + RESIZER_W}px`,
      }}
      data-screen-label={screenLabel}
    >
      {showChat && chat}
      {split && (
        <div
          className="split-resizer"
          onMouseDown={(e) => {
            e.preventDefault();
            dragRef.current = true;
            document.body.classList.add("resizing-x");
          }}
          title="Arraste para redimensionar"
        >
          <span className="split-resizer-grip" />
        </div>
      )}
      {canvasOpen && canvas}
    </div>
  );
}

window.ResizableSplit = ResizableSplit;
