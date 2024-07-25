"use client";
import { cn } from "@/lib/utils";
import { Channel, ChannelType, MemberRole, Server } from "@prisma/client";
import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FC } from "react";
import ActionsTooltip from "../ActionsTooltip";
import { ModalType, useModal } from "@/hooks/use-modal-store";

interface ServerChannelProps {
  channel: Channel;
  server: Server;
  role?: MemberRole;
}

const ServerChannel: FC<ServerChannelProps> = ({ channel, server, role }) => {
  const { onOpen } = useModal();
  const params = useParams();
  const router = useRouter();
  const IconMap = {
    [ChannelType.Text]: Hash,
    [ChannelType.Audio]: Mic,
    [ChannelType.Video]: Video,
  };

  const onClick = () => {
    router.push(`/servers/${params?.serverId}/channels/${channel.id}`);
  };

  const onActions = (e: React.MouseEvent, action: ModalType) => {
    e?.stopPropagation();
    onOpen(action, { server, channel });
  };

  const Icon = IconMap[channel.type];
  return (
    <button
      onClick={() => {
        onClick();
      }}
      className={cn(
        "py group mb-1 flex w-full items-center gap-x-2 rounded-md p-2 transition hover:bg-zinc-700/20 dark:hover:bg-zinc-700",
        params?.channelId === channel.id && "bg-primary dark:bg-slate-600",
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0 text-zinc-500 dark:text-zinc-400" />
      <p
        className={cn(
          "line-clamp-1 text-sm font-semibold text-zinc-500 transition group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300",
          params?.channelId === channel.id &&
            "text-primary dark:text-zinc-200 dark:group-hover:text-white",
        )}
      >
        {channel.name}
      </p>
      {channel.name !== "general" && role !== MemberRole.Guest && (
        <div className="ml-auto flex items-center gap-x-2">
          <ActionsTooltip label="Edit">
            <Edit
              onClick={(e) => onActions(e, "editChannel")}
              className="hover: hidden h-4 w-4 text-zinc-500 hover:text-zinc-600 group-hover:block dark:text-zinc-400 dark:hover:text-zinc-300"
            />
          </ActionsTooltip>
          <ActionsTooltip label="Delete">
            <Trash
              onClick={(e) => onActions(e, "deleteChannel")}
              className="hover: hidden h-4 w-4 text-zinc-500 hover:text-zinc-600 group-hover:block dark:text-zinc-400 dark:hover:text-zinc-300"
            />
          </ActionsTooltip>
        </div>
      )}
      {channel.name === "general" && (
        <Lock className="ml-auto h-4 w-4 text-zinc-500 dark:text-zinc-400" />
      )}
    </button>
  );
};

export default ServerChannel;
