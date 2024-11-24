import { useRef } from "react";
import { Accordion } from "@/components/ui/accordion";
import TopicAccordionItem from "./MessageReceiver/TopicAccordionItem";
import { useMqttStore } from "../store/mqttStore";

const MessageReceiver = () => {
  const { receivedMessages } = useMqttStore();
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={containerRef} className="flex-1 p-5 overflow-y-auto h-full">
      <h2 className="text-xl font-bold mb-2">Received Messages</h2>
      <Accordion type="single" collapsible>
        {Object.keys(receivedMessages).map((topic) => (
          <TopicAccordionItem
            key={topic}
            topic={topic}
            messages={receivedMessages[topic]}
            containerRef={containerRef} // 바깥쪽 스크롤 컨테이너 ref 전달
          />
        ))}
      </Accordion>
    </div>
  );
};

export default MessageReceiver;
