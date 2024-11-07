import React, { useState } from "react";
import { Message } from "./types";

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleItemClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if (selectedIndex === null) return;

    if (event.key === "ArrowDown") {
      setSelectedIndex((prevIndex) =>
        prevIndex === null || prevIndex >= messages.length - 1
          ? 0
          : prevIndex + 1
      );
    } else if (event.key === "ArrowUp") {
      setSelectedIndex((prevIndex) =>
        prevIndex === null || prevIndex <= 0
          ? messages.length - 1
          : prevIndex - 1
      );
    }
  };

  return (
    <ul className="list-none p-0" tabIndex={0} onKeyDown={handleKeyDown}>
      {messages.map((msg, index) => (
        <li
          key={index}
          onClick={() => handleItemClick(index)}
          className={`border-b border-gray-300 py-2 cursor-pointer ${
            selectedIndex === index ? "bg-blue-100" : ""
          }`}
        >
          <div>
            ID: {msg.id} | Command: {msg.command} | Timestamp:{" "}
            {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : "N/A"}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MessageList;
