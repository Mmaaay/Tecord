"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import axios from "axios";
import qs from "query-string";
import { useState } from "react";
import { Button } from "../ui/button";
import { socket } from "@/app/socket";
import { cn } from "@/lib/utils";
const DeleteMessageModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { apiUrl, query, updateKey } = data;
  const [isLoading, setisLoading] = useState<boolean>(false);

  const isModalOpen = isOpen && type === "deleteMessage";
  const onClick = async () => {
    try {
      setisLoading(true);
      const url = qs.stringifyUrl({
        url: apiUrl || "",
        query,
      });
      const message = await axios.delete(url);
      socket.emit("update", message.data, updateKey);

      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setisLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden bg-white p-0 text-black">
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-center text-2xl font-bold">
            Delete Message
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to delete this message ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <div className="flex w-full items-center justify-between">
            <Button disabled={isLoading} onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button
              disabled={isLoading}
              variant="primary"
              onClick={onClick}
              className={cn(isLoading ? "cursor-not-allowed bg-gray-300" : "")}
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteMessageModal;
