import React, { useEffect, useState } from "react";
import useMqtt from "../../hooks/useMqtt";
import { SUB_TOPIC, PUB_TOPIC } from "../../config/settings";

const Menu: React.FC = () => {
  const { isConnected, messages, subscribeToTopic, publishMessage } = useMqtt();
  const [inputMessage, setInputMessage] = useState(
    JSON.stringify({
      id: "3839",
      command: "Hanmool",
    })
  );
  const [publishTopic, setPublishTopic] = useState(PUB_TOPIC);

  // Subscribe only within the Menu component
  useEffect(() => {
    if (isConnected) {
      console.log("subscribing to topic ", SUB_TOPIC);
      subscribeToTopic(SUB_TOPIC);
    }
  }, [subscribeToTopic, isConnected]);

  // Handle message sending
  const handleSendMessage = () => {
    if (publishTopic) {
      try {
        // Parse inputMessage JSON, add timestamp, and stringify
        const parsedMessage = JSON.parse(inputMessage);
        parsedMessage.timestamp = new Date().toISOString();

        const messageWithTimestamp = JSON.stringify(parsedMessage);
        console.log(messageWithTimestamp);
        publishMessage(publishTopic, messageWithTimestamp);
        setInputMessage(""); // Clear input after sending
      } catch (error) {
        console.error("Invalid JSON format in inputMessage:", error);
      }
    }
  };

  return (
    <div className="absolute top-0 w-full z-10 flex flex-col space-y-4">
      {/* Top Menu */}
      <div className="p-4 bg-white/50 flex justify-between items-center">
        <h1 className="text-xl font-bold">My R3F Project</h1>
        <span>{isConnected ? "MQTT Connected" : "Disconnected"}</span>
      </div>

      {/* Message Section */}
      <div className="p-4 bg-white/50 flex space-x-4">
        {/* Message Sending Section */}
        <div className="bg-white/80 p-4 rounded shadow-md flex-grow">
          <h2 className="text-lg font-semibold">Send Message</h2>
          <input
            type="text"
            value={publishTopic}
            onChange={(e) => setPublishTopic(e.target.value)}
            placeholder="Enter topic"
            className="border p-2 rounded w-full mb-2"
          />
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Enter message"
            className="border p-2 rounded w-full h-24 resize-none"
          />
          <button
            onClick={handleSendMessage}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>

        {/* Message Receiving Section */}
        <div className="bg-white/80 p-4 rounded shadow-md flex-grow">
          <h2 className="text-lg font-semibold">Received Messages</h2>
          <div className="overflow-y-auto max-h-40">
            {messages.map((msg: string, index: number) => (
              <p key={index} className="text-gray-700">
                {msg}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
