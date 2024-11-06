import React from "react";
import { Accordion } from "@/components/ui/accordion";
import TopicAccordionItem from "./TopicAccordionItem";
import { Message } from "./types";

interface MessageReceiverProps {
  messagesByTopic: {
    [topic: string]: Message[];
  };
}

const MessageReceiver: React.FC<MessageReceiverProps> = ({
  messagesByTopic,
}) => {
  console.log(`messagesByTopic: ${JSON.stringify(messagesByTopic, null, 2)}`);

  if (!messagesByTopic || Object.keys(messagesByTopic).length === 0) {
    return (
      <div className="flex-1 p-5">
        <h2 className="text-xl font-bold mb-2">Received Messages</h2>
        <p className="text-gray-500">No messages received yet.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-5">
      <h2 className="text-xl font-bold mb-2">Received Messages</h2>
      <Accordion type="single" collapsible>
        {Object.keys(messagesByTopic).map((topic) => (
          <TopicAccordionItem
            key={topic}
            topic={topic}
            messages={messagesByTopic[topic]}
          />
        ))}
      </Accordion>
    </div>
  );
};

export default MessageReceiver;
