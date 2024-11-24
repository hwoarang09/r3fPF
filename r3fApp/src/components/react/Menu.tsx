// components/Menu.tsx
import React, { useEffect } from "react";
import useMqtt from "../../hooks/useMqtt";
import { SUB_TOPIC, PUB_TOPIC } from "../../config/settings";
import SendMessageForm from "./SendMessageForm";

const Menu: React.FC = () => {
  const { isConnected, messages, subscribeToTopic, publishMessage } = useMqtt();

  useEffect(() => {
    if (isConnected) {
      console.log("subscribing to topic ", SUB_TOPIC);
      subscribeToTopic(SUB_TOPIC);
    }
  }, [subscribeToTopic, isConnected]);

  return (
    <div className="absolute top-0 w-full z-10 flex flex-col space-y-4">
      <div className="p-4 bg-white/50 flex justify-between items-center">
        <h1 className="text-xl font-bold">My R3F Project</h1>
        <span>{isConnected ? "MQTT Connected" : "Disconnected"}</span>
      </div>

      <div className="p-4 bg-white/50 flex space-x-4">
        <SendMessageForm
          publishMessage={publishMessage}
          initialTopic={PUB_TOPIC}
        />

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
