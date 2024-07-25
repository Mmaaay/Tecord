import { socket } from "@/app/socket";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { nextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: nextApiResponseServerIo) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const profile = await currentProfile();
    const { content, fileUrl } = await req.json();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    const channelId = searchParams.get("channelId");

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!serverId) {
      return res.status(400).json({ error: "Server ID is required" });
    }
    if (!channelId) {
      return res.status(400).json({ error: "Channel ID is required" });
    }
    const server = await db.server.findFirst({
      where: {
        id: serverId,
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
      return res.status(404).json({ error: "Server not found" });
    }
    const channel = await db.channel.findFirst({
      where: {
        id: channelId,
        serverId: server.id,
      },
    });
    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    const member = server.member.find((m) => m.profileId === profile.id);
    if (!member) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        channelId: channel.id,
        memberId: member.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    // const channelKey = `chat:${channelId}:messages`;
    // socket?.emit("message1", { data: message });
    return NextResponse.json(message);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
