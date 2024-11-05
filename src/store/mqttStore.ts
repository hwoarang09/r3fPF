import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import mqtt, { MqttClient } from "mqtt";
import { MQTT_URL } from "../config/settings";

interface MqttState {
  client: MqttClient | null;
  isConnected: boolean;
  messages: string[];
  connectMessage: string;
  subscribeMessage: string;
  errorMessage: string;
  subscribedTopics: Set<string>;
  connect: () => void;
  disconnect: () => void;
  publishMessage: (topic: string, message: string) => void;
  subscribeToTopic: (topic: string) => void;
  unsubscribeFromTopic: (topic: string) => void; // 구독 해제 함수
}

const useMqttStore = create(
  subscribeWithSelector<MqttState>((set, get) => ({
    client: null,
    isConnected: false,
    messages: [],
    connectMessage: "",
    subscribeMessage: "",
    errorMessage: "",
    subscribedTopics: new Set(),

    connect: () => {
      const client = mqtt.connect(MQTT_URL);

      client.on("connect", () => {
        set({
          client,
          isConnected: true,
          connectMessage: "Connected to MQTT Broker",
          errorMessage: "",
        });
      });

      client.on("message", (topic, message) => {
        set((state) => ({
          messages: [...state.messages, `${topic}: ${message.toString()}`],
        }));
      });

      client.on("error", (error) => {
        set({
          errorMessage: `MQTT error: ${error.message}`,
          connectMessage: "",
        });
        console.error("MQTT error:", error);
      });

      set({ client });
    },

    disconnect: () => {
      const { client } = get();
      if (client) {
        client.end();
        set({
          client: null,
          isConnected: false,
          connectMessage: "Disconnected from MQTT Broker",
        });
      }
    },

    publishMessage: (topic, message) => {
      const { client, isConnected } = get();
      if (client && isConnected) {
        client.publish(topic, message);
      }
    },

    subscribeToTopic: (topic) => {
      const { client, isConnected, subscribedTopics } = get();

      if (client && isConnected && !subscribedTopics.has(topic)) {
        console.log("subscribing to topic", topic);
        client.subscribe(topic, (err) => {
          if (!err) {
            set((state) => ({
              subscribeMessage: `Subscribed to ${topic}`,
              errorMessage: "",
              subscribedTopics: new Set([...state.subscribedTopics, topic]),
            }));
          } else {
            set({ errorMessage: `Failed to subscribe to ${topic}` });
          }
        });
      } else {
        console.log(`Already subscribed to ${topic}`);
      }
    },

    unsubscribeFromTopic: (topic) => {
      const { client, isConnected, subscribedTopics } = get();

      if (client && isConnected && subscribedTopics.has(topic)) {
        console.log("unsubscribing from topic", topic);
        client.unsubscribe(topic, (err) => {
          if (!err) {
            set((state) => {
              const updatedTopics = new Set(state.subscribedTopics);
              updatedTopics.delete(topic); // 주제를 Set에서 제거
              return {
                subscribeMessage: `Unsubscribed from ${topic}`,
                errorMessage: "",
                subscribedTopics: updatedTopics,
              };
            });
          } else {
            set({ errorMessage: `Failed to unsubscribe from ${topic}` });
          }
        });
      } else {
        console.log(`Not subscribed to ${topic} or client not connected`);
      }
    },
  }))
);

export default useMqttStore;
