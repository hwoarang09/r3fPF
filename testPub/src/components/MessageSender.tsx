import React, { useState } from "react";

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
      <h2 className="text-xl font-bold mb-2">Send Message</h2>
      <textarea
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        rows={4}
        className="w-full border border-gray-400 p-2 mb-2"
        placeholder="Enter message in JSON format"
      />
      <button
        onClick={handleSend}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Send!
      </button>
    </div>
  );
};

export default MessageSender;
