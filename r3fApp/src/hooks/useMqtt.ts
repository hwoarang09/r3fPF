import { useEffect } from "react";
import useMqttStore from "../store/mqttStore";

// MQTT 관련 기능만 제공하는 훅
const useMqtt = () => {
  const {
    connect,
    disconnect,
    publishMessage,
    subscribeToTopic,
    messages,
    isConnected,
  } = useMqttStore();

  // MQTT 연결 및 연결 해제 (한 번만 수행)
  useEffect(() => {
    if (!isConnected) {
      console.log("연결하자");
      connect();
    }

    return () => {
      if (isConnected) {
        disconnect();
        console.log("끝기");
      }
    };
  }, [connect, disconnect, isConnected]);

  return { publishMessage, subscribeToTopic, messages, isConnected };
};

export default useMqtt;
