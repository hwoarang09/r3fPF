// MessageReceiver.js
import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@shadcn/ui";

const MessageReceiver = ({ messagesByTopic }) => {
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
          <AccordionItem key={topic} value={topic}>
            <AccordionTrigger className="font-semibold text-lg">
              {topic}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-none p-0">
                {messagesByTopic[topic].map((msg, index) => (
                  <li key={index} className="border-b border-gray-300 py-2">
                    <div>ID: {msg.id}</div>
                    <div>Command: {msg.command}</div>
                    <div>
                      Timestamp: {new Date(msg.timestamp).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default MessageReceiver;
