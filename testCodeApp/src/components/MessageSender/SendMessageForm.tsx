import { useState } from "react";
import TopicDropdown from "./TopicDropDown";
import MessageInput from "./MessageInput";
import topicList from "../../config/topicConfig";
import { useMqttStore } from "@store/mqttStore";

const SendMessageForm = () => {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [messageData, setMessageData] = useState<{ [key: string]: any }>({});
  useMqttStore;
  const { sendMessage } = useMqttStore();

  const handleSendMessage = () => {
    if (selectedTopic) {
      const topicInfo = topicList.find((t) => t.topic === selectedTopic);
      if (topicInfo) {
        const messageWithTimestamp = JSON.stringify({
          ...messageData,
          timestamp: new Date().toISOString(),
        });
        console.log("Sending message", selectedTopic, messageWithTimestamp);
        sendMessage({ topic: selectedTopic, message: messageWithTimestamp });
      }
    }
  };

  const handleChangeMessageData = (key: string, value: any) => {
    setMessageData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const selectedTopicInfo = topicList.find((t) => t.topic === selectedTopic);

  return (
    <div className="bg-white/80 p-4 rounded shadow-md flex-grow">
      <h2 className="text-lg font-semibold">Send Message</h2>
      <TopicDropdown
        topics={topicList}
        selectedTopic={selectedTopic}
        onSelectTopic={setSelectedTopic}
      />
      {selectedTopicInfo && (
        <MessageInput
          keyList={selectedTopicInfo.keyList}
          messageData={messageData}
          onChangeMessageData={handleChangeMessageData}
        />
      )}
      <button
        onClick={handleSendMessage}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </div>
  );
};

export default SendMessageForm;
