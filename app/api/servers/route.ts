import { currentProfile } from "@/lib/current-profile";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

export async function POST(req: Request, res: Response) {
  try {
    const { name, imageUrl } = await req.json();
    console.log(name);
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const server = await db.server.create({
      data: {
        profileId: profile.id,
        name: name,
        imageUrl,
        inviteCode: uuidv4(),
        channel: {
          create: {
            name: "general",
            profileId: profile.id,
            type: "Text",
          },
        },
        member: {
          create: { profileId: profile.id, role: MemberRole.Admin },
        },
      },
    });
    return NextResponse.json(server);
  } catch (error) {
    console.log("{SERVER HOST ERROR}", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
