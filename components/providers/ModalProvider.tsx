"use client";
import CreateServerModal from "@/components/Modals/CreateServerModel";

import { FC, useEffect, useState } from "react";
import InviteModal from "../Modals/InviteModal";
import EditServerModal from "../Modals/EditServerModal";
import MembersModal from "../Modals/MembersModal";
import CreateChannelModal from "../Modals/CreateChannelModal";
import LeaveServerModal from "../Modals/LeaveServerModal";
import DeleteServerModal from "../Modals/DeleteServerModal";
import DeleteChannelModal from "../Modals/DeleteChannelModal";
import EditChannelModal from "../Modals/EditChannelModal";
import MessageFileModal from "../Modals/MessageFileModal";
import DeleteMessageModal from "../Modals/DeleteMessageModal";

const ModalProvider = () => {
  const [IsMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!IsMounted) return null;
  return (
    <>
      <CreateChannelModal />
      <InviteModal />
      <EditServerModal />
      <MembersModal />
      <CreateServerModal />
      <LeaveServerModal />
      <DeleteChannelModal />
      <DeleteServerModal />
      <EditChannelModal />
      <MessageFileModal />
      <DeleteMessageModal />
    </>
  );
};

export default ModalProvider;
