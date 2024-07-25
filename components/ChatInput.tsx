"use client";
import { chatSchema, chatType } from "@/lib/validators/ChatValidators";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Plus, Smile } from "lucide-react";
import { Input } from "./ui/input";
import qs from "query-string";
import axios from "axios";
import { useModal } from "@/hooks/use-modal-store";
import EmojiPicker from "./EmojiPicker";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "./providers/socket-provider";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { socket } from "@/app/socket";

interface ChatInputProps {
  apiUrl: string;
  query: Record<string, any>;
  name: string;
  type: "channel" | "conversation";
}

const ChatInput: FC<ChatInputProps> = ({ apiUrl, name, query, type }) => {
  const form = useForm<chatType>({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      content: "",
    },
  });
  const addKey = `chat:${query.channelId}:message`;

  const router = useRouter();
  const params = useParams();
  const { onOpen } = useModal();
  const loading = form.formState.isSubmitting;

  const onSubmit = async (value: chatType) => {
    try {
      const url = qs.stringifyUrl({
        url: apiUrl,
        query,
      });

      const message = await axios.post(url, value);
      socket.emit("add", message.data, addKey);
      form.reset();
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative p-4 pb-6">
                  <button
                    type="button"
                    onClick={() => {
                      onOpen("messageFile", { apiUrl, query });
                    }}
                    className="absolute left-8 top-7 flex h-[24px] w-[24px] items-center justify-center rounded-full bg-zinc-500 p-1 hover:bg-zinc-600 dark:bg-zinc-400 dark:hover:bg-zinc-300"
                  >
                    <Plus className="text-white dark:text-[#313338]" />
                  </button>
                  <Input
                    disabled={loading}
                    className="border-0 border-none bg-zinc-200/90 px-14 py-6 text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-zinc-700/75 dark:text-zinc-200"
                    {...field}
                  />
                  <div className="absolute right-8 top-7">
                    <EmojiPicker
                      onChange={(emoji: string) =>
                        field.onChange(`${field.value}${emoji}`)
                      }
                    />
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default ChatInput;
