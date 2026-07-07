import React, { useState } from "react";
import {
  MriCard,
  MriCardHeader,
  MriCardTitle,
  MriCardContent,
  MriInput,
  MriTextarea,
  MriButton,
} from "@mriqbox/ui-kit";
import { isEnvBrowser } from "../utils/misc";
import { useTheme } from "../contexts/ThemeContext";

const DevPanel: React.FC = () => {
  const [title, setTitle] = useState("Pedido de Ajuda");
  const [tag, setTag] = useState("VIP");
  const [code, setCode] = useState("");
  const [timeout, setTimeoutVal] = useState(8000);
  const [sound, setSound] = useState("");
  const [id, setId] = useState(1);
  const [position, setPosition] = useState<"top-right" | "top-left">("top-right");
  const [themeType, setThemeType] = useState<string>("default");
  const [themeInput, setThemeInput] = useState<string>(
    JSON.stringify({ progress_color: "#22c55e", accent: "#22c55e" }, null, 2),
  );
  const { setThemeType: applyThemeType } = useTheme();

  if (!isEnvBrowser()) return null;

  function sendMessage(msg: Record<string, unknown>) {
    window.postMessage(msg, "*");
  }

  function addRequest() {
    const req = {
      id,
      title,
      tag: tag ? tag.replace(/^#/, "") : undefined,
      tagText: tag || undefined,
      code: code || undefined,
      timeout: Number(timeout) || 8000,
      sound: sound || undefined,
      themeType: themeType !== "default" ? themeType : undefined,
      extras: [{ icon: "user", name: "Nome", value: "Teste" }],
    };
    sendMessage({ action: "add", request: req });
    setId((prev) => prev + 1);
  }

  function fireMany(count = 5) {
    for (let i = 0; i < count; i++) {
      const nextId = id + i;
      const themeList = ["default", "ambulancia", "police", "bombeiro", "recrutamento"];
      const randomTheme = themeList[Math.floor(Math.random() * themeList.length)];

      const req = {
        id: nextId,
        title: `Pedido Múltiplo #${nextId}`,
        tag: "TEST",
        tagText: "TEST",
        code: `10-${10 + i}`,
        timeout: 10000 + i * 1000,
        themeType: randomTheme !== "default" ? randomTheme : undefined,
        extras: [
          { icon: "map-marker", name: "Local", value: "Rua das Flores" },
          { icon: "user", name: "Solicitante", value: "João Silva" },
        ],
      };
      sendMessage({ action: "add", request: req });
    }
    setId((prev) => prev + count);
  }

  function removeRequest() {
    sendMessage({ action: "remove", id: id - 1 });
  }

  function flashAccept() {
    sendMessage({ action: "flashAccept", id: id - 1 });
  }

  function flashDeny() {
    sendMessage({ action: "flashDeny", id: id - 1 });
  }

  function init() {
    sendMessage({ action: "init", position, acceptKey: "Y", denyKey: "N" });
  }

  const changeTheme = () => {
    applyThemeType(themeType);
  };

  const applyPreset = (type: "police" | "ems" | "fire") => {
    const presets = {
      police: { title: "Disparo de Alarme", tag: "POLICIA", theme: "police", code: "10-31" },
      ems: { title: "Acidente de Trânsito", tag: "SAMU", theme: "ambulancia", code: "QTI" },
      fire: {
        title: "Incêndio Estrutural",
        tag: "CORPO DE BOMBEIROS",
        theme: "bombeiro",
        code: "10-70",
      },
    };
    const p = presets[type];
    setTitle(p.title);
    setTag(p.tag);
    setThemeType(p.theme);
    setCode(p.code);
  };

  const applyCustomTheme = () => {
    try {
      const parsed = JSON.parse(themeInput);
      sendMessage({ action: "init", themes: { custom: parsed } });
      setTimeout(() => applyThemeType("custom"), 100);
    } catch (e) {
      console.error("Invalid theme JSON", e);
    }
  };

  const selectClass =
    "flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";
  const sectionLabel =
    "flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1";

  return (
    <MriCard className="dev-panel fixed bottom-6 left-6 w-[360px] z-[99999] pointer-events-auto text-xs">
      <MriCardHeader className="p-4 pb-3 border-b border-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <MriCardTitle className="text-sm font-bold tracking-wide">DEV CONTROLS</MriCardTitle>
          </div>
          <span className="px-2 py-0.5 rounded bg-muted text-[10px] text-muted-foreground uppercase font-mono">
            v0.3.0
          </span>
        </div>
      </MriCardHeader>
      <MriCardContent className="grid gap-4 p-4">
        {/* Presets */}
        <div className="space-y-3">
          <div className={sectionLabel}>
            <span>Presets Rápidos</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MriButton size="sm" variant="outline" className="h-7 text-[9px]" onClick={() => applyPreset("police")}>
              POLICIA
            </MriButton>
            <MriButton size="sm" variant="outline" className="h-7 text-[9px]" onClick={() => applyPreset("ems")}>
              SAMU
            </MriButton>
            <MriButton size="sm" variant="outline" className="h-7 text-[9px]" onClick={() => applyPreset("fire")}>
              BOMBEIRO
            </MriButton>
          </div>

          <div className={`${sectionLabel} pt-2`}>
            <span>Request Data</span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            <div className="col-span-1">
              <MriInput
                aria-label="ID"
                className="text-center"
                placeholder="ID"
                value={id}
                onChange={(e) => setId(Number(e.target.value))}
              />
            </div>
            <div className="col-span-5">
              <MriInput
                aria-label="Title"
                placeholder="Request Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MriInput placeholder="Tag (e.g. #VIP)" value={tag} onChange={(e) => setTag(e.target.value)} />
            <MriInput placeholder="Code (e.g. 10-20)" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MriInput
              placeholder="Timeout (ms)"
              value={timeout}
              onChange={(e) => setTimeoutVal(Number(e.target.value))}
            />
            <MriInput placeholder="Sound File" value={sound} onChange={(e) => setSound(e.target.value)} />
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-3">
          <div className={sectionLabel}>
            <span>Configuration</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              className={selectClass}
              value={position}
              onChange={(e) => setPosition(e.target.value as "top-right" | "top-left")}
            >
              <option value="top-right">↗ Top Right</option>
              <option value="top-left">↖ Top Left</option>
            </select>
            <select className={selectClass} value={themeType} onChange={(e) => setThemeType(e.target.value)}>
              <option value="default">Default (Green)</option>
              <option value="ambulancia">Ambulance (Red)</option>
              <option value="police">Police (Blue)</option>
              <option value="bombeiro">Fire (Orange)</option>
              <option value="recrutamento">Recruit (Purple)</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className={sectionLabel}>
            <span>Actions</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <MriButton size="sm" onClick={addRequest}>
              <i className="fa fa-plus" /> Send Request
            </MriButton>
            <MriButton size="sm" variant="secondary" onClick={() => fireMany(5)}>
              <i className="fa fa-bolt" /> Fire Many (5)
            </MriButton>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MriButton size="sm" variant="default" onClick={flashAccept}>
              ACEITAR
            </MriButton>
            <MriButton size="sm" variant="destructive" onClick={flashDeny}>
              RECUSAR
            </MriButton>
            <MriButton size="sm" variant="destructive" onClick={removeRequest}>
              <i className="fa fa-trash" />
            </MriButton>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <MriButton size="sm" variant="outline" onClick={init}>
              <i className="fa fa-refresh" /> Re-Init
            </MriButton>
            <MriButton size="sm" variant="outline" onClick={changeTheme}>
              <i className="fa fa-paint-brush" /> Apply Theme
            </MriButton>
          </div>
        </div>

        {/* Custom JSON */}
        <div className="pt-2 border-t border-border">
          <div
            className="flex items-center gap-2 mb-2 cursor-pointer"
            onClick={() => {
              const el = document.getElementById("json-area");
              if (el) el.classList.toggle("hidden");
            }}
          >
            <span className="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground transition-colors">
              Advanced Theme JSON ▾
            </span>
          </div>
          <div id="json-area" className="hidden space-y-2">
            <MriTextarea
              className="h-20 font-mono text-[10px] resize-none"
              value={themeInput}
              onChange={(e) => setThemeInput(e.target.value)}
              placeholder='{"progress_color": "#22c55e", ...}'
            />
            <MriButton size="sm" variant="secondary" className="w-full h-7 text-[10px]" onClick={applyCustomTheme}>
              Apply JSON
            </MriButton>
          </div>
        </div>
      </MriCardContent>
    </MriCard>
  );
};

export default DevPanel;
