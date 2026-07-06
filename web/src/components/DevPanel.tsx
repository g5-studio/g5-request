import React, { useState } from "react";
import { isEnvBrowser } from "../utils/misc";
import { useTheme } from "../contexts/ThemeContext";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

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
    JSON.stringify({ card_bg: "rgba(0,0,0,0.8)", progress_color: "#22c55e" }, null, 2),
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

  function prolongRequest() {
    sendMessage({ action: "prolong", id: id - 1, set: Number(timeout) });
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

  return (
    <Card className="fixed bottom-6 left-6 w-[360px] z-[99999] pointer-events-auto shadow-2xl bg-[#111113]/95 backdrop-blur-md border border-white/5 rounded-xl text-xs">
      <CardHeader className="pb-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <CardTitle className="text-sm font-bold tracking-wide">DEV CONTROLS</CardTitle>
          </div>
          <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-muted-foreground uppercase font-mono">
            v0.3.0
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-4">
        {/* Request Data Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
            <span>Presets Rápidos</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[9px] border-blue-500/20 text-blue-400"
              onClick={() => applyPreset("police")}
            >
              POLICIA
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[9px] border-red-500/20 text-red-400"
              onClick={() => applyPreset("ems")}
            >
              SAMU
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[9px] border-orange-500/20 text-orange-400"
              onClick={() => applyPreset("fire")}
            >
              BOMBEIRO
            </Button>
          </div>

          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1 pt-2">
            <span>Request Data</span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            <div className="col-span-1 flex items-center justify-center">
              <Label htmlFor="id" className="sr-only">
                ID
              </Label>
              <Input
                id="id"
                className="h-8 text-center px-0 bg-black/20 border-white/10"
                placeholder="ID"
                value={id}
                onChange={(e) => setId(Number(e.target.value))}
              />
            </div>
            <div className="col-span-5">
              <Label htmlFor="title" className="sr-only">
                Title
              </Label>
              <Input
                id="title"
                className="h-8 bg-black/20 border-white/10"
                placeholder="Request Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              className="h-8 bg-black/20 border-white/10"
              placeholder="Tag (e.g. #VIP)"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
            <Input
              className="h-8 bg-black/20 border-white/10"
              placeholder="Code (e.g. 10-20)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <Input
                className="h-8 bg-black/20 border-white/10 pr-8"
                placeholder="Timeout"
                value={timeout}
                onChange={(e) => setTimeoutVal(Number(e.target.value))}
              />
              <span className="absolute right-2 top-2 text-[10px] text-muted-foreground">ms</span>
            </div>
            <Input
              className="h-8 bg-black/20 border-white/10"
              placeholder="Sound File"
              value={sound}
              onChange={(e) => setSound(e.target.value)}
            />
          </div>
        </div>

        {/* Configurations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
            <span>Configuration</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="flex h-8 w-full items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              value={position}
              onChange={(e) => setPosition(e.target.value as "top-right" | "top-left")}
            >
              <option value="top-right">↗ Top Right</option>
              <option value="top-left">↖ Top Left</option>
            </select>
            <select
              className="flex h-8 w-full items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              value={themeType}
              onChange={(e) => setThemeType(e.target.value)}
            >
              <option value="default">Default (Green)</option>
              <option value="ambulancia">Ambulance (Red)</option>
              <option value="police">Police (Blue)</option>
              <option value="bombeiro">Fire (Orange)</option>
              <option value="recrutamento">Recruit (Purple)</option>
            </select>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
            <span>Actions</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 font-semibold"
              onClick={addRequest}
            >
              <i className="fa fa-plus mr-2"></i> Send Request
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 border border-white/10 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30"
              onClick={() => fireMany(5)}
            >
              <i className="fa fa-bolt mr-2"></i> Fire Many (5)
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              className="h-8 bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 border border-emerald-500/20"
              onClick={flashAccept}
            >
              ACEPTAR
            </Button>
            <Button
              size="sm"
              className="h-8 bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/20"
              onClick={flashDeny}
            >
              RECUSAR
            </Button>
            <Button size="sm" variant="destructive" className="h-8" onClick={removeRequest}>
              <i className="fa fa-trash"></i>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-white/10 text-muted-foreground"
              onClick={init}
            >
              <i className="fa fa-refresh mr-2"></i> Re-Init
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-white/10 text-muted-foreground"
              onClick={changeTheme}
            >
              <i className="fa fa-paint-brush mr-2"></i> Apply Theme
            </Button>
          </div>
        </div>

        {/* Custom JSON */}
        <div className="pt-2 border-t border-white/5">
          <div
            className="flex items-center gap-2 mb-2 cursor-pointer"
            onClick={() => {
              const el = document.getElementById("json-area");
              if (el) el.classList.toggle("hidden");
            }}
          >
            <span className="text-[10px] uppercase font-bold text-muted-foreground hover:text-white transition-colors">
              Advanced Theme JSON ▾
            </span>
          </div>
          <div id="json-area" className="hidden space-y-2">
            <Textarea
              className="h-20 font-mono text-[10px] bg-black/40 border-white/10 resize-none text-muted-foreground focus:text-white"
              value={themeInput}
              onChange={(e) => setThemeInput(e.target.value)}
              placeholder='{"card_bg": "rgba(0,0,0,0.8)", ...}'
            />
            <Button
              size="sm"
              variant="secondary"
              className="w-full h-7 text-[10px]"
              onClick={applyCustomTheme}
            >
              Apply JSON
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DevPanel;
