import React, { useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Card, CardContent, CardFooter } from "./ui/card";
import { RequestHeader } from "./molecules/RequestHeader";
import { RequestExtras } from "./molecules/RequestExtras";
import { ActionBtn } from "./molecules/RequestActions";
import { VehicleInfo } from "./molecules/VehicleInfo";
import { Icon } from "./atoms/Icon";
import { noop } from "../utils/misc";
import { RequestData } from "../types";

type Props = {
  req: RequestData;
  acceptKey: string;
  denyKey: string;
  onExpire: () => void;
  onRemove: () => void;
  onAccept: () => void;
  flash?: "accept" | "deny" | null;
  shortMode?: boolean;
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

const RequestCard: React.FC<Props> = ({
  req,
  acceptKey,
  denyKey,
  onExpire,
  onRemove,
  onAccept,
  flash,
  shortMode,
}) => {
  const elRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const audioRefs = useRef<HTMLAudioElement[]>([]);
  const playedRef = useRef(false);
  const startedAtRef = useRef<number>(performance.now());
  const durationRef = useRef<number>(req.timeout ?? 8000);
  const rafRef = useRef<number | null>(null);
  const { themes } = useTheme();

  // Pega o tema para aplicar inline como fallback
  const themeType = req.themeType || "default";
  const cardTheme = themes[themeType] || themes["default"];
  const progressColor = req.progressColor || cardTheme?.progress_color || cardTheme?.accent;

  useEffect(() => {
    // initialize styles
    const el = elRef.current;
    if (!el || shortMode) return;

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
            try {
              a.currentTime = 0;
            } catch (e) {
              /* ignore */
            }
            // disconnect source
            a.src = "";
          } catch (e) {
            /* ignore */
          }
        }
      } catch (e) {
        /* ignore */
      }
      audioRefs.current = [];
    };
  }, [req, onExpire, onRemove, themes, shortMode]);

  useEffect(() => {
    if (!elRef.current || shortMode) return;
    const el = elRef.current;
    if (flash === "accept") {
      el.style.boxShadow = "0 0 12px rgba(60,200,120,0.8)";
      setTimeout(() => {
        if (el) el.style.boxShadow = "";
      }, 400);
    } else if (flash === "deny") {
      el.style.boxShadow = "0 0 12px rgba(200,60,60,0.8)";
      setTimeout(() => {
        if (el) el.style.boxShadow = "";
      }, 400);
    }
  }, [flash, shortMode]);

  if (shortMode) {
    return (
      <Card
        className="request-card w-[260px] relative overflow-hidden transition-all duration-300 border border-white/10 bg-[#121214] shadow-lg rounded-md mb-1"
        ref={elRef}
        data-id={String(req.id)}
        style={{ background: cardTheme?.title_bg }}
      >
        {/* Progress Bar */}
        <div className="absolute left-0 bottom-0 h-[2px] w-full bg-white/5 z-20">
          <div
            className="h-full w-full transition-all ease-linear"
            ref={barRef}
            style={{ backgroundColor: progressColor }}
          />
        </div>

        <div className="p-2">
          <RequestHeader req={req} />
        </div>
      </Card>
    );
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
        <div
          className="h-full w-full transition-all ease-linear shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          ref={barRef}
          style={{ backgroundColor: progressColor }}
        />
      </div>

      {/* Header Area */}
      <div
        className="flex items-center justify-between p-2 border-b border-white/5 bg-white/[0.02]"
        style={{ backgroundColor: cardTheme?.title_bg }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Title Group */}
          <div className="flex flex-col">
            <RequestHeader req={req} />
          </div>
        </div>
      </div>

      <CardContent className="p-2">
        {/* Render Extras as a grid of info items */}
        <div className="grid grid-cols-1 gap-1">
          <RequestExtras extras={req.extras} />
        </div>

        {/* Vehicle Info */}
        <VehicleInfo vehicle={req.vehicle} />

        {/* Responding Units */}
        {req.units && req.units.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/5">
            <div className="text-[10px] uppercase text-muted-foreground font-bold mb-1 flex items-center gap-1">
              <Icon name="users" />
              <span>Responding Units</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {req.units.map((u, i) => (
                <div
                  key={i}
                  className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono text-white/80 border border-white/5"
                >
                  {u.callsign}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pb-2">
        <div className="w-full flex place-content-around">
          <ActionBtn
            variant="accept"
            onClick={onAccept}
            shortcutKey={acceptKey}
            label={req.acceptText ?? "Accept"}
            className="group pr-2"
          />

          {!req.hideDeny && (
            <ActionBtn
              variant="deny"
              onClick={noop}
              shortcutKey={denyKey}
              label={req.denyText ?? "Refuse"}
              className="group pr-2"
            />
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default RequestCard;
