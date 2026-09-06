import React, { useState, createElement } from 'react';

// Parses the design's inline CSS strings verbatim into React style objects.
// Declarations are copied straight out of the mockup, so nothing is retyped by hand.
const cache = new Map();

function toCamel(prop) {
  const p = prop.trim();
  if (p.startsWith('--')) return p;
  if (p.startsWith('-ms-')) return 'ms' + p.slice(4).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  return p.replace(/^-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function parse(str) {
  const out = {};
  let depth = 0, buf = '';
  const flush = () => {
    const decl = buf.trim();
    buf = '';
    if (!decl) return;
    const i = decl.indexOf(':');
    if (i < 0) return;
    out[toCamel(decl.slice(0, i))] = decl.slice(i + 1).trim();
  };
  for (const ch of str) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ';' && depth === 0) flush();
    else buf += ch;
  }
  flush();
  return out;
}

export function css(str) {
  if (!str) return undefined;
  let v = cache.get(str);
  if (!v) { v = parse(str); cache.set(str, v); }
  return v;
}

// Renders any element with the design's base style plus its style-hover /
// style-active variants, which the mockup expressed as extra attributes.
export function Sx({ as = 'div', style, hover, active, children, ...rest }) {
  const [isHover, setHover] = useState(false);
  const [isActive, setActive] = useState(false);

  const merged = {
    ...css(style),
    ...(hover && isHover ? css(hover) : null),
    ...(active && isActive ? css(active) : null)
  };

  const handlers = {};
  if (hover || active) {
    handlers.onMouseEnter = e => { setHover(true); rest.onMouseEnter?.(e); };
    handlers.onMouseLeave = e => { setHover(false); setActive(false); rest.onMouseLeave?.(e); };
  }
  if (active) {
    handlers.onMouseDown = e => { setActive(true); rest.onMouseDown?.(e); };
    handlers.onMouseUp = e => { setActive(false); rest.onMouseUp?.(e); };
  }

  return createElement(as, { ...rest, ...handlers, style: merged }, children);
}
