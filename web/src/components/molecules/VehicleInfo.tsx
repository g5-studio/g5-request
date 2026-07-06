import React from "react";
import { Icon } from "../atoms/Icon";
import { esc } from "../../utils/themeUtils";

type VehicleInfoProps = {
  vehicle?: {
    plate: string;
    model: string;
    color?: string;
    class?: string;
  };
};

export const VehicleInfo: React.FC<VehicleInfoProps> = ({ vehicle }) => {
  if (!vehicle) return null;

  return (
    <div className="mt-2 pt-2 border-t border-white/5 space-y-1.5 animation-slide-up">
      <div className="text-[10px] uppercase text-muted-foreground font-bold flex items-center gap-1">
        <Icon name="car" />
        <span>Vehicle Information</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/[0.03] p-1.5 rounded border border-white/5">
          <div className="text-[9px] text-muted-foreground uppercase mb-0.5">Plate</div>
          <div className="text-[11px] font-mono font-bold text-white tracking-widest">
            {vehicle.plate}
          </div>
        </div>

        <div className="bg-white/[0.03] p-1.5 rounded border border-white/5">
          <div className="text-[9px] text-muted-foreground uppercase mb-0.5">Model</div>
          <div className="text-[11px] font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis">
            {esc(vehicle.model)}
          </div>
        </div>
      </div>

      {vehicle.color && (
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-white/[0.02] p-1 rounded">
          <span className="opacity-50">Color:</span>
          <span className="text-white/80">{esc(vehicle.color)}</span>
        </div>
      )}
    </div>
  );
};
