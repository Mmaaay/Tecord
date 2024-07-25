import { socket } from "@/app/socket";
import { Member, Message, Profile } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { FC, useEffect } from "react";

interface chatSocketProps {
  addKey: string;
  updateKey: string;
  queryKey: string;
}

type MessageWithMemeberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
}: chatSocketProps) => {
  const queryClient = useQueryClient();
  useEffect(() => {
    console.log("useChatSocket called");
    if (!socket) {
      console.log("Socket not available");
      return;
    }
    console.log("Socket available");

    socket.on(updateKey, (message: MessageWithMemeberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0)
          return oldData;
        const newData = oldData.pages.map((page: any) => {
          return {
            ...page,
            items: page.items.map((Item: MessageWithMemeberWithProfile) => {
              if (Item.id === message.id) {
                return message;
              }
              return Item;
            }),
          };
        });
        return { ...oldData, pages: newData };
      });
    });

    socket.on(addKey, (message: MessageWithMemeberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0)
          return { pages: [{ items: [message] }] };
        const newData = [...oldData.pages];
        newData[0] = {
          ...newData[0],
          items: [message, ...newData[0].items],
        };
        return { ...oldData, pages: newData };
      });
    });

    return () => {
      socket.off(addKey);
      socket.off(updateKey);
    };
  }, [queryClient, addKey, , queryKey, updateKey]);
};
