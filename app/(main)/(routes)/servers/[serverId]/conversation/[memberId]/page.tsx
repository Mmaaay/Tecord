import ChatHeader from "@/components/Chat/ChatHeader";
import ChatMessages from "@/components/Chat/ChatMessages";
import ChatInput from "@/components/ChatInput";
import MediaRoom from "@/components/mediaRoom";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FC } from "react";

interface pageProps {
  params: {
    serverId: string;
    memberId: string;
  };
  searchParams: { video?: boolean };
}

const page: FC<pageProps> = async ({
  params: { memberId, serverId },
  searchParams,
}) => {
  const profile = await currentProfile();
  if (!profile) {
    return auth().redirectToSignIn();
  }

  const currentMember = await db.member.findFirst({
    where: { serverId: serverId, profileId: profile.id },
    include: { profile: true },
  });
  if (!currentMember) {
    redirect(`/`);
  }

  const conversation = await getOrCreateConversation(
    currentMember.id,
    memberId,
  );

  if (!conversation) {
    return redirect(`/servers/${serverId}`);
  }

  const { memberOne, memberTwo } = conversation;
  const otherMember =
    memberOne.profileId === profile.id ? memberTwo : memberOne;
  return (
    <div className="flex h-screen min-h-screen flex-col bg-white dark:bg-[#313338]">
      <ChatHeader
        name={otherMember.profile.name}
        serverId={serverId}
        type="conversation"
        imageUrl={otherMember.profile.imageUrl}
      />
      {searchParams.video && (
        <MediaRoom chatId={conversation.id} video={true} audio={true} />
      )}
      {!searchParams.video && (
        <>
          <ChatMessages
            member={currentMember}
            name={otherMember.profile.name}
            chatId={conversation.id}
            type="conversation"
            apiUrl="/api/direct-messages"
            paramKey="conversationId"
            paramValue={conversation.id}
            socketUrl="/api/socket/direct-messages"
            socketQuery={{ conversationId: conversation.id }}
          />
          <ChatInput
            name={otherMember.profile.name}
            type="conversation"
            apiUrl="/api/socket/direct-messages"
            query={{ conversationId: conversation.id }}
          />
        </>
      )}
    </div>
  );
};

export default page;
