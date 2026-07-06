import React from "react";
import { Badge } from "../ui/badge";
import { esc } from "../../utils/themeUtils";
import { Icon } from "../atoms/Icon";

type RequestExtrasProps = {
  extras: unknown;
};

interface ExtraDetailed {
  icon?: string;
  name?: string;
  value: unknown;
}

export const RequestExtras: React.FC<RequestExtrasProps> = ({ extras }) => {
  if (!extras) return null;

  let extrasObj: unknown = null;
  try {
    extrasObj = typeof extras === "string" ? JSON.parse(extras) : extras;
  } catch (e) {
    extrasObj = null;
  }

  const renderSimpleItem = (
    icon: string | undefined,
    name: string | undefined,
    value: unknown,
    idx: number | string,
  ) => {
    if (value === null || value === undefined || value === "") return null;
    return (
      <Badge
        variant="secondary"
        className="text-[10px] min-h-[20px] h-auto py-0.5 bg-white/5 hover:bg-white/10 text-muted-foreground gap-1.5 font-normal whitespace-normal break-all text-left h-fit"
        key={idx}
      >
        <Icon name={icon} />
        <span className="font-semibold text-white/70 whitespace-nowrap">{esc(name || "")}:</span>
        <span>{esc(String(value))}</span>
      </Badge>
    );
  };

  if (Array.isArray(extrasObj)) {
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        {(extrasObj as unknown[]).map((item, idx) => {
          if (!item || typeof item !== "object") return null;
          const { icon, name, value } = item as ExtraDetailed;
          return renderSimpleItem(icon, name, value, idx);
        })}
      </div>
    );
  }

  if (extrasObj && typeof extrasObj === "object") {
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        {Object.entries(extrasObj as Record<string, unknown>).map(([k, v], idx) => {
          // If v is the detailed object structure {icon, name, value}
          if (v && typeof v === "object" && (v as ExtraDetailed).value !== undefined) {
            const detailed = v as ExtraDetailed;
            return renderSimpleItem(detailed.icon || k, detailed.name || k, detailed.value, idx);
          }

          // If v is simple value
          if (v === null || v === undefined || v === "") return null;
          if (typeof v === "object") return null; // Skip unknown objects to avoid [object Object]

          return (
            <Badge
              variant="secondary"
              className="text-[10px] min-h-[20px] h-auto py-0.5 bg-white/5 hover:bg-white/10 text-muted-foreground gap-1.5 font-normal whitespace-normal break-all text-left h-fit"
              key={idx}
            >
              <Icon name={k} />
              <span className="font-semibold text-white/70 whitespace-nowrap">{esc(k)}:</span>
              <span>{esc(String(v))}</span>
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
      {esc(typeof extras === "string" ? extras : JSON.stringify(extras))}
    </div>
  );
};
