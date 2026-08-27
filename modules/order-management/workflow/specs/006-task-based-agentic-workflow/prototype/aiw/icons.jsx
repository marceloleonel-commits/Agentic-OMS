/* global React */
const { useState, useMemo, useRef, useEffect } = React;

/* ---------- Inline icons ---------- */
const Icon = ({ name, size = 16, ...rest }) => {
  const s = size;
  const common = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", ...rest };
  switch (name) {
    case "vtex":
      return (<svg {...common}><path d="M3 6h18l-3 6 3 6H6L3 12l3-6z"/></svg>);
    case "assistant":
      return (<svg {...common}><path d="M5 5l4 4M19 5l-4 4M5 19l4-4M19 19l-4-4M12 7v10M7 12h10"/></svg>);
    case "initiatives":
      return (<svg {...common}><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18M8 14h6"/></svg>);
    case "chat":
      return (<svg {...common}><path d="M4 5h16v11H8l-4 4V5z"/></svg>);
    case "chat-circle":
      return (<svg {...common}><path d="M12 3C7.03 3 3 6.58 3 11c0 2.18.81 4.17 2.14 5.72L4 21l4.55-1.49A9.27 9.27 0 0 0 12 20c4.97 0 9-3.58 9-9s-4.03-8-9-8z"/></svg>);
    /* Material Symbols "quiz" — balão de conversa com interrogação. */
    case "quiz":
      return (<svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg" {...rest}><path d="M7.93333 11.3333C8.16667 11.3333 8.36389 11.2528 8.525 11.0917C8.68611 10.9306 8.76667 10.7333 8.76667 10.5C8.76667 10.2667 8.68611 10.0694 8.525 9.90833C8.36389 9.74722 8.16667 9.66667 7.93333 9.66667C7.7 9.66667 7.50278 9.74722 7.34167 9.90833C7.18056 10.0694 7.1 10.2667 7.1 10.5C7.1 10.7333 7.18056 10.9306 7.34167 11.0917C7.50278 11.2528 7.7 11.3333 7.93333 11.3333ZM7.33333 8.76667H8.56667C8.56667 8.57778 8.575 8.41667 8.59167 8.28333C8.60833 8.15 8.64444 8.02222 8.7 7.9C8.75556 7.77778 8.825 7.66389 8.90833 7.55833C8.99167 7.45278 9.11111 7.32222 9.26667 7.16667C9.65556 6.77778 9.93056 6.45278 10.0917 6.19167C10.2528 5.93056 10.3333 5.63333 10.3333 5.3C10.3333 4.71111 10.1333 4.23611 9.73333 3.875C9.33333 3.51389 8.79444 3.33333 8.11667 3.33333C7.50556 3.33333 6.98611 3.48333 6.55833 3.78333C6.13056 4.08333 5.83333 4.5 5.66667 5.03333L6.76667 5.46667C6.84444 5.16667 7 4.925 7.23333 4.74167C7.46667 4.55833 7.73889 4.46667 8.05 4.46667C8.35 4.46667 8.6 4.54722 8.8 4.70833C9 4.86944 9.1 5.08333 9.1 5.35C9.1 5.53889 9.03889 5.73889 8.91667 5.95C8.79444 6.16111 8.58889 6.39444 8.3 6.65C8.11111 6.80556 7.95833 6.95833 7.84167 7.10833C7.725 7.25833 7.62778 7.41667 7.55 7.58333C7.47222 7.75 7.41667 7.925 7.38333 8.10833C7.35 8.29167 7.33333 8.51111 7.33333 8.76667ZM8 15.3333L6 13.3333H3.33333C2.96667 13.3333 2.65278 13.2028 2.39167 12.9417C2.13056 12.6806 2 12.3667 2 12V2.66667C2 2.3 2.13056 1.98611 2.39167 1.725C2.65278 1.46389 2.96667 1.33333 3.33333 1.33333H12.6667C13.0333 1.33333 13.3472 1.46389 13.6083 1.725C13.8694 1.98611 14 2.3 14 2.66667V12C14 12.3667 13.8694 12.6806 13.6083 12.9417C13.3472 13.2028 13.0333 13.3333 12.6667 13.3333H10L8 15.3333ZM3.33333 12H6.53333L8 13.4667L9.46667 12H12.6667V2.66667H3.33333V12Z"/></svg>);
    /* Ícone do alerta de pergunta pendente (Figma 1582:4675) — dois quadros
       sobrepostos com interrogação. */
    case "quiz-stacked":
      return (<svg width={s} height={s} viewBox="0 0 20 20" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg" {...rest}><path d="M12.2812 12.2396C12.4549 12.066 12.5417 11.8611 12.5417 11.625C12.5417 11.3889 12.4549 11.184 12.2812 11.0104C12.1076 10.8368 11.9028 10.75 11.6667 10.75C11.4306 10.75 11.2257 10.8368 11.0521 11.0104C10.8785 11.184 10.7917 11.3889 10.7917 11.625C10.7917 11.8611 10.8785 12.066 11.0521 12.2396C11.2257 12.4132 11.4306 12.5 11.6667 12.5C11.9028 12.5 12.1076 12.4132 12.2812 12.2396ZM11.0417 9.83333H12.2917C12.2917 9.43055 12.3333 9.13542 12.4167 8.94792C12.5 8.76042 12.6944 8.51389 13 8.20833C13.4167 7.79167 13.6944 7.45486 13.8333 7.19792C13.9722 6.94097 14.0417 6.63889 14.0417 6.29167C14.0417 5.66667 13.8229 5.15625 13.3854 4.76042C12.9479 4.36458 12.375 4.16667 11.6667 4.16667C11.0972 4.16667 10.6007 4.32639 10.1771 4.64583C9.75347 4.96528 9.45833 5.38889 9.29167 5.91667L10.4167 6.375C10.5417 6.02778 10.7118 5.76736 10.9271 5.59375C11.1424 5.42014 11.3889 5.33333 11.6667 5.33333C12 5.33333 12.2708 5.42708 12.4792 5.61458C12.6875 5.80208 12.7917 6.05556 12.7917 6.375C12.7917 6.56944 12.7361 6.75347 12.625 6.92708C12.5139 7.10069 12.3194 7.31944 12.0417 7.58333C11.5833 7.98611 11.3021 8.30208 11.1979 8.53125C11.0937 8.76042 11.0417 9.19444 11.0417 9.83333ZM6.66667 15C6.20833 15 5.81597 14.8368 5.48958 14.5104C5.16319 14.184 5 13.7917 5 13.3333V3.33333C5 2.875 5.16319 2.48264 5.48958 2.15625C5.81597 1.82986 6.20833 1.66667 6.66667 1.66667H16.6667C17.125 1.66667 17.5174 1.82986 17.8437 2.15625C18.1701 2.48264 18.3333 2.875 18.3333 3.33333V13.3333C18.3333 13.7917 18.1701 14.184 17.8437 14.5104C17.5174 14.8368 17.125 15 16.6667 15H6.66667ZM6.66667 13.3333H16.6667V3.33333H6.66667V13.3333ZM3.33333 18.3333C2.875 18.3333 2.48264 18.1701 2.15625 17.8437C1.82986 17.5174 1.66667 17.125 1.66667 16.6667V5H3.33333V16.6667H15V18.3333H3.33333Z"/></svg>);
    /* Material Symbols — busca sobre um conjunto de itens (seleção manual). */
    case "select-search":
      return (<svg width={s} height={s} viewBox="0 -960 960 960" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg" {...rest}><path d="M861-48 740.62-167q-17.62 11-37.96 17t-42.17 6Q595-144 549.5-189.5T504-300q0-65 45.5-110.5T660-456q65 0 110.5 45.5T816-299.74q0 22.74-6.5 43.74-6.5 21-17.5 39L912-99l-51 51Zm-633-96q-65 0-110.5-45.5T72-300q0-65 45.5-110.5T228-456q65 0 110.5 45.5T384-300q0 65-45.5 110.5T228-144Zm.25-72q34.75 0 59.25-24.75t24.5-59.5q0-34.75-24.75-59.25t-59.5-24.5q-34.75 0-59.25 24.75t-24.5 59.5q0 34.75 24.75 59.25t59.5 24.5Zm432 0q34.75 0 59.25-24.75t24.5-59.5q0-34.75-24.75-59.25t-59.5-24.5q-34.75 0-59.25 24.75t-24.5 59.5q0 34.75 24.75 59.25t59.5 24.5ZM228-576q-65 0-110.5-45.5T72-732q0-65 45.5-110.5T228-888q65 0 110.5 45.5T384-732q0 65-45.5 110.5T228-576Zm432 0q-65 0-110.5-45.5T504-732q0-65 45.5-110.5T660-888q65 0 110.5 45.5T816-732q0 65-45.5 110.5T660-576Zm-431.75-72q34.75 0 59.25-24.75t24.5-59.5q0-34.75-24.75-59.25t-59.5-24.5q-34.75 0-59.25 24.75t-24.5 59.5q0 34.75 24.75 59.25t59.5 24.5Zm432 0q34.75 0 59.25-24.75t24.5-59.5q0-34.75-24.75-59.25t-59.5-24.5q-34.75 0-59.25 24.75t-24.5 59.5q0 34.75 24.75 59.25t59.5 24.5ZM228-300Zm0-432Zm432 0Z"/></svg>);
    /* Material Symbols "attach_file" — clipe para anexo de comprovante. */
    case "attach":
      return (<svg width={s} height={s} viewBox="0 -960 960 960" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg" {...rest}><path d="M696-312q0 89.86-63.07 152.93Q569.86-96 480-96q-91 0-153.5-65.5T264-319v-389q0-65 45.5-110.5T420-864q66 0 111 48t45 115v365q0 40.15-27.93 68.07Q520.15-240 480-240q-41 0-68.5-29.09T384-340v-380h72v384q0 10.4 6.8 17.2 6.8 6.8 17.2 6.8 10.4 0 17.2-6.8 6.8-6.8 6.8-17.2v-372q0-35-24.5-59.5T419.8-792q-35.19 0-59.5 25.5Q336-741 336-706v394q0 60 42 101.5T480-168q60 1 102-43t42-106v-403h72v408Z"/></svg>);
    case "chevron-left":
      return (<svg {...common}><path d="M15 6l-6 6 6 6"/></svg>);
    case "chevron-right":
      return (<svg {...common}><path d="M9 6l6 6-6 6"/></svg>);
    case "chevron-down":
      return (<svg {...common}><path d="M6 9l6 6 6-6"/></svg>);
    case "arrow-left":
      return (<svg {...common}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>);
    case "arrow-left":
      return (<svg {...common}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>);
    case "settings":
      return (<svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.3l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>);
    case "grid":
      return (<svg {...common}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>);
    case "search":
      return (<svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>);
    case "bell":
      return (<svg {...common}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>);
    case "x":
      return (<svg {...common}><path d="M6 6l12 12M18 6l-6 6-6 6"/></svg>);
    case "plus":
      return (<svg {...common}><path d="M12 5v14M5 12h14"/></svg>);
    case "history":
      return (<svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/></svg>);
    case "more":
      return (<svg {...common}><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>);
    case "send":
      return (<svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>);
    case "arrow-up":
      return (<svg {...common}><path d="M12 19V5M5 12l7-7 7 7"/></svg>);
    case "play":
      return (<svg {...common}><path d="M7 5v14l12-7z" fill="currentColor"/></svg>);
    case "check":
      return (<svg {...common}><path d="M5 12l5 5L20 7"/></svg>);
    case "list":
      return (<svg {...common}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>);
    case "board":
      return (<svg {...common}><rect x="4" y="4" width="6" height="16" rx="1"/><rect x="14" y="4" width="6" height="10" rx="1"/></svg>);
    case "arrow-up-right":
      return (<svg {...common}><path d="M7 17 17 7M9 7h8v8"/></svg>);
    case "sparkle":
      return (<svg {...common} viewBox="0 0 24 24"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" fill="currentColor" stroke="none"/><path d="M19 15l.7 1.8L21.5 17l-1.8.7L19 19.5l-.7-1.8L16.5 17l1.8-.7L19 15z" fill="currentColor" stroke="none"/></svg>);
    case "doc":
      return (<svg {...common}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>);
    case "at":
      return (<svg {...common}><circle cx="12" cy="12" r="4"/><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.6 7.2"/></svg>);
    case "user":
      return (<svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"/></svg>);
    case "alert-triangle":
      return (<svg {...common}><path d="M12 3l9 16H3l9-16z"/><path d="M12 10v4M12 17h.01"/></svg>);
    case "edit":
      return (<svg {...common}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>);
    case "graph":
      return (<svg {...common}><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></svg>);
    case "clock":
      return (<svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
    case "loader":
      return (<svg {...common} className="spin"><path d="M21 12a9 9 0 1 1-9-9"/></svg>);
    case "cart":
      return (<svg {...common}><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.5L21 8H6"/></svg>);
    case "link":
      return (<svg width={s} height={s} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}><path d="M3.24996 9.99999C3.24996 8.57499 4.40829 7.41666 5.83329 7.41666H9.16663V5.83333H5.83329C3.53329 5.83333 1.66663 7.69999 1.66663 9.99999C1.66663 12.3 3.53329 14.1667 5.83329 14.1667H9.16663V12.5833H5.83329C4.40829 12.5833 3.24996 11.425 3.24996 9.99999ZM6.66663 10.8333H13.3333V9.16666H6.66663V10.8333ZM14.1666 5.83333H10.8333V7.41666H14.1666C15.5916 7.41666 16.75 8.57499 16.75 9.99999C16.75 11.425 15.5916 12.5833 14.1666 12.5833H10.8333V14.1667H14.1666C16.4666 14.1667 18.3333 12.3 18.3333 9.99999C18.3333 7.69999 16.4666 5.83333 14.1666 5.83333Z" fill="currentColor"/></svg>);
    case "link-off":
      return (<svg width={s} height={s} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}><path d="M11.9916 9.16667L13.3333 10.5083V9.16667H11.9916ZM14.1666 5.83333H10.8333V7.41666H14.1666C15.5916 7.41666 16.75 8.575 16.75 10C16.75 11.0583 16.1083 11.975 15.1916 12.3667L16.3583 13.5333C17.5416 12.8 18.3333 11.4917 18.3333 10C18.3333 7.7 16.4666 5.83333 14.1666 5.83333ZM1.66663 3.55833L4.25829 6.15C2.74163 6.76667 1.66663 8.25833 1.66663 10C1.66663 12.3 3.53329 14.1667 5.83329 14.1667H9.16663V12.5833H5.83329C4.40829 12.5833 3.24996 11.425 3.24996 10C3.24996 8.675 4.25829 7.58333 5.54996 7.44167L7.27496 9.16667H6.66663V10.8333H8.94163L10.8333 12.725V14.1667H12.275L15.6166 17.5083L16.7916 16.3333L2.84163 2.38333L1.66663 3.55833Z" fill="currentColor"/></svg>);
    case "layers":
      return (<svg {...common}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>);
    case "arrow-counter-clockwise":
      return (<svg {...common}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>);
    /* ── Material Symbols exportados do Figma (cards de ticket de devolução).
       Mesma família do "undo" abaixo: path do export, cor herdada. ── */
    case "image":
      return (<svg width={s} height={s} viewBox="0 0 20 20" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg" {...rest}><path d="M4.75646 16.5833C4.38132 16.5833 4.06424 16.4514 3.80521 16.1875C3.54618 15.9236 3.41667 15.609 3.41667 15.2435V4.75646C3.41667 4.39104 3.54618 4.07639 3.80521 3.8125C4.06424 3.54861 4.38132 3.41667 4.75646 3.41667H15.2435C15.6187 3.41667 15.9358 3.54861 16.1948 3.8125C16.4538 4.07639 16.5833 4.39104 16.5833 4.75646V15.2435C16.5833 15.609 16.4538 15.9236 16.1948 16.1875C15.9358 16.4514 15.6187 16.5833 15.2435 16.5833H4.75646ZM4.75646 15.5H15.2435C15.3077 15.5 15.3665 15.4733 15.4198 15.4198C15.4733 15.3665 15.5 15.3077 15.5 15.2435V4.75646C15.5 4.69229 15.4733 4.63354 15.4198 4.58021C15.3665 4.52674 15.3077 4.5 15.2435 4.5H4.75646C4.69229 4.5 4.63354 4.52674 4.58021 4.58021C4.52674 4.63354 4.5 4.69229 4.5 4.75646V15.2435C4.5 15.3077 4.52674 15.3665 4.58021 15.4198C4.63354 15.4733 4.69229 15.5 4.75646 15.5ZM6.125 13.7917H13.939L11.3237 10.3046L9.23396 13.016L7.94229 11.3846L6.125 13.7917Z"/></svg>);
    case "check-circle":
      return (<svg width={s} height={s} viewBox="0 0 20 20" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg" {...rest}><path d="M8.92146 12.7115L13.6073 8.04646L12.8333 7.2725L8.92146 11.1635L7.15063 9.41354L6.37667 10.1875L8.92146 12.7115ZM10.0015 17.5833C8.96201 17.5833 7.98139 17.386 7.05958 16.9913C6.13778 16.5965 5.33097 16.0534 4.63917 15.3619C3.94736 14.6703 3.40396 13.8639 3.00896 12.9425C2.6141 12.0211 2.41667 11.0408 2.41667 10.0015C2.41667 8.94813 2.61403 7.96403 3.00875 7.04917C3.40347 6.13431 3.9466 5.33097 4.63813 4.63917C5.32965 3.94736 6.13611 3.40396 7.0575 3.00896C7.97889 2.6141 8.95924 2.41667 9.99854 2.41667C11.0519 2.41667 12.036 2.61403 12.9508 3.00875C13.8657 3.40347 14.669 3.9466 15.3608 4.63813C16.0526 5.32965 16.596 6.13264 16.991 7.04708C17.3859 7.96153 17.5833 8.94535 17.5833 9.99854C17.5833 11.038 17.386 12.0186 16.9913 12.9404C16.5965 13.8622 16.0534 14.669 15.3619 15.3608C14.6703 16.0526 13.8674 16.596 12.9529 16.991C12.0385 17.3859 11.0547 17.5833 10.0015 17.5833ZM10 16.5C11.8056 16.5 13.3403 15.8681 14.6042 14.6042C15.8681 13.3403 16.5 11.8056 16.5 10C16.5 8.19444 15.8681 6.65972 14.6042 5.39583C13.3403 4.13194 11.8056 3.5 10 3.5C8.19444 3.5 6.65972 4.13194 5.39583 5.39583C4.13194 6.65972 3.5 8.19444 3.5 10C3.5 11.8056 4.13194 13.3403 5.39583 14.6042C6.65972 15.8681 8.19444 16.5 10 16.5Z"/></svg>);
    case "x-circle":
      return (<svg width={s} height={s} viewBox="0 0 20 20" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg" {...rest}><path d="M7.0625 13.7115L10 10.774L12.9375 13.7115L13.7115 12.9375L10.774 10L13.7115 7.0625L12.9375 6.28854L10 9.22604L7.0625 6.28854L6.28854 7.0625L9.22604 10L6.28854 12.9375L7.0625 13.7115ZM10.0015 17.5833C8.96201 17.5833 7.98139 17.386 7.05958 16.9913C6.13778 16.5965 5.33097 16.0534 4.63917 15.3619C3.94736 14.6703 3.40396 13.8639 3.00896 12.9425C2.6141 12.0211 2.41667 11.0408 2.41667 10.0015C2.41667 8.94813 2.61403 7.96403 3.00875 7.04917C3.40347 6.13431 3.9466 5.33097 4.63813 4.63917C5.32965 3.94736 6.13611 3.40396 7.0575 3.00896C7.97889 2.6141 8.95924 2.41667 9.99854 2.41667C11.0519 2.41667 12.036 2.61403 12.9508 3.00875C13.8657 3.40347 14.669 3.9466 15.3608 4.63813C16.0526 5.32965 16.596 6.13264 16.991 7.04708C17.3859 7.96153 17.5833 8.94535 17.5833 9.99854C17.5833 11.038 17.386 12.0186 16.9913 12.9404C16.5965 13.8622 16.0534 14.669 15.3619 15.3608C14.6703 16.0526 13.8674 16.596 12.9529 16.991C12.0385 17.3859 11.0547 17.5833 10.0015 17.5833ZM10 16.5C11.8056 16.5 13.3403 15.8681 14.6042 14.6042C15.8681 13.3403 16.5 11.8056 16.5 10C16.5 8.19444 15.8681 6.65972 14.6042 5.39583C13.3403 4.13194 11.8056 3.5 10 3.5C8.19444 3.5 6.65972 4.13194 5.39583 5.39583C4.13194 6.65972 3.5 8.19444 3.5 10C3.5 11.8056 4.13194 13.3403 5.39583 14.6042C6.65972 15.8681 8.19444 16.5 10 16.5Z"/></svg>);
    case "escalate":
      return (<svg width={s} height={s} viewBox="0 0 20 20" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg" {...rest}><path d="M7.69229 16.5833V13.5913H4.41667L10 7.21646L15.5833 13.5913H12.3077V16.5833H7.69229ZM8.77563 15.5079H11.2244V12.5079H13.2227L10 8.88292L6.77729 12.5079H8.77563V15.5079ZM4.41667 9.69542L10 3.32063L15.5833 9.69542H14.149L10 4.97917L5.85104 9.69542H4.41667Z"/></svg>);
    /* Material Symbols "undo" (FILL0, wght300) — traço fino, não a versão sólida. */
    case "undo":
      return (<svg width={s} height={s} viewBox="0 -960 960 960" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg" {...rest}><path d="M285-235q-8 0-14-6t-6-14.5q0-8.5 6-14.5t14-6h283q65 0 111-42t46-102q0-60-46-102t-111-42H301l114 114q6 6 6 14t-6 14q-6 6-14 6t-14-6L246-568q-9-9-9-21t9-21l141-141q6-6 14-6t14 6q6 6 6 14t-6 14L301-609h283q83 0 141 54.5T783-420q0 77-58 131t-141 54H285Z"/></svg>);
    /* ── Material Symbols usados nos cards de ticket v2 (design_handoff_tickets_abertos).
       Mesma família dos casos acima: viewBox 0 -960 960 960, wght300, cor herdada. ── */
    case "verified":
      return (<svg width={s} height={s} viewBox="0 -960 960 960" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg" {...rest}><path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm94-278 226-226-56-58-170 170-86-84-56 56 142 142Z"/></svg>);
    case "gavel":
      return (<svg width={s} height={s} viewBox="0 -960 960 960" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg" {...rest}><path d="M160-120v-80h480v80H160Zm226-194L160-540l84-86 228 226-86 86Zm254-254L414-796l86-84 226 226-86 86Zm184 408L302-644l56-56 522 522-56 56Z"/></svg>);
    case "supervisor-account":
      return (<svg width={s} height={s} viewBox="0 -960 960 960" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg" {...rest}><path d="M40-160v-112q0-33 17-62t47-44q51-26 115-44t141-18h14q6 0 12 2-8 18-13.5 37.5T364-360h-4q-71 0-127.5 18T140-306q-9 5-14.5 14t-5.5 20v32h252q6 21 16 41.5t22 38.5H40Zm540 40-12-60q-12-5-22.5-10.5T524-204l-58 18-40-68 46-40q-2-14-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T568-460l12-60h80l12 60q12 5 22.5 11t21.5 15l58-20 40 70-46 40q2 12 2 25t-2 25l46 40-40 68-58-18q-11 8-21.5 13.5T672-180l-12 60h-80Zm40-120q33 0 56.5-23.5T700-320q0-33-23.5-56.5T620-400q-33 0-56.5 23.5T540-320q0 33 23.5 56.5T620-240ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0-80Zm12 400Z"/></svg>);
    case "info":
      return (<svg width={s} height={s} viewBox="0 -960 960 960" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg" {...rest}><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>);
    case "photo-library":
      return (<svg width={s} height={s} viewBox="0 -960 960 960" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg" {...rest}><path d="M360-360h480L678-580 558-420l-90-120-108 180Zm-80 160q-33 0-56.5-23.5T200-280v-560q0-33 23.5-56.5T280-920h560q33 0 56.5 23.5T920-840v560q0 33-23.5 56.5T840-200H280Zm0-80h560v-560H280v560ZM120-40q-33 0-56.5-23.5T40-120v-600h80v600h600v80H120Zm160-800v560-560Z"/></svg>);
    default:
      return null;
  }
};

/* ── Extra icons used by view-workflow-board.jsx (PR #67) ──────────────── */
const IconSparkleFill = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M208,144a15.78,15.78,0,0,1-10.42,14.94L146,178l-19,51.62a15.92,15.92,0,0,1-29.88,0L78,178l-51.62-19a15.92,15.92,0,0,1,0-29.88L78,110l19-51.62a15.92,15.92,0,0,1,29.88,0L146,110l51.62,19A15.78,15.78,0,0,1,208,144ZM152,48h16V64a8,8,0,0,0,16,0V48h16a8,8,0,0,0,0-16H184V16a8,8,0,0,0-16,0V32H152a8,8,0,0,0,0,16Zm88,32h-8V72a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0V96h8a8,8,0,0,0,0-16Z" />
  </svg>
);
const IconPencil = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"/>
  </svg>
);
const IconCube = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.34,44-29.77,16.3-80.35-44Zm0,88L47.66,76l33.9-18.56,80.34,44ZM40,90l80,43.78v85.79L40,175.82Zm96,129.57V133.77l32-17.51V168a8,8,0,0,0,16,0V107.55L216,90v85.78Z"/>
  </svg>
);
const IconHandFill = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M196,88a27.86,27.86,0,0,0-13.35,3.39A28,28,0,0,0,144,74.7V44a28,28,0,0,0-56,0v80l-3.82-6.13A28,28,0,0,0,35.73,146l4.67,8.23C74.81,214.89,89.05,240,136,240a88.1,88.1,0,0,0,88-88V116A28,28,0,0,0,196,88Zm12,64a72.08,72.08,0,0,1-72,72c-37.63,0-47.84-18-81.68-77.68l-4.69-8.27,0-.05A12,12,0,0,1,54,121.61a11.88,11.88,0,0,1,6-1.6,12,12,0,0,1,10.41,6,1.76,1.76,0,0,0,.14.23l18.67,30A8,8,0,0,0,104,152V44a12,12,0,0,1,24,0v68a8,8,0,0,0,16,0V100a12,12,0,0,1,24,0v20a8,8,0,0,0,16,0v-4a12,12,0,0,1,24,0Z"/>
  </svg>
);
const IconCursorFill = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M216,107.51a20,20,0,0,0-13.28-18.81L72,40.39a20,20,0,0,0-25.81,25.82l48.29,130.69A20,20,0,0,0,113.14,210a20.3,20.3,0,0,0,6-.91A20,20,0,0,0,133,195.36l13.14-37.69,37.68-13.15A20,20,0,0,0,216,107.51Z"/>
  </svg>
);
const IconPlayCircleFill = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" fillRule="evenodd" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm36.44,111.44-48,32A8,8,0,0,1,104,160V96a8,8,0,0,1,12.44-6.44l48,32a8,8,0,0,1,0,12.88Z"/>
  </svg>
);
const IconDragDots = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M104,60a12,12,0,1,1-12-12A12,12,0,0,1,104,60Zm60,12a12,12,0,1,0-12-12A12,12,0,0,0,164,72ZM92,116a12,12,0,1,0,12,12A12,12,0,0,0,92,116Zm72,0a12,12,0,1,0,12,12A12,12,0,0,0,164,116ZM92,172a12,12,0,1,0,12,12A12,12,0,0,0,92,172Zm72,0a12,12,0,1,0,12,12A12,12,0,0,0,164,172Z"/>
  </svg>
);
const IconDotsSixVertical = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M108,60A16,16,0,1,1,92,44,16,16,0,0,1,108,60Zm56-16a16,16,0,1,0,16,16A16,16,0,0,0,164,44ZM92,112a16,16,0,1,0,16,16A16,16,0,0,0,92,112Zm72,0a16,16,0,1,0,16,16A16,16,0,0,0,164,112ZM92,180a16,16,0,1,0,16,16A16,16,0,0,0,92,180Zm72,0a16,16,0,1,0,16,16A16,16,0,0,0,164,180Z"/>
  </svg>
);
const IconDotsThreeVertical = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M128,44a20,20,0,1,1-20,20A20,20,0,0,1,128,44Zm0,64a20,20,0,1,0,20,20A20,20,0,0,0,128,108Zm0,64a20,20,0,1,0,20,20A20,20,0,0,0,128,172Z"/>
  </svg>
);
/* Material Symbols Outlined "edit_square", wght 200 */
const IconEdit = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 -960 960 960" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M224.62-160q-27.62 0-46.12-18.5Q160-197 160-224.62v-510.76q0-27.62 18.5-46.12Q197-800 224.62-800h335.46l-40 40H224.62q-9.24 0-16.93 7.69-7.69 7.69-7.69 16.93v510.76q0 9.24 7.69 16.93 7.69 7.69 16.93 7.69h510.76q9.24 0 16.93-7.69 7.69-7.69 7.69-16.93v-299.53l40-40v339.53q0 27.62-18.5 46.12Q763-160 735.38-160H224.62ZM480-480Zm-80 80v-104.62l357.77-357.76q6.61-6.62 13.92-9.16t15.39-2.54q7.54 0 14.73 2.54t13.04 8.39L859.31-820q6.38 6.62 9.69 14.58 3.31 7.96 3.31 16.04 0 8.07-2.43 15.26-2.42 7.2-9.03 13.81L500.77-400H400Zm432.54-388.62-44.46-46.76 44.46 46.76ZM440-440h43.69l266.62-266.62-21.85-21.84-24.38-23.39L440-487.77V-440Zm288.46-288.46-24.38-23.39 24.38 23.39 21.85 21.84-21.85-21.84Z"/>
  </svg>
);
const IconCaretLeftSmall = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"/>
  </svg>
);
const IconCaretDown = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/>
  </svg>
);
const IconCaretDownSmall = ({ size = 12, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/>
  </svg>
);
const IconCaretUp = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M213.66,165.66a8,8,0,0,1-11.32,0L128,91.31,53.66,165.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,165.66Z"/>
  </svg>
);
const IconTrash = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/>
  </svg>
);
const IconCheck = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>
  </svg>
);
const IconCheckCircleFill = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path fillRule="evenodd" d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"/>
  </svg>
);
const IconMinusCircleFill = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path fillRule="evenodd" d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm40,112H88a8,8,0,0,1,0-16h80a8,8,0,0,1,0,16Z"/>
  </svg>
);
const IconXCircleFill = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path fillRule="evenodd" d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm37.66,130.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32Z"/>
  </svg>
);
const IconClock = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path fillRule="evenodd" d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"/>
  </svg>
);
const IconCopy = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32Zm-56,176H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"/>
  </svg>
);
const IconArrowUpRight = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"/>
  </svg>
);
const IconCurrencyCircleDollar = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40-68a28,28,0,0,1-28,28h-4v8a8,8,0,0,1-16,0v-8H104a8,8,0,0,1,0-16h36a12,12,0,0,0,0-24H116a28,28,0,0,1,0-56h4V72a8,8,0,0,1,16,0v8h16a8,8,0,0,1,0,16H116a12,12,0,0,0,0,24h24A28,28,0,0,1,168,148Z"/>
  </svg>
);
const IconNewspaper = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M88,112a8,8,0,0,1,8-8h80a8,8,0,0,1,0,16H96A8,8,0,0,1,88,112Zm8,40h80a8,8,0,0,0,0-16H96a8,8,0,0,0,0,16ZM232,64V184a24,24,0,0,1-24,24H32A24,24,0,0,1,8,184.11V88a8,8,0,0,1,16,0v96a8,8,0,0,0,16,0V64A16,16,0,0,1,56,48H216A16,16,0,0,1,232,64Zm-16,0H56V184a23.84,23.84,0,0,1-1.37,8H208a8,8,0,0,0,8-8Z"/>
  </svg>
);
const IconReorder = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 -960 960 960" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M160-240v-40h640v40H160Zm0-146.92v-40h640v40H160Zm0-146.16v-40h640v40H160ZM160-680v-40h640v40H160Z"/>
  </svg>
);
const IconTruck = ({ size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...rest}>
    <path d="M255.42,117l-14-35A15.93,15.93,0,0,0,226.58,72H192V64a8,8,0,0,0-8-8H32A16,16,0,0,0,16,72V184a16,16,0,0,0,16,16H49a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A7.94,7.94,0,0,0,255.42,117ZM192,88h34.58l9.6,24H192ZM32,72H176v64H32ZM80,208a16,16,0,1,1,16-16A16,16,0,0,1,80,208Zm81-24H111a32,32,0,0,0-62,0H32V152H176v12.31A32.11,32.11,0,0,0,161,184Zm31,24a16,16,0,1,1,16-16A16,16,0,0,1,192,208Zm48-24H223a32.06,32.06,0,0,0-31-24V128h48Z"/>
  </svg>
);

window.Icon = Icon;
window.IconSparkleFill = IconSparkleFill;
window.IconHandFill = IconHandFill;
window.IconPencil = IconPencil;
window.IconCube = IconCube;
window.IconCursorFill = IconCursorFill;
window.IconDragDots = IconDragDots;
window.IconDotsSixVertical = IconDotsSixVertical;
window.IconDotsThreeVertical = IconDotsThreeVertical;
window.IconEdit = IconEdit;
window.IconPlayCircleFill = IconPlayCircleFill;
window.IconCaretLeftSmall = IconCaretLeftSmall;
window.IconCaretDown = IconCaretDown;
window.IconCaretDownSmall = IconCaretDownSmall;
window.IconCaretUp = IconCaretUp;
window.IconTrash = IconTrash;
window.IconCheck = IconCheck;
window.IconCheckCircleFill = IconCheckCircleFill;
window.IconMinusCircleFill = IconMinusCircleFill;
window.IconXCircleFill = IconXCircleFill;
window.IconClock = IconClock;
window.IconCopy = IconCopy;
window.IconArrowUpRight = IconArrowUpRight;
window.IconCurrencyCircleDollar = IconCurrencyCircleDollar;
window.IconNewspaper = IconNewspaper;
window.IconTruck = IconTruck;
window.IconReorder = IconReorder;
window.useState = useState;
window.useMemo = useMemo;
window.useRef = useRef;
window.useEffect = useEffect;
