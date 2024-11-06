// components/MqttPublisher.js
import React from "react";
import useMqtt from "../hooks/useMqtt";
import MessageSender from "./MessageSender";
import MessageReceiver from "./MessageReceiver";

const MqttPublisher = () => {
  const { receivedMessages, sendMessage } = useMqtt();

  return (
    <div className="flex h-screen">
      {/* Sending message section */}
      <MessageSender onSend={sendMessage} />

      {/* Received message section */}
      <MessageReceiver messagesByTopic={receivedMessages} />
    </div>
  );
};

export default MqttPublisher;
