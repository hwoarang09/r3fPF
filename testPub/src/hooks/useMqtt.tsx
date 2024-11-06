import { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";

const SUB_TOPIC = "PF/UI/Tester/#";

type Message = {
  id?: string;
  command?: string;
  timestamp?: number;
};

type ReceivedMessages = {
  [topic: string]: Message[];
};

const useMqtt = (publishTopic: string = "PF/Tester/UI/Command") => {
  const [receivedMessages, setReceivedMessages] = useState<ReceivedMessages>(
    {}
  );
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  useEffect(() => {
    if (clientRef.current) return;

    const client = mqtt.connect("ws://localhost:8083");

    client.on("connect", () => {
      console.log("Connected to MQTT broker");

      // Check if the client is connected before subscribing
      if (client.connected) {
        client.subscribe(SUB_TOPIC, (err) => {
          if (err) {
            console.error("Failed to subscribe to topic", err);
          } else {
            console.log("Subscribed to topic");
          }
        });
      }
    });

    client.on("message", (topic, message) => {
      try {
        const parsedMessage: Message = JSON.parse(message.toString());
        console.log("parsedMessage", parsedMessage);

        // Group messages by topic
        setReceivedMessages((prevMessages) => ({
          ...prevMessages,
          [topic]: [...(prevMessages[topic] || []), parsedMessage],
        }));

        console.log(
          "receivedMessages",
          JSON.stringify(receivedMessages, null, 2)
        );
      } catch (err) {
        console.error("Failed to parse message", err);
      }
    });

    clientRef.current = client;

    return () => {
      client.end();
      clientRef.current = null;
    };
  }, []);

  const sendMessage = (message: string) => {
    if (clientRef.current) {
      clientRef.current.publish(publishTopic, message, (err) => {
        if (err) {
          console.error("Failed to send message", err);
        } else {
          console.log(`Message sent: ${message}`);
        }
      });
    }
  };

  return { receivedMessages, sendMessage };
};

export default useMqtt;
