/* global React */
const { useState: rsUseState, useRef: rsUseRef, useEffect: rsUseEffect } = React;

/**
 * Resizable split layout — chat on left, canvas on right, drag handle in middle.
 * Children: [chat, canvas]
 */
function ResizableSplit({ children, initialWidth = 460, min = 320, max = 900, screenLabel }) {
  const [chat, canvas] = React.Children.toArray(children);
  const [w, setW] = rsUseState(initialWidth);
  const dragRef = rsUseRef(false);
  const rootRef = rsUseRef(null);

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
      className="main split-main resizable-split"
      style={{ gridTemplateColumns: `${w}px 6px 1fr` }}
      data-screen-label={screenLabel}
    >
      {chat}
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
      {canvas}
    </div>
  );
}

window.ResizableSplit = ResizableSplit;
