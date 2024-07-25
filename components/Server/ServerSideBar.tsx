import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType, MemberRole, Profile } from "@prisma/client";
import { redirect } from "next/navigation";
import { FC } from "react";
import ServerHeader from "./ServerHeader";
import { ScrollArea } from "../ui/scroll-area";
import ServerSearch from "./ServerSearch";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { Separator } from "../ui/separator";
import ServerSection from "./ServerSection";
import ServerChannel from "./ServerChannel";
import ServerMember from "../ServerMember";

interface ServerSideBarProps {
  serverId: string;
}

const iconMap = {
  [ChannelType.Text]: <Hash className="mr-2 h-4 w-4" />,
  [ChannelType.Audio]: <Mic className="mr-2 h-4 w-4" />,
  [ChannelType.Video]: <Video className="mr-2 h-4 w-4" />,
};

const roleIconMap = {
  [MemberRole.Guest]: null,
  [MemberRole.Modenator]: (
    <ShieldCheck className="H-4 MR-2 W-4 text-indigo-500" />
  ),
  [MemberRole.Admin]: <ShieldAlert className="mr-2 h-4 w-4 text-rose-500" />,
};

const ServerSideBar: FC<ServerSideBarProps> = async ({ serverId }) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }
  const server = await db.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channel: {
        orderBy: {
          createdAt: "asc",
        },
      },
      member: {
        include: {
          profile: true,
        },
        orderBy: {
          role: "asc",
        },
      },
    },
  });

  const textChannels = server?.channel.filter(
    (channel) => channel.type === ChannelType.Text,
  );
  const audioChannels = server?.channel.filter(
    (channel) => channel.type === ChannelType.Audio,
  );

  const videoChannels = server?.channel.filter(
    (channel) => channel.type === ChannelType.Video,
  );

  const members = server?.member.filter(
    (member) => member.profileId !== profile.id,
  );

  if (!server) {
    return redirect("/");
  }

  const role = server?.member.find(
    (member) => member.profileId === profile.id,
  )?.role;

  return (
    <div className="flex h-full w-full flex-col bg-[#F2F3F5] text-primary dark:bg-[#2B2D31]">
      <ServerHeader server={server} role={role} />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: textChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Voice Channels",
                type: "channel",
                data: audioChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Video Channels",
                type: "channel",
                data: videoChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Members",
                type: "member",
                data: members?.map((member) => ({
                  id: member.id,
                  name: member.profile.name,
                  icon: roleIconMap[member.role],
                })),
              },
            ]}
          />
        </div>
        <Separator className="my-2 rounded-md bg-zinc-200 dark:bg-zinc-700" />
        {!!textChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channel"
              channelType={ChannelType.Text}
              role={role}
              label="Text Channels"
            />
            <div className="space-y-[2px]">
              {textChannels?.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}
        {!!audioChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channel"
              channelType={ChannelType.Audio}
              role={role}
              label="Voice Channels"
            />
            <div className="space-y-[2px]">
              {audioChannels?.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}
        <div className="space-y-[2px]">
          {!!videoChannels?.length && (
            <div className="mb-2">
              <ServerSection
                sectionType="channel"
                channelType={ChannelType.Video}
                role={role}
                label="Video Channels"
              />
              {videoChannels?.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={role}
                />
              ))}
            </div>
          )}
        </div>
        {!!members?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="member"
              role={role}
              label="Members"
              server={server}
            />
            <div className="space-y-[2px]">
              {members?.map((member) => (
                <ServerMember member={member} server={server} key={member.id} />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ServerSideBar;
