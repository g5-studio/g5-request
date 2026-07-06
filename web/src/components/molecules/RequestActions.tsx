import React from "react";
import { Icon } from "../atoms/Icon";

type ActionButtonProps = {
  onClick: () => void;
  label?: string; // For text buttons (Popup)
  icon?: string; // For icon buttons (History/Row)
  className?: string; // Base class
  variant: "accept" | "deny" | "locate" | "default";
  shortcutKey?: string;
  title?: string;
};

// Simplified internal button
const ActionBtn: React.FC<ActionButtonProps> = ({
  onClick,
  label,
  icon,
  className,
  variant,
  shortcutKey,
  title,
}) => {
  // Determine styles based on variant
  const baseStyles = "flex items-center justify-center gap-2 rounded transition-all cursor-default";
  let colorStyles = "";

  // Popup-style defaults (can be overridden by className)
  if (variant === "accept") {
    colorStyles =
      "bg-[#1c1c1f70] hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/50";
  } else if (variant === "deny") {
    colorStyles =
      "bg-[#1c1c1f70] hover:bg-red-500/10 border border-white/5 hover:border-red-500/50";
  } else if (variant === "locate") {
    colorStyles = "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20";
  }

  // Combine
  const finalClass = `cursor-pointer ${baseStyles} ${colorStyles} ${className || ""}`;

  return (
    <button className={finalClass} onClick={onClick} title={title}>
      {shortcutKey && (
        <div
          className={`flex items-center justify-center h-5 w-5 rounded text-[10px] font-bold transition-colors ${
            variant === "accept"
              ? "bg-emerald-500/20 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black"
              : variant === "deny"
                ? "bg-red-500/20 text-red-500 group-hover:bg-red-500 group-hover:text-black"
                : ""
          }`}
        >
          {shortcutKey}
        </div>
      )}

      {icon && <Icon name={icon} />}

      {label && (
        <span
          className={`text-xs font-semibold transition-colors uppercase tracking-wide ${
            variant === "accept"
              ? "group-hover:text-emerald-500"
              : variant === "deny"
                ? "group-hover:text-red-500"
                : ""
          }`}
        >
          {label}
        </span>
      )}
    </button>
  );
};

// We can export this to be used manually, or create pre-fab groups
export { ActionBtn };
