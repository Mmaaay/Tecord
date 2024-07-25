"use client";
import { Member, MemberRole, Profile } from "@prisma/client";
import { FC, useEffect, useState } from "react";
import UserAvatar from "../UserAvatar";
import ActionsTooltip from "../ActionsTooltip";
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useRouter, useParams } from "next/navigation";
import z from "zod";
import axios from "axios";
import qs from "query-string";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { socket } from "@/app/socket";

interface ChatItemProps {
  id: string;
  content: string;
  member: Member & { profile: Profile };
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentMember: Member & { profile: Profile };
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
  currentlyEditingId: string | null;
  setCurrentlyEditingId: (id: string | null) => void;
  updateKey: string;
}

const roleIconMap = {
  Guest: null,
  Admin: <ShieldAlert className="ml-2 h-4 w-4 text-rose-500" />,
  Modenator: <ShieldCheck className="ml-2 h-4 w-4 text-indigo-500" />,
};

const formSchema = z.object({
  content: z.string().min(1),
});

const ChatItem: FC<ChatItemProps> = ({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  socketUrl,
  socketQuery,
  currentlyEditingId,
  setCurrentlyEditingId,
  updateKey,
}) => {
  const isEditing = currentlyEditingId === id;
  const { onOpen } = useModal();
  const params = useParams();
  const router = useRouter();
  const onMemberClick = () => {
    if (member.id === currentMember.id) {
      return;
    }
    router.push(`/servers/${params.serverId}/conversations/${member.id}`);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery,
      });
      const message = await axios.patch(url, values);

      socket.emit("update", message.data, updateKey);

      setCurrentlyEditingId(null);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (isEditing) {
      form.reset({ content });
    }
  }, [isEditing, content, form]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        setCurrentlyEditingId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setCurrentlyEditingId]);
  console.log(currentMember, member);
  const fileType = fileUrl?.split(".").pop();
  const isAdmin = currentMember.role === MemberRole.Admin;
  const isModerator = currentMember.role === MemberRole.Modenator;
  const isOwner = currentMember.id === member.id;
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !deleted && isOwner && !fileUrl;
  const isPdf = fileType === "pdf" || (fileType === "PDF" && fileUrl);
  const isImage = fileType !== "pdf" && fileType !== "PDF" && fileUrl;

  return (
    <div className="group relative flex w-full items-center justify-end p-4 transition hover:bg-black/5">
      <div className="group flex w-full items-center gap-x-2">
        <div
          onClick={onMemberClick}
          className="cursor-pointer transition hover:drop-shadow-md"
        >
          <UserAvatar src={member.profile.imageUrl} />
        </div>
        <div className="flex w-full flex-col">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p
                onClick={onMemberClick}
                className={cn(
                  "over:underline cursor-pointer text-sm",
                  member.id === currentMember.id && "font-bold",
                )}
              >
                {member.profile.name}
              </p>
              <ActionsTooltip label={member.role}>
                {roleIconMap[member.role as MemberRole]}
              </ActionsTooltip>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>
          {isImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener norefrerrer"
              className="relative mt-2 flex aspect-square h-48 w-48 items-center overflow-hidden rounded-md border bg-secondary"
            >
              <Image
                src={fileUrl}
                alt={content}
                fill
                className="object-cover"
              />
            </a>
          )}
          {isPdf && (
            <div className="relative mt-2 flex items-center rounded-md bg-background/10 p-2">
              <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
              <a
                href={fileUrl?.toString()}
                target="_blank"
                rel="noopenner noreferrer"
                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400"
              >
                {fileUrl?.substring(fileUrl.lastIndexOf("/") + 1)}
              </a>
            </div>
          )}
          {!fileUrl && !isEditing && (
            <p
              className={cn(
                "text-sm text-zinc-600 dark:text-zinc-300",
                deleted &&
                  "mt-1 text-xs italic text-zinc-500 dark:text-zinc-400",
              )}
            >
              {content}
              {!deleted && isUpdated && (
                <span className="ml-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                  is Edited
                </span>
              )}
            </p>
          )}
          {!fileUrl && isEditing && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full items-center gap-x-2 pt-2"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            disabled={isLoading}
                            className="border-0 border-none bg-zinc-200/90 p-2 text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-zinc-700/75 dark:text-zinc-200"
                            placeholder="Edited Message"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button disabled={isLoading} size="sm" variant="primary">
                  Save
                </Button>
              </form>
              <span className="mt-1 text-[10px] text-zinc-400">
                Press escape to cancel, Enter to save
              </span>
            </Form>
          )}
        </div>
      </div>
      {canDeleteMessage && (
        <div className="absolute -top-2 right-5 hidden items-center gap-x-2 rounded-sm border bg-white p-1 group-hover:flex dark:bg-zinc-800">
          {canEditMessage && (
            <ActionsTooltip label="Edit">
              <Edit
                onClick={async () => {
                  setCurrentlyEditingId(id);
                }}
                className="ml-auto h-4 w-4 cursor-pointer text-zinc-500 transition hover:text-zinc-600 dark:hover:text-zinc-300"
              />
            </ActionsTooltip>
          )}
          <ActionsTooltip label="Delete">
            <Trash
              onClick={() =>
                onOpen("deleteMessage", {
                  apiUrl: `${socketUrl}/${id}`,
                  query: socketQuery,
                  updateKey: updateKey,
                })
              }
              className="ml-auto h-4 w-4 cursor-pointer text-zinc-500 transition hover:text-zinc-600 dark:hover:text-zinc-300"
            />
          </ActionsTooltip>
        </div>
      )}
    </div>
  );
};

export default ChatItem;
