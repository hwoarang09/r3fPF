import React, { useEffect } from "react";
import useMqtt from "../../hooks/useMqtt";

const Menu: React.FC = () => {
  const { isConnected, messages, subscribeToTopic } = useMqtt();
  const topic = "my/topic";

  // Menu에서만 구독
  useEffect(() => {
    if (isConnected) {
      console.log("subscribing to topic ", topic);
      subscribeToTopic(topic);
    }
  }, [subscribeToTopic, isConnected]);

  return (
    <div className="absolute top-0 w-full p-4 bg-white/50 flex justify-between items-center z-10">
      <h1 className="text-xl font-bold">My R3F Project</h1>
      <div className="flex space-x-4">
        <span>{isConnected ? "MQTT Connected" : "Disconnected"}</span>
        <div>
          {messages.slice(-5).map((msg: string, index: number) => (
            <p key={index} className="text-gray-700">
              {msg}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;
