import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { nextApiResponseServerIo } from "@/types";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { messageId: string } },
  res: nextApiResponseServerIo,
) {
  try {
    const { messageId } = params;
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    const channelId = searchParams.get("channelId");
    if (!serverId || !channelId) {
      return new NextResponse("Bad Request", { status: 400 });
    }
    const { content } = await req.json();
    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        member: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        member: true,
      },
    });

    if (!server) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: server.id,
      },
    });

    if (!channel) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const member = server.member.find((m) => m.profileId === profile.id);
    if (!member) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    let message = await db.message.findFirst({
      where: {
        id: messageId as string,
        channelId: channel.id,
      },
      include: {
        member: { include: { profile: true } },
      },
    });

    if (!message || message.deleted) {
      return new NextResponse("Not Found", { status: 404 });
    }
    const isMessageOwner = message.memberId === member.id;

    const canModify = isMessageOwner || !message.deleted;
    if (!canModify) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    if (!isMessageOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    message = await db.message.update({
      where: {
        id: messageId as string,
      },
      data: {
        content: content,
      },
      include: {
        member: { include: { profile: true } },
      },
    });

    const updateKey = `chat:${channel.id}:messages:update`;

    return NextResponse.json(message);
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { messageId: string } },
  res: nextApiResponseServerIo,
) {
  try {
    const { messageId } = params;
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    const channelId = searchParams.get("channelId");
    if (!serverId || !channelId) {
      return new NextResponse("Bad Request", { status: 400 });
    }
    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        member: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        member: true,
      },
    });

    if (!server) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: server.id,
      },
    });

    if (!channel) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const member = server.member.find((m) => m.profileId === profile.id);
    if (!member) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    let message = await db.message.findFirst({
      where: {
        id: messageId as string,
        channelId: channel.id,
      },
      include: {
        member: { include: { profile: true } },
      },
    });

    if (!message || message.deleted) {
      return new NextResponse("Not Found", { status: 404 });
    }
    const isMessageOwner = message.memberId === member.id;
    const isAdmin = member.role === MemberRole.Admin;
    const isModerator = member.role === MemberRole.Modenator;
    const canDelete =
      isMessageOwner || !message.deleted || isAdmin || isModerator;
    if (!canDelete) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    message = await db.message.update({
      where: {
        id: messageId as string,
        channelId: channel.id,
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

    return NextResponse.json(message);
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
