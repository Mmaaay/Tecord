"use client";

import Image from "next/image";

import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import ActionsTooltip from "@/components/ActionsTooltip";

import { FC } from "react";

interface NavigationItemProps {
  id: string;
  imageUrl: string;
  name: string;
}

const NavigationItem: FC<NavigationItemProps> = ({ id, imageUrl, name }) => {
  const params = useParams();
  const router = useRouter();
  const onClick = () => {
    router.push(`/servers/${id}`);
  };
  return (
    <ActionsTooltip side="right" align="center" label={name}>
      <button
        title="d"
        onClick={() => {
          onClick();
        }}
        className="group relative flex items-center justify-center"
      >
        <div
          className={cn(
            "absolute left-0 w-[4px] rounded-r-full bg-primary transition-all",
            params.serverId !== id && "group-hover:h-[20px]",
            params.serverId === id ? "h-[36px]" : "h-[8px]",
          )}
        />
        <div
          className={cn(
            "group relative mx-3 flex h-[48px] w-[48px] overflow-hidden rounded-[24px] transition-all group-hover:rounded-[16px]",
            params?.serverId === id &&
              "rounded-[16px] bg-primary/10 text-primary",
          )}
        >
          <Image fill src={imageUrl} alt="channel" />
        </div>
      </button>
    </ActionsTooltip>
  );
};

export default NavigationItem;
