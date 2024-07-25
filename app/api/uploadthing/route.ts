import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";
import { UTApi } from "uploadthing/server";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,

  // Apply an (optional) custom config:
  // config: { ... },
});

const utapi = new UTApi();
export async function DELETE(req: Request) {
  try {
    const data = await req.json();
    await utapi.deleteFiles(data.url.substring(data.url.lastIndexOf("/") + 1));
    return NextResponse.json({ message: "File deleted" });
  } catch (error) {
    console.log(error);
    return new NextResponse("An error occurred", { status: 500 });
  }
}
