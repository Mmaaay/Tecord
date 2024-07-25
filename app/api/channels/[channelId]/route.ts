import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string } },
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    if (!serverId) {
      return new NextResponse("Server not found", { status: 404 });
    }
    if (!params.channelId) {
      return new NextResponse("Channel not found", { status: 404 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        member: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.Admin, MemberRole.Modenator],
            },
          },
        },
      },
      data: {
        channel: {
          delete: {
            id: params.channelId,
            name: {
              not: "  general",
            },
          },
        },
      },
    });
    return NextResponse.json(server);
  } catch (error) {
    console.log(error);
    return new NextResponse("An error occurred", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string } },
) {
  try {
    const profile = await currentProfile();
    const { name, type } = await req.json();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    if (!serverId) {
      return new NextResponse("Server not found", { status: 404 });
    }
    if (!params.channelId) {
      return new NextResponse("Channel not found", { status: 404 });
    }
    if (name.toLowerCase() === "general") {
      return new NextResponse("Invalid channel name", { status: 400 });
    }
    const server = await db.server.update({
      where: {
        id: serverId,
        member: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.Admin, MemberRole.Modenator],
            },
          },
        },
      },
      data: {
        channel: {
          update: {
            where: {
              id: params.channelId,
              NOT: {
                name: "general",
              },
            },
            data: {
              name,
              type,
            },
          },
        },
      },
    });
    return NextResponse.json(server);
  } catch (error) {
    console.log(error);
    return new NextResponse("An error occurred", { status: 500 });
  }
}
6