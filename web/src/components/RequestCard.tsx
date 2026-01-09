import React, { useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { cn } from "../utils/cn";

export type RequestData = {
  id: string | number;
  timeout?: number;
  themeType?: string | null;
  tagColor?: string | null;
  progressColor?: string | null;
  codeColor?: string | null;
  titleIcon?: string | null;
  titleIconColor?: string | null;
  acceptText?: string | null;
  denyText?: string | null;
  tagText?: string | null;
  tag?: string | null;
  code?: string | null;
  title?: string | null;
  extras?: any;
  sound?: string | null;
};

type Props = {
  req: RequestData;
  acceptKey: string;
  denyKey: string;
  onExpire: () => void;
  onRemove: () => void;
  flash?: "accept" | "deny" | null;
};

function _hasExtension(name?: string) {
  return !!name && /\.[a-z0-9]{1,6}$/i.test(name);
}

function _audioPathFor(name?: string) {
  if (!name || typeof name !== "string") return [] as string[];
  const clean = name.trim();
  if (clean.length === 0) return [] as string[];
  if (_hasExtension(clean)) {
    return [`assets/sound/${clean}`];
  }
  return [`assets/sound/${clean}.ogg`, `assets/sound/${clean}.mp3`, `assets/sound/${clean}.wav`];
}

function playNotificationSound(name?: string) {
  if (!name || typeof name !== "string") return;
  if (name.trim().toLowerCase() === "off") return;
  const candidates = _audioPathFor(name);
  (async () => {
    for (const src of candidates) {
      try {
        const a = new Audio(src);
        a.volume = 0.9;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await a.play();
        return;
      } catch (e) {
        // continue
      }
    }
  })();
}

function _esc(s: any) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function _parseColor(str?: string) {
  if (!str || typeof str !== "string") return null;
  const s = str.trim().toLowerCase();
  if (s[0] === "#") {
    if (s.length === 4) {
      const r = parseInt(s[1] + s[1], 16);
      const g = parseInt(s[2] + s[2], 16);
      const b = parseInt(s[3] + s[3], 16);
      return [r, g, b];
    } else if (s.length === 7) {
      const r = parseInt(s.substr(1, 2), 16);
      const g = parseInt(s.substr(3, 2), 16);
      const b = parseInt(s.substr(5, 2), 16);
      return [r, g, b];
    }
    return null;
  }
  const m = s.match(/rgba?\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})/);
  if (m) {
    return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
  }
  return null;
}

function _getContrastColor(colorStr?: string) {
  const rgb = _parseColor(colorStr);
  if (!rgb) return "#fff";
  const srgb = rgb.map((c) => c / 255);
  const lin = srgb.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  const lum = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  return lum > 0.179 ? "#000" : "#fff";
}

const RequestCard: React.FC<Props> = ({ req, acceptKey, denyKey, onExpire, onRemove, flash }) => {
  const elRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const audioRefs = useRef<HTMLAudioElement[]>([]);
  const playedRef = useRef(false);
  const startedAtRef = useRef<number>(performance.now());
  const durationRef = useRef<number>(req.timeout ?? 8000);
  const rafRef = useRef<number | null>(null);
  const { themes } = useTheme();

  // Pega o tema para aplicar inline como fallback
  const themeType = req.themeType || 'default';
  const cardTheme = themes[themeType] || themes['default'];

  // Calculate generic contrasting foregrounds if needed
  const tagBg = req.tagColor || cardTheme?.tag_bg;
  const tagFg = req.tagColor
    ? _getContrastColor(req.tagColor)
    : (cardTheme?.tag_fg || (tagBg ? _getContrastColor(tagBg) : undefined));

  const codeBg = req.codeColor || cardTheme?.code_bg;
  const codeFg = req.codeColor
    ? _getContrastColor(req.codeColor)
    : (cardTheme?.code_fg || (codeBg ? _getContrastColor(codeBg) : undefined));

  const progressColor = req.progressColor || cardTheme?.progress_color || cardTheme?.accent;

  useEffect(() => {
    // initialize styles
    const el = elRef.current;
    if (!el) return;

    // play sound once on mount (arrival)
    try {
      if (req.sound && !playedRef.current) {
        playedRef.current = true;
        const candidates = _audioPathFor(req.sound);
        (async () => {
          for (const src of candidates) {
            try {
              const a = new Audio(src);
              a.volume = 0.9;
              audioRefs.current.push(a);
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              await a.play();
              break;
            } catch (e) {
              // continue to next candidate
            }
          }
        })();
      }
    } catch (e) {
      // ignore
    }

    // show animation
    requestAnimationFrame(() => el.classList.add("show"));

    startedAtRef.current = performance.now();
    durationRef.current = req.timeout ?? 8000;

    const tick = () => {
      const now = performance.now();
      const elapsed = now - startedAtRef.current;
      const pct = Math.max(0, Math.min(1, 1 - elapsed / durationRef.current));
      if (barRef.current) barRef.current.style.width = `${pct * 100}%`;
      if (elapsed >= durationRef.current) {
        onExpire();
        // remove animation
        if (el) {
          el.classList.remove("show");
          el.classList.add("hide");
        }
        setTimeout(() => onRemove(), 320);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // stop any playing audio when the card unmounts
      try {
        for (const a of audioRefs.current) {
          try {
            a.pause();
            try { a.currentTime = 0; } catch (e) {}
            // disconnect source
            // @ts-ignore
            a.src = '';
          } catch (e) {}
        }
      } catch (e) {}
      audioRefs.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req, onExpire, onRemove, themes]);

  useEffect(() => {
    if (!elRef.current) return;
    const el = elRef.current;
    if (flash === "accept") {
      el.style.boxShadow = "0 0 12px rgba(60,200,120,0.8)";
      setTimeout(() => (el.style.boxShadow = ""), 400);
    } else if (flash === "deny") {
      el.style.boxShadow = "0 0 12px rgba(200,60,60,0.8)";
      setTimeout(() => (el.style.boxShadow = ""), 400);
    }
  }, [flash]);

  function _renderExtras(extras: any) {
    if (!extras) return null;
    let extrasObj = null as any;
    try {
      extrasObj = typeof extras === "string" ? JSON.parse(extras) : extras;
    } catch (e) {
      extrasObj = null;
    }

    if (Array.isArray(extrasObj)) {
      return extrasObj.map((item: any, idx: number) => {
        if (!item || typeof item !== "object") return null;
        const icon = item.icon;
        const name = item.name;
        const value = item.value;
        if (value === null || value === undefined || value === "") return null;
        return (
          <div className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2" key={idx}>
            <i className={`fa fa-${_esc(icon || "")} w-4 text-center`} />
            <span className="font-semibold">{_esc(name || "")}:</span>
            <span>{_esc(value)}</span>
          </div>
        );
      });
    }

    if (extrasObj && typeof extrasObj === "object") {
      return Object.entries(extrasObj).map(([k, v]: any, idx) => {
        if (v === null || v === undefined || v === "") return null;
        return (
          <div className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2" key={idx}>
            <i className={`fa fa-${_esc(k)} w-4 text-center`} />
            <span className="font-semibold">{_esc(k)}:</span>
            <span>{_esc(v)}</span>
          </div>
        );
      });
    }

    return <div className="text-sm text-muted-foreground mt-1.5">{_esc(typeof extras === "string" ? extras : JSON.stringify(extras))}</div>;
  }

  return (
    <Card
      className="request-card w-[360px] relative overflow-hidden transition-all duration-300 border border-white/10 bg-[#121214] shadow-2xl rounded-xl"
      ref={elRef}
      data-id={String(req.id)}
      style={{
        background: cardTheme?.card_bg, // Allow override but default to dark
      }}
    >
      {/* Progress Bar - Ultra thin gradient */}
      <div className="absolute left-0 top-0 h-[2px] w-full bg-white/5 z-20">
        <div className="h-full w-full transition-all ease-linear shadow-[0_0_10px_rgba(16,185,129,0.5)]" ref={barRef} style={{ backgroundColor: progressColor }} />
      </div>

      {/* Header Area */}
      <div
        className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]"
        style={{ backgroundColor: cardTheme?.title_bg }}
      >
        <div className="flex items-center gap-3 min-w-0">
             {/* Title Group */}
             <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    {req.titleIcon && (
                        <i className={`fa fa-${_esc(req.titleIcon)} text-muted-foreground text-xs`} style={{ color: req.titleIconColor || undefined }} />
                    )}
                    <span className="font-bold text-sm text-white leading-none truncate max-w-[180px]">{_esc(req.title)}</span>
                </div>
                 {/* Subtitle/Badges Row */}
                <div className="flex items-center gap-2 mt-1.5">
                    {(req.tagText || req.tag) && (
                    <Badge
                        className="rounded-[4px] px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-wider border-0"
                        style={{
                        backgroundColor: tagBg || 'rgba(255,255,255,0.1)',
                        color: tagFg || '#fff'
                        }}
                    >
                        {_esc(req.tagText) || `#${_esc(req.tag || "")}`}
                    </Badge>
                    )}
                    {req.code && (
                    <span className="text-[10px] font-mono text-muted-foreground">
                        {_esc(req.code)}
                    </span>
                    )}
                </div>
             </div>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Render Extras as a grid of info items */}
        <div className="grid grid-cols-1 gap-1">
            {_renderExtras(req.extras)}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="grid grid-cols-2 gap-3 w-full">
            {/* Accept Button */}
          <div className="group relative flex items-center justify-center gap-2 bg-[#1c1c1f] hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/50 rounded-lg p-2.5 transition-all cursor-default">
             <div className="flex items-center justify-center h-5 w-5 rounded bg-emerald-500/20 text-emerald-500 text-[10px] font-bold group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                 {acceptKey}
             </div>
             <span className="text-xs font-semibold text-muted-foreground group-hover:text-emerald-500 transition-colors uppercase tracking-wide">{req.acceptText ?? "Accept"}</span>
          </div>

          {/* Deny Button */}
          <div className="group relative flex items-center justify-center gap-2 bg-[#1c1c1f] hover:bg-red-500/10 border border-white/5 hover:border-red-500/50 rounded-lg p-2.5 transition-all cursor-default">
             <div className="flex items-center justify-center h-5 w-5 rounded bg-red-500/20 text-red-500 text-[10px] font-bold group-hover:bg-red-500 group-hover:text-black transition-colors">
                 {denyKey}
             </div>
             <span className="text-xs font-semibold text-muted-foreground group-hover:text-red-500 transition-colors uppercase tracking-wide">{req.denyText ?? "Refuse"}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RequestCard;
