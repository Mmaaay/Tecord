import { useEffect, useState } from "react";

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
  shouldScroll: boolean;
  loadMore: () => void;
  count: number;
};

export const useChatScroll = ({
  chatRef,
  bottomRef,
  shouldScroll,
  loadMore,
  count,
}: ChatScrollProps) => {
  const [hasInitialized, setHasInitialized] = useState(false);
  useEffect(() => {
    const topChat = chatRef.current;

    const handleScroll = () => {
      if (topChat && topChat.scrollTop === 0 && shouldScroll) {
        loadMore();
      }
    };

    if (topChat) {
      topChat.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (topChat) {
        topChat.removeEventListener("scroll", handleScroll);
      }
    };
  }, [chatRef, loadMore, shouldScroll]);

  useEffect(() => {
    const bottomChat = bottomRef.current;
    const topDiv = chatRef.current;

    const shouldAutoScroll = () => {
      if (!hasInitialized && bottomChat) {
        setHasInitialized(true);
        return true;
      }
      if (!topDiv) {
        return false;
      }

      const distanceFromBottom =
        topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;
      return distanceFromBottom < 100;
    };

    if (shouldAutoScroll()) {
      setTimeout(() => {
        bottomChat?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [bottomRef, count, hasInitialized, chatRef]);
};
