import React from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import MessageList from "./MessageList";
import { Message } from "@customTypes/messageType";

interface TopicAccordionItemProps {
  topic: string;
  messages: Message[];
  containerRef: React.RefObject<HTMLDivElement>; // 바깥 스크롤 컨테이너 ref
}

const TopicAccordionItem: React.FC<TopicAccordionItemProps> = ({
  topic,
  messages,
  containerRef,
}) => {
  return (
    <AccordionItem value={topic}>
      <AccordionTrigger>
        <div className="flex justify-between w-full">
          <span>{topic}</span>
          <span className="text-xs text-gray-500">({messages.length})</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <MessageList messages={messages} containerRef={containerRef} />
      </AccordionContent>
    </AccordionItem>
  );
};

export default TopicAccordionItem;
