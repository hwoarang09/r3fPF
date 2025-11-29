// Load MQTT configuration from JSON file (runtime editable)
// If JSON file is not available, use default configuration

interface MqttConfig {
  MQTT_URL: string;
  SUB_TOPIC: string;
  PUB_TOPIC: string;
}

// Default configuration (used when JSON file is not available)
const defaultMqttConfig: MqttConfig = {
  MQTT_URL: "ws://localhost:8083",
  SUB_TOPIC: "#",
  PUB_TOPIC: "PF/UI/Tester/Command1",
};

// Load configuration from JSON file
let cachedMqttConfig: MqttConfig | null = null;

async function loadMqttConfig(): Promise<MqttConfig> {
  if (cachedMqttConfig) {
    return cachedMqttConfig;
  }

  try {
    const configData: MqttConfig = await fetch("/config/mqttConfig.json").then(
      (res) => res.json()
    );
    cachedMqttConfig = configData;
    console.log("[MqttConfig] Loaded from mqttConfig.json");
    return cachedMqttConfig;
  } catch (error) {
    console.warn(
      "[MqttConfig] Failed to load mqttConfig.json, using default configuration",
      error
    );
    cachedMqttConfig = defaultMqttConfig;
    return defaultMqttConfig;
  }
}

// Synchronous access (returns default if not loaded yet)
function getMqttConfigSync(): MqttConfig {
  return cachedMqttConfig || defaultMqttConfig;
}

export default getMqttConfigSync();
export { loadMqttConfig, getMqttConfigSync };
export type { MqttConfig };
