import React from "react";
import { Badge } from "../ui/badge";
import { Icon } from "../atoms/Icon";
import { esc, getContrastColor } from "../../utils/themeUtils";
import { RequestData } from "../../types";
import { useTheme } from "../../contexts/ThemeContext";

type RequestHeaderProps = {
  req: RequestData;
};

export const RequestHeader: React.FC<RequestHeaderProps> = ({ req }) => {
  const { themes } = useTheme();

  const themeType = req.themeType || "default";
  const cardTheme = themes[themeType] || themes["default"];

  // Calculate colors
  const tagBg = req.tagColor || cardTheme?.tag_bg;
  const tagFg = req.tagColor
    ? getContrastColor(req.tagColor)
    : cardTheme?.tag_fg || (tagBg ? getContrastColor(tagBg) : undefined);

  const codeBg = req.codeColor || cardTheme?.code_bg;
  const codeFg = req.codeColor
    ? getContrastColor(req.codeColor)
    : cardTheme?.code_fg || (codeBg ? getContrastColor(codeBg) : undefined);

  return (
    <div className="flex items-center gap-2">
      {req.titleIcon && (
        <Icon
          name={req.titleIcon}
          className="text-xs"
          style={{ color: req.titleIconColor || undefined }}
        />
      )}

      {req.code && (
        <Badge
          className="rounded-[4px] px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-wider border-0 whitespace-nowrap"
          style={{
            backgroundColor: codeBg || "rgba(255,255,255,0.1)",
            color: codeFg || "#fff",
          }}
        >
          {esc(req.code)}
        </Badge>
      )}

      {(req.tagText || req.tag) && (
        <Badge
          className="rounded-[4px] px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-wider border-0 whitespace-nowrap"
          style={{
            backgroundColor: tagBg || "rgba(255,255,255,0.1)",
            color: tagFg || "#fff",
          }}
        >
          {esc(req.tagText || undefined) || `#${esc(req.tag || undefined)}`}
        </Badge>
      )}

      <span className="font-bold text-xs text-white leading-none truncate max-w-[180px]">
        {esc(req.title || undefined)}
      </span>
    </div>
  );
};
