"use client";
import { cn } from "@/lib/utils";
import { Member, MemberRole, Profile, Server } from "@prisma/client";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FC } from "react";
import UserAvatar from "./UserAvatar";

interface ServerMemberProps {
  member: Member & { profile: Profile };
  server: Server;
}

const roleIcon = {
  [MemberRole.Guest]: null,
  [MemberRole.Modenator]: (
    <ShieldCheck className="ml-2 h-4 w-4 text-indigo-500" />
  ),
  [MemberRole.Admin]: <ShieldAlert className="ml-2 h-4 w-4 text-rose-500" />,
};

const ServerMember: FC<ServerMemberProps> = ({ member, server }) => {
  const params = useParams();
  const router = useRouter();

  const icon = roleIcon[member.role];
  const onClick = () => {
    router.push(`/servers/${params?.serverId}/conversation/${member.id}`);
  };
  return (
    <button
      onClick={() => {
        onClick();
      }}
      className={cn(
        "group mb-1 flex w-full items-center gap-x-2 rounded-md px-2 py-2 transition hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50",
        params?.memberId === member.id && "dark:bg-zinc-700- bg-zinc-700/20",
      )}
    >
      <UserAvatar
        src={member.profile.imageUrl}
        className="md:ا-8 ةي:ص-8 h-8 w-8"
      />
      <p
        className={cn(
          "text-sm font-semibold text-zinc-500 transition group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300",
          params?.memberId === member.id &&
            "text-primary dark:text-zinc-200 dark:group-hover:text-white",
        )}
      >
        {member.profile.name}
      </p>
      {icon}
    </button>
  );
};

export default ServerMember;
