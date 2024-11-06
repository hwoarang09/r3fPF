import React, { useEffect, useRef } from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import MessageList from "./MessageList";
import { Message } from "./types";

interface TopicAccordionItemProps {
  topic: string;
  messages: Message[];
}

const TopicAccordionItem: React.FC<TopicAccordionItemProps> = ({
  topic,
  messages,
}) => {
  const messageCountRef = useRef(messages.length); // 최신 메시지 개수 추적
  const countDisplayRef = useRef<HTMLSpanElement | null>(null); // 개수를 보여줄 DOM 요소

  // `messages` 변경 시 메시지 개수 바로 업데이트
  useEffect(() => {
    messageCountRef.current = messages.length;
    if (countDisplayRef.current) {
      countDisplayRef.current.textContent = `${messageCountRef.current} messages`;
    }
  }, [messages.length]);

  return (
    <AccordionItem value={topic} className="focus:outline-none no-underline">
      <AccordionTrigger className="font-semibold text-lg flex items-center space-x-2 focus:outline-none no-underline">
        <span>{topic}</span>
        <span
          ref={countDisplayRef}
          className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full"
        />
      </AccordionTrigger>
      <AccordionContent>
        <MessageList messages={messages} />
      </AccordionContent>
    </AccordionItem>
  );
};

export default TopicAccordionItem;
