import React, { useState } from "react";
import SendMessageForm from "./MessageSender/SendMessageForm";
interface MessageSenderProps {
  onSend: (message: string) => void;
}

const MessageSender: React.FC<MessageSenderProps> = ({ onSend }) => {
  const [command, setCommand] = useState<string>("Default command");

  const handleSend = () => {
    try {
      const parsedCommand = JSON.parse(command);
      parsedCommand.timestamp = Date.now();

      const messageWithTimestamp = JSON.stringify(parsedCommand);
      onSend(messageWithTimestamp);
      setCommand(""); // Clear textarea after sending
    } catch (error) {
      console.error("Invalid JSON format in command:", error);
    }
  };

  return (
    <div className="flex-1 p-5 border-r border-gray-300">
      <h2 className="text-xl font-bold mb-2">Sender</h2>
      <SendMessageForm />
    </div>
  );
};

export default MessageSender;
