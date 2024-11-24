import { create } from "zustand";
import mqtt, { MqttClient } from "mqtt";

interface MqttState {
  client: MqttClient | null; // MQTT 클라이언트
  receivedMessages: { [topic: string]: any[] }; // 토픽별 메시지 저장
  sendMessage: (params: { topic: string; message: string }) => void;
  setReceivedMessages: (topic: string, message: any) => void;
  initializeClient: (url: string) => void; // 클라이언트 초기화 함수
}

export const useMqttStore = create<MqttState>((set, get) => ({
  client: null, // 초기값은 null

  receivedMessages: {},

  sendMessage: ({ topic, message }) => {
    const client = get().client;
    if (!client) {
      console.error("MQTT client is not initialized.");
      return;
    }

    client.publish(topic, message, (err) => {
      if (err) {
        console.error("Failed to send message", err);
      } else {
        console.log(`Message sent to ${topic}: ${message}`);
      }
    });
  },

  setReceivedMessages: (topic, message) =>
    set((state) => ({
      receivedMessages: {
        ...state.receivedMessages,
        [topic]: [...(state.receivedMessages[topic] || []), message],
      },
    })),

  initializeClient: (url: string) => {
    const client = mqtt.connect(url);

    client.on("connect", () => {
      console.log("Connected to MQTT broker");
    });

    client.on("message", (topic, message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        get().setReceivedMessages(topic, parsedMessage);
      } catch (error) {
        console.error("Failed to parse message", error);
      }
    });

    client.on("error", (err) => {
      console.error("MQTT Client Error:", err);
    });

    set({ client });
  },
}));
