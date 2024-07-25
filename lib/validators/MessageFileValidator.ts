import { ChannelType } from "@prisma/client";
import { z } from "zod";

const MessageFileSchema = z.object({
  fileUrl: z.string().min(1, { message: "Attachment is required" }).url(),
});

export type MessageFileValidator = z.infer<typeof MessageFileSchema>;

export default MessageFileSchema;
