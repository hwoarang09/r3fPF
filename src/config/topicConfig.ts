// Load topic configuration from JSON file (runtime editable)
// If JSON file is not available, use default configuration

interface TopicConfig {
  MOVE_TO_EDGE_TOPIC: string;
  MOVE_TO_PICKUP_TOPIC: string;
  MOVE_TO_DROPDOWN_TOPIC: string;
  DROPDOWN_TOPIC: string;
  PICKUP_TOPIC: string;
}

// Default configuration (used when JSON file is not available)
const defaultTopicConfig: TopicConfig = {
  MOVE_TO_EDGE_TOPIC: "UI/LayOut/moveToEdge",
  MOVE_TO_PICKUP_TOPIC: "UI/LayOut/moveToPickUp",
  MOVE_TO_DROPDOWN_TOPIC: "UI/LayOut/moveToDropDown",
  DROPDOWN_TOPIC: "UI/LayOut/dropDown",
  PICKUP_TOPIC: "UI/LayOut/pickUp",
};

// Load configuration from JSON file
let cachedTopicConfig: TopicConfig | null = null;

async function loadTopicConfig(): Promise<TopicConfig> {
  if (cachedTopicConfig) {
    return cachedTopicConfig;
  }

  try {
    const configData: TopicConfig = await fetch(
      "/config/topicConfig.json"
    ).then((res) => res.json());
    cachedTopicConfig = configData;
    console.log("[TopicConfig] Loaded from topicConfig.json");
    return cachedTopicConfig;
  } catch (error) {
    console.warn(
      "[TopicConfig] Failed to load topicConfig.json, using default configuration",
      error
    );
    cachedTopicConfig = defaultTopicConfig;
    return defaultTopicConfig;
  }
}

// Synchronous access (returns default if not loaded yet)
function getTopicConfigSync(): TopicConfig {
  return cachedTopicConfig || defaultTopicConfig;
}

export default getTopicConfigSync();
export { loadTopicConfig, getTopicConfigSync };
export type { TopicConfig };

