"use client";
import { Plus } from "lucide-react";
import { FC } from "react";
import ActionsTooltip from "./ActionsTooltip";
import { useModal } from "@/hooks/use-modal-store";

interface NavigationActionProps {}

const NavigationAction: FC<NavigationActionProps> = ({}) => {
  const { onOpen } = useModal();
  return (
    <div>
      <ActionsTooltip side="right" align="center" label="Add a server">
        <button
          onClick={() => {
            onOpen("createServer");
          }}
          title="d"
          className="group flex items-center"
        >
          <div className="mx-3 flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-[24px] bg-background transition-all group-hover:rounded-[16px] group-hover:bg-emerald-500 dark:bg-neutral-700">
            <Plus
              className="text-emerald-500 transition group-hover:text-white"
              size={25}
            />
          </div>
        </button>
      </ActionsTooltip>
    </div>
  );
};

export default NavigationAction;
