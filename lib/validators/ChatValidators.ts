import { z } from "zod";

export const chatSchema = z.object({
  content: z.string().min(1),
});

export type chatType = z.infer<typeof chatSchema>;
