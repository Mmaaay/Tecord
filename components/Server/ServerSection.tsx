"use client";
import { ServerWithMembersWithProfiles } from "@/types";
import { ChannelType, MemberRole } from "@prisma/client";
import { FC } from "react";
import ActionsTooltip from "../ActionsTooltip";
import { Plus, Settings } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";

interface ServerSectionProps {
  label: string;
  role?: MemberRole;
  sectionType: "channel" | "member";
  channelType?: ChannelType;
  server?: ServerWithMembersWithProfiles;
}

const ServerSection: FC<ServerSectionProps> = ({
  channelType,
  label,
  sectionType,
  role,
  server,
}) => {
  const { onOpen } = useModal();
  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      {role !== MemberRole.Guest && sectionType === "channel" && (
        <ActionsTooltip align="center" label="Create Channel" side="top">
          <button
            onClick={() => {
              onOpen("createChannel", { channelType });
            }}
            className="text-zinc-500 transition hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            <Plus className="h-4 w-4" />
          </button>
        </ActionsTooltip>
      )}
      {role === MemberRole.Admin && sectionType === "member" && (
        <ActionsTooltip align="center" label="Manage Members" side="top">
          <button
            onClick={() => {
              onOpen("members", { server });
            }}
            className="text-zinc-500 transition hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            <Settings className="h-4 w-4" />
          </button>
        </ActionsTooltip>
      )}
    </div>
  );
};

export default ServerSection;
