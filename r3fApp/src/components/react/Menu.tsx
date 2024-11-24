// components/Menu.tsx
import React, { useEffect } from "react";
import { useMqttStore } from "../../store/mqttStore";
import { SUB_TOPIC, PUB_TOPIC } from "@config/settings";
import SendMessageForm from "./SendMessageForm";
import { mqttUrl } from "../../config/mqttConfig";
import MessageList from "./MessageList";

const Menu: React.FC = () => {
  const { initializeClient } = useMqttStore();
  useEffect(() => {
    initializeClient(mqttUrl);
  }, [initializeClient]);

  return (
    <div className="absolute top-0 w-full z-10 flex flex-col space-y-4">
      <div className="p-4 bg-white/50 flex justify-between items-center">
        <h1 className="text-xl font-bold">My R3F Project</h1>
        {/* <span>{isConnected ? "MQTT Connected" : "Disconnected"}</span> */}
      </div>

      <div className="p-4 bg-white/50 flex space-x-4">
        <SendMessageForm />

        <MessageList />
      </div>
    </div>
  );
};

export default Menu;
