"use client";
import { FC } from "react";
import qs from "query-string";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Video, VideoOff } from "lucide-react";
import ActionsTooltip from "../ActionsTooltip";
import { Button } from "../ui/button";
interface ChatVideoButtonProps {}

const ChatVideoButton: FC<ChatVideoButtonProps> = ({}) => {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const isVideo = searchParams?.get("video");

  const Icon = isVideo ? VideoOff : Video;
  const tooltiplabel = isVideo ? "Turn off video" : "Turn on video";
  const onClick = () => {
    const url = qs.stringifyUrl(
      {
        url: pathName || "",
        query: {
          video: isVideo ? undefined : true,
        },
      },
      { skipNull: true },
    );

    router.push(url);
  };
  return (
    <ActionsTooltip side="bottom" label={tooltiplabel}>
      <button onClick={onClick} className="tra hover:opacity75 mr-4 transition">
        <Icon className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
      </button>
    </ActionsTooltip>
  );
};

export default ChatVideoButton;
