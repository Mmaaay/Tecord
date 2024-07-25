import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } },
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { name, imageUrl } = await req.json();
    const server = await db.server.findUnique({
      where: {
        id: params.serverId,
      },
    });
    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }
    const updatedServer = await db.server.update({
      where: {
        id: params.serverId,
      },
      data: {
        name: name,
        imageUrl: imageUrl,
      },
    });

    return NextResponse.json(updatedServer);
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { serverId: string } },
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!params.serverId) {
      return new NextResponse("Server Not Found", { status: 404 });
    }
    const server = await db.server.delete({
      where: {
        id: params.serverId,
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log(error);
  }
}
