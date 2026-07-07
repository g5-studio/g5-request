import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { RequestData } from "../types";
import { fetchNui } from "../utils/fetchNui";
import { RequestHeader } from "./molecules/RequestHeader";
import { RequestExtras } from "./molecules/RequestExtras";
import { ExpirationTimer } from "./molecules/ExpirationTimer";
import { ActionBtn } from "./molecules/RequestActions";
import { VehicleInfo } from "./molecules/VehicleInfo";
import { Icon } from "./atoms/Icon";
import { useI18n } from "../i18n";

type HistoryItem = {
    id: string;
    data: RequestData;
    time: number;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryItem[];
    onClear: () => void;
    onLocate: (req: RequestData) => void;
    onAccept: (item: HistoryItem) => void;
    onDeny: (item: HistoryItem) => void;
    onDetach: (item: HistoryItem) => void;
    myCallsign?: string;
    // Settings
    isMuted: boolean;
    onToggleMute: (val: boolean) => void;
    shortMode: boolean;
    onToggleShortMode: (val: boolean) => void;

    keepRequestsOpen: boolean;
    onToggleKeepRequestsOpen: (val: boolean) => void;
    callsign: string;
    setCallsign: (val: string) => void;
    initialTab?: "history" | "settings";
};

// --- Dispatch Item Component (Refactored to use Molecules) ---
const DispatchItem: React.FC<{
    item: HistoryItem;
    onLocate: (req: RequestData) => void;
    onAccept: (item: HistoryItem) => void;
    onDeny: (item: HistoryItem) => void;
    onDetach: (item: HistoryItem) => void;
    myCallsign?: string;
}> = ({ item, onLocate, onAccept, onDeny, onDetach, myCallsign }) => {
    const req = item.data;
    const { t } = useI18n();

    // The local player is "en route" when their callsign is among the units.
    const isAttached =
        !!myCallsign && !!req.units?.some((u) => u.callsign === myCallsign);

    return (
        <div className="p-2 hover:bg-primary/5 transition-colors flex items-center justify-between group border-l-2 border-transparent hover:border-l-primary/90 border-b border-white/5 last:border-b-0">
            <div className="flex items-start flex-1">
                <div className="mt-1"></div>
                <div className="space-y-1 w-auto">
                    <div className="flex items-center gap-2">
                        <RequestHeader req={req} />
                    </div>

                    <RequestExtras extras={req.extras} />
                    <VehicleInfo vehicle={req.vehicle} />

                    {/* Responding Units in History */}
                    {req.units && req.units.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                            {req.units.map((u, i) => (
                                <div
                                    key={i}
                                    className="bg-white/5 px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground border border-white/5 flex items-center gap-1"
                                >
                                    <Icon name="user" className="text-[8px]" />
                                    {u.callsign}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50 font-mono pt-1">
                        <span>{new Date(item.time).toLocaleTimeString()}</span>
                        <ExpirationTimer
                            startTime={item.time}
                            expiresIn={
                                req.expiresIn || (req.timeout === req.expiresIn ? req.timeout : req.expiresIn)
                            }
                        />
                    </div>
                </div>
            </div>
            <div className="p-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {(req.extras as Record<string, unknown>)?.y !== undefined &&
                    (req.extras as Record<string, unknown>)?.x !== undefined && (
                        <ActionBtn
                            variant="locate"
                            onClick={() => onLocate(req)}
                            icon="map-marker"
                            className="h-8 px-3"
                            title={t("menu.locate_title")}
                        />
                    )}

                {isAttached ? (
                    <ActionBtn
                        variant="deny"
                        onClick={() => onDetach(item)}
                        icon="right-from-bracket"
                        label={t("menu.enroute")}
                        className="h-8 px-3"
                        title={t("menu.enroute_title")}
                    />
                ) : (
                    <ActionBtn
                        variant="accept"
                        onClick={() => onAccept(item)}
                        label={req.acceptText ?? t("action.accept")}
                        className="h-8 px-3"
                        title={t("action.accept")}
                    />
                )}

                {!req.hideDeny && (
                    <ActionBtn
                        variant="deny"
                        onClick={() => onDeny(item)}
                        label={req.denyText ?? t("action.deny")}
                        className="h-8 px-3"
                        title={t("action.deny")}
                    />
                )}
            </div>
        </div>
    );
};

const DispatchMenu: React.FC<Props> = ({
    isOpen,
    onClose,
    history,
    onClear,
    onLocate,
    onAccept,
    onDeny,
    onDetach,
    myCallsign,
    isMuted,
    onToggleMute,
    shortMode,
    onToggleShortMode,
    keepRequestsOpen,
    onToggleKeepRequestsOpen,
    callsign,
    setCallsign,
    initialTab = "history",
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"history" | "settings">("history");
    const [alertsEnabled, setAlertsEnabled] = useState(true);
    const { t } = useI18n();

    const toggleAlerts = () => {
        fetchNui<{ disabled?: boolean }>("toggleAlerts")
            .then((res) => setAlertsEnabled(!(res?.disabled ?? !alertsEnabled)))
            .catch(() => setAlertsEnabled((v) => !v));
    };

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                fetchNui("closeUI").catch(() => { });
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const filtered = history
        .filter(
            (h) =>
                h.data.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                h.data.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                h.data.tag?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .sort((a, b) => b.time - a.time);

    return (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/80 animation-fade-in pointer-events-auto p-10">
            <Card className="w-full max-w-4xl h-[80vh] border border-white/10 bg-[#121214] shadow-2xl rounded-xl flex flex-col">
                <CardHeader className="border-b border-white/5 bg-white/[0.02] py-4 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <i className="fa fa-list-alt text-lg text-primary"></i>
                                <CardTitle className="text-xl font-bold tracking-wide">{t("menu.title")}</CardTitle>
                            </div>

                            {/* Tabs */}
                            <div className="flex items-center bg-black/20 p-1 rounded-lg border border-white/5">
                                <button
                                    onClick={() => setActiveTab("history")}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "history" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white/70"}`}
                                >
                                    {t("menu.tab_history")} <span className="ml-2 opacity-50 text-[10px]">{history.length}</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab("settings")}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "settings" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white/70"}`}
                                >
                                    {t("menu.tab_settings")}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {activeTab === "history" && (
                                <input
                                    type="text"
                                    placeholder={t("menu.search")}
                                    className="h-8 bg-black/20 border border-white/10 rounded px-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            )}

                            {activeTab === "history" && (
                                <>
                                    <button
                                        onClick={() => fetchNui("refreshAlerts").catch(() => { })}
                                        className="text-xs bg-white/5 text-muted-foreground px-3 py-1.5 rounded hover:bg-white/10 hover:text-white transition-colors border border-white/10 flex items-center gap-1.5"
                                        title={t("menu.refresh_title")}
                                    >
                                        <Icon name="rotate" /> {t("menu.refresh")}
                                    </button>
                                    <button
                                        onClick={() => fetchNui("clearBlips").catch(() => { })}
                                        className="text-xs bg-white/5 text-muted-foreground px-3 py-1.5 rounded hover:bg-white/10 hover:text-white transition-colors border border-white/10 flex items-center gap-1.5"
                                        title={t("menu.clear_blips_title")}
                                    >
                                        <Icon name="map-location-dot" /> {t("menu.clear_blips")}
                                    </button>
                                    <button
                                        onClick={toggleAlerts}
                                        className={`text-xs px-3 py-1.5 rounded transition-colors border flex items-center gap-1.5 ${alertsEnabled
                                            ? "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border-white/10"
                                            : "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                                            }`}
                                        title={t("menu.alerts_title")}
                                    >
                                        <Icon name={alertsEnabled ? "bell" : "bell-slash"} />
                                        {alertsEnabled ? t("menu.alerts_on") : t("menu.alerts_off")}
                                    </button>
                                    <button
                                        onClick={onClear}
                                        className="text-xs bg-red-500/10 text-red-500 px-3 py-1.5 rounded hover:bg-red-500/20 transition-colors border border-red-500/20"
                                    >
                                        {t("menu.clear_all")}
                                    </button>
                                </>
                            )}

                            <button
                                onClick={() => {
                                    fetchNui("close").catch(() => { });
                                    onClose();
                                }}
                                className="text-muted-foreground hover:text-white transition-colors ml-2"
                            >
                                <i className="fa fa-times text-lg"></i>
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-0 pr-1 custom-scrollbar relative">
                    {activeTab === "history" ? (
                        filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                                <i className="fa fa-inbox text-4xl mb-4"></i>
                                <p>{t("menu.empty")}</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filtered.map((item) => (
                                    <DispatchItem
                                        key={item.id}
                                        item={item}
                                        onLocate={onLocate}
                                        onAccept={onAccept}
                                        onDeny={onDeny}
                                        onDetach={onDetach}
                                        myCallsign={myCallsign}
                                    />
                                ))}
                            </div>
                        )
                    ) : (
                        // Settings Tab Content
                        <div className="p-8 max-w-2xl mx-auto space-y-8">
                            {/* Callsign Input */}
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-lg font-semibold flex items-center gap-2">
                                        <Icon name="user-tag" />
                                        {t("settings.callsign")}
                                    </Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {t("settings.callsign_desc")}
                                    </p>
                                </div>
                                <input
                                    type="text"
                                    value={callsign}
                                    onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                                    placeholder={t("settings.callsign_placeholder")}
                                    className="flex h-12 w-full rounded-md border border-white/10 bg-black/20 px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 uppercase font-mono tracking-wider"
                                />
                            </div>

                            <div className="h-px bg-white/5" />

                            {/* Mute Toggle */}
                            <div className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                                <div className="space-y-1">
                                    <Label className="text-base font-semibold flex items-center gap-2">
                                        <Icon name={isMuted ? "bell-slash" : "bell"} />
                                        {t("settings.mute")}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t("settings.mute_desc")}
                                    </p>
                                </div>

                                <button
                                    role="switch"
                                    aria-checked={isMuted}
                                    onClick={() => onToggleMute(!isMuted)}
                                    className={`
                                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50
                                        ${isMuted ? "bg-primary" : "bg-white/10"}
                                    `}
                                >
                                    <span
                                        className={`
                                            pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform
                                            ${isMuted ? "translate-x-5" : "translate-x-0.5"}
                                        `}
                                    />
                                </button>
                            </div>

                            {/* Short Mode Toggle */}
                            <div className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                                <div className="space-y-1">
                                    <Label className="text-base font-semibold flex items-center gap-2">
                                        <Icon name="compress" />
                                        {t("settings.compact")}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t("settings.compact_desc")}
                                    </p>
                                </div>

                                <button
                                    role="switch"
                                    aria-checked={shortMode}
                                    onClick={() => onToggleShortMode(!shortMode)}
                                    className={`
                                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50
                                        ${shortMode ? "bg-primary" : "bg-white/10"}
                                    `}
                                >
                                    <span
                                        className={`
                                            pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform
                                            ${shortMode ? "translate-x-5" : "translate-x-0.5"}
                                        `}
                                    />
                                </button>
                            </div>

                            {/* Keep Requests Open Toggle */}
                            <div className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                                <div className="space-y-1">
                                    <Label className="text-base font-semibold flex items-center gap-2">
                                        <Icon name="layer-group" />
                                        {t("settings.keep_open")}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t("settings.keep_open_desc")}
                                    </p>
                                </div>

                                <button
                                    role="switch"
                                    aria-checked={keepRequestsOpen}
                                    onClick={() => onToggleKeepRequestsOpen(!keepRequestsOpen)}
                                    className={`
                                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50
                                        ${keepRequestsOpen ? "bg-primary" : "bg-white/10"}
                                    `}
                                >
                                    <span
                                        className={`
                                            pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform
                                            ${keepRequestsOpen ? "translate-x-5" : "translate-x-0.5"}
                                        `}
                                    />
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DispatchMenu;
