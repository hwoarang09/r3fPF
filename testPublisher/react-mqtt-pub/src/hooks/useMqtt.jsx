// hooks/useMqtt.js
import { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";

const SUB_TOPIC = "PF/UI/Tester/#";

const useMqtt = (publishTopic = "PF/Tester/UI/Command") => {
  const [receivedMessages, setReceivedMessages] = useState({});
  const clientRef = useRef(null);

  useEffect(() => {
    if (clientRef.current) return;

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

  const sendMessage = (message) => {
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
