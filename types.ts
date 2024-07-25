import { Member, Profile, Server } from "@prisma/client";
import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIoServer } from "socket.io";
export type ServerWithMembersWithProfiles = Server & {
  member: (Member & {
    profile: Profile;
  })[];
};

export type nextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIoServer;
    };
  };
};