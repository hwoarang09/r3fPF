import React from "react";
import { Message } from "./types";

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <ul className="list-none p-0">
      {messages.map((msg, index) => (
        <li key={index} className="border-b border-gray-300 py-2">
          <div>ID: {msg.id}</div>
          <div>Command: {msg.command}</div>
          <div>
            Timestamp:{" "}
            {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : "N/A"}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MessageList;
