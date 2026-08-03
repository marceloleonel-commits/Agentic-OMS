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
    case "chevron-left":
      return (<svg {...common}><path d="M15 6l-6 6 6 6"/></svg>);
    case "chevron-right":
      return (<svg {...common}><path d="M9 6l6 6-6 6"/></svg>);
    case "chevron-down":
      return (<svg {...common}><path d="M6 9l6 6 6-6"/></svg>);
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
window.useState = useState;
window.useMemo = useMemo;
window.useRef = useRef;
window.useEffect = useEffect;
