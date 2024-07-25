"use client";

import { useSocket } from "./providers/socket-provider";
import { Badge } from "./ui/badge";

export const SocketIndicator = () => {
  const { isConnected } = useSocket();

  if (!isConnected) {
    return (
      <Badge variant="outline" className="border-none bg-yellow-600 text-white">
        Fallback : pooling each 1 second
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-none bg-green-600 text-white">
      Live: Real Time Updates
    </Badge>
  );
};
