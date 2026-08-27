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
 * `chatOpen` (default true) — when false, the chat column and resizer are not
 * rendered and the canvas takes the full width. Lets a screen open with just
 * the canvas ("iniciativa") and reveal the chat only when the user activates it.
 */
function ResizableSplit({ children, initialWidth = 460, min = 320, max = 900, screenLabel, chatOpen = true }) {
  const [chat, canvas] = React.Children.toArray(children);
  const [w, setW] = rsUseState(initialWidth);
  const dragRef = rsUseRef(false);
  const rootRef = rsUseRef(null);

  /* Slide-in a cada ativação do chat — só na transição fechado → aberto, para
     a tela que já nasce com o chat em cena não repetir a animação.
     Precisa ser layout effect: num efeito comum a classe só chegaria depois da
     pintura, e o painel apareceria já posicionado antes de recuar para animar. */
  const wasChatOpenRef = rsUseRef(chatOpen);
  const [chatEntering, setChatEntering] = rsUseState(false);

  rsUseLayoutEffect(() => {
    const wasOpen = wasChatOpenRef.current;
    wasChatOpenRef.current = chatOpen;
    if (!chatOpen || wasOpen) return;
    setChatEntering(true);
    const timer = setTimeout(() => setChatEntering(false), CHAT_ENTER_MS);
    return () => clearTimeout(timer);
  }, [chatOpen]);

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
      className={`main split-main resizable-split${chatOpen ? "" : " resizable-split--chat-closed"}${chatEntering ? " resizable-split--chat-entering" : ""}`}
      style={{
        gridTemplateColumns: chatOpen ? `${w}px ${RESIZER_W}px 1fr` : "1fr",
        /* Distância do slide: painel e resizer partem juntos de fora da borda
           esquerda, mantendo a posição relativa durante todo o percurso. */
        "--chat-enter-x": `-${w + RESIZER_W}px`,
      }}
      data-screen-label={screenLabel}
    >
      {chatOpen && chat}
      {chatOpen && (
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
      {canvas}
    </div>
  );
}

window.ResizableSplit = ResizableSplit;
