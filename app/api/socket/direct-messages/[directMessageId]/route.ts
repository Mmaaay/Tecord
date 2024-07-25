import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { nextApiResponseServerIo } from "@/types";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { directMessageId: string } },
  res: nextApiResponseServerIo,
) {
  try {
    const { directMessageId } = params;
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized: User profile not found", {
        status: 401,
      });
    }
    if (!directMessageId) {
      return new NextResponse(
        "Bad Request: Missing directMessageId parameter",
        { status: 400 },
      );
    }
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    if (!conversationId) {
      return new NextResponse("Bad Request: Missing conversationId parameter", {
        status: 400,
      });
    }
    const { content } = await req.json();

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          {
            memberOne: { profileId: profile.id },
          },
          {
            memberTwo: { profileId: profile.id },
          },
        ],
      },
      include: {
        memberOne: { include: { profile: true } },
        memberTwo: { include: { profile: true } },
      },
    });

    if (!conversation) {
      return new NextResponse("Not Found: Conversation not found", {
        status: 404,
      });
    }
    const member =
      conversation.memberOne.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;
    if (!member) {
      return new NextResponse("Forbidden: Member not found", { status: 403 });
    }

    let directMessage = await db.directMessage.findFirst({
      where: {
        id: directMessageId as string,
        conversationId: conversationId,
      },
      include: {
        member: { include: { profile: true } },
      },
    });

    if (!directMessage) {
      return new NextResponse("Not Found: Direct message not found", {
        status: 404,
      });
    }
    const isMessageOwner = directMessage.memberId === member.id;

    const canModify = isMessageOwner || !directMessage.deleted;
    if (!canModify) {
      return new NextResponse("Forbidden: Cannot modify the direct message 1", {
        status: 403,
      });
    }
    if (!isMessageOwner) {
      return new NextResponse(
        "Forbidden: Only the message owner can modify the direct message",
        { status: 403 },
      );
    }

    directMessage = await db.directMessage.update({
      where: {
        id: directMessageId as string,
      },
      data: {
        content: content,
      },
      include: {
        member: { include: { profile: true } },
      },
    });

    return NextResponse.json(directMessage);
  } catch (error) {
    console.error("PATCH error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { directMessageId: string } },
  res: nextApiResponseServerIo,
) {
  try {
    const { directMessageId } = params;
    if (!directMessageId) {
      return new NextResponse(
        "Bad Request: Missing directMessageId parameter",
        { status: 400 },
      );
    }

    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized: User profile not found", {
        status: 401,
      });
    }
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return new NextResponse("Bad Request: Missing conversationId parameter", {
        status: 400,
      });
    }
    console.log(profile.id);

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          {
            memberOne: { profileId: profile.id },
          },
          {
            memberTwo: { profileId: profile.id },
          },
        ],
      },
      include: {
        memberOne: { include: { profile: true } },
        memberTwo: { include: { profile: true } },
      },
    });

    if (!conversation) {
      return new NextResponse("Not Found: Conversation not found", {
        status: 404,
      });
    }

    const member =
      conversation.memberOne.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;
    if (!member) {
      return new NextResponse("Forbidden: Member not found", { status: 403 });
    }

    let directMessage = await db.directMessage.findFirst({
      where: {
        id: directMessageId as string,
        conversationId: conversationId,
      },
      include: {
        member: { include: { profile: true } },
      },
    });

    if (!directMessage) {
      return new NextResponse("Not Found: Direct message not found", {
        status: 404,
      });
    }
    const isMessageOwner = directMessage.memberId === member.id;
    const isAdmin = member.role === MemberRole.Admin;
    const isModerator = member.role === MemberRole.Modenator;
    const canDelete =
      isMessageOwner || !directMessage.deleted || isAdmin || isModerator;
    if (!canDelete) {
      return new NextResponse("Forbidden: Cannot delete the direct message", {
        status: 403,
      });
    }

    directMessage = await db.directMessage.update({
      where: {
        id: directMessageId as string,
      },
      data: {
        fileUrl: null,
        deleted: true,
        content: "This message has been deleted.",
      },
      include: {
        member: { include: { profile: true } },
      },
    });

    return NextResponse.json(directMessage);
  } catch (error) {
    console.error("DELETE error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
