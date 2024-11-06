import React, { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";

const SUB_TOPIC = "PF/UI/Tester/#";
const PUB_TOPIC = "PF/Tester/UI/Command";

const MqttPublisher = () => {
  const [command, setCommand] = useState("Default command");
  const [receivedMessages, setReceivedMessages] = useState([]);
  const clientRef = useRef(null);

  useEffect(() => {
    const client = mqtt.connect("ws://localhost:8083");

    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      client.subscribe(SUB_TOPIC, (err) => {
        if (err) {
          console.error("Failed to subscribe to topic", err);
        } else {
          console.log("Subscribed to topic");
        }
      });
    });

    client.on("message", (topic, message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        setReceivedMessages((prevMessages) => [...prevMessages, parsedMessage]);
      } catch (err) {
        console.error("Failed to parse message", err);
      }
    });

    clientRef.current = client;

    return () => {
      client.end();
    };
  }, []);

  const sendMessage = (message) => {
    if (clientRef.current) {
      clientRef.current.publish(PUB_TOPIC, message, (err) => {
        if (err) {
          console.error("Failed to send message", err);
        } else {
          console.log(`Message sent: ${message}`);
        }
      });
    }
  };

  const handleSend = () => {
    try {
      // Parse command as JSON, add timestamp, and stringify it
      const parsedCommand = JSON.parse(command);
      parsedCommand.timestamp = Date.now();

      const messageWithTimestamp = JSON.stringify(parsedCommand);
      sendMessage(messageWithTimestamp);
      setCommand(""); // Clear textarea after sending
    } catch (error) {
      console.error("Invalid JSON format in command:", error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sending message section */}
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

      {/* Received message section */}
      <div className="flex-1 p-5">
        <h2 className="text-xl font-bold mb-2">Received Messages</h2>
        <ul className="list-none p-0">
          {receivedMessages.map((msg, index) => (
            <li key={index} className="border-b border-gray-300 py-2">
              <div>ID: {msg.id}</div>
              <div>Command: {msg.command}</div>
              <div>Timestamp: {new Date(msg.timestamp).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MqttPublisher;
