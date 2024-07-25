import { ChannelType } from "@prisma/client";
import { z } from "zod";

const ServerSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Server name must be at least 3 letters" })
    .max(50, { message: "Server name must be at most 50 letters" }),
  imageUrl: z.string().min(1, { message: "Image is required" }).url(),
});

export type ServerValiator = z.infer<typeof ServerSchema>;

export default ServerSchema;

export const ChannelSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Server name must be at least 3 letters" })
    .max(50, { message: "Server name must be at most 50 letters" })
    .refine((name) => name !== "general", {
      message: "Channel name cannot be general",
    }),

  type: z.nativeEnum(ChannelType),
});

export type ChannelValiator = z.infer<typeof ChannelSchema>;
