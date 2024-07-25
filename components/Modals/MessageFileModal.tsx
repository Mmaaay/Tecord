"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Form, FormField, FormItem } from "@/components/ui/form";
import { useModal } from "@/hooks/use-modal-store";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import qs from "query-string";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import MessageFileSchema, {
  MessageFileValidator,
} from "../../lib/validators/MessageFileValidator";
import FileUpload from "../FileUpload";
interface MessageFileModalProps {}
const MessageFileModal: FC<MessageFileModalProps> = ({}) => {
  const { isOpen, onClose, data, type } = useModal();
  const router = useRouter();
  const { apiUrl, query } = data;
  const isModalOpen = isOpen && type === "messageFile";
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState<boolean>(false);

  const form = useForm({
    resolver: zodResolver(MessageFileSchema),
    defaultValues: {
      fileUrl: "",
    },
  });
  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: MessageFileValidator) => {
    try {
      const URL = qs.stringifyUrl({
        url: apiUrl || "",
        query,
      });
      await axios.post(URL, { ...values, content: values.fileUrl });

      form.reset();
      router.refresh();
      setFormSubmitted(true);
      handleClose();
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = async () => {
    if (!formSubmitted) {
      setIsConfirmDialogOpen(true);
    } else if (formSubmitted) {
      form.reset();
      onClose();
    }
  };

  const closeModal = async () => {
    if (!formSubmitted && form.getValues("fileUrl")) {
      // Optimistically update UI before sending delete request
      setIsConfirmDialogOpen(false);
      const url = form.getValues("fileUrl");
      form.setValue("fileUrl", "");
      try {
        await axios.delete("/api/uploadthing", {
          data: { url: url },
        });
      } catch (error) {
        console.log(error);
      }
    }
    form.reset();
    onClose();
    setFormSubmitted(false);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="overflow-hidden bg-white p-0 text-black">
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-center text-2xl font-bold">
            Add Attachment
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Send a file
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FileUpload
                        endpoint="messageFile"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button
                variant="primary"
                isLoading={isLoading}
                disabled={isLoading}
                type="submit"
              >
                Send
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      <AlertDialog open={isConfirmDialogOpen}>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => closeModal()}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default MessageFileModal;
