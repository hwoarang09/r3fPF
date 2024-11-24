import { useEffect } from "react";
import * as React from "react";
import { useMqttStore } from "@store/mqttStore";
import MessageSender from "./MessageSender";
import MessageReceiver from "./MessageReceiver";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import SelectedMessagePanel from "./SelectedMessagePanel";
import { mqttUrl } from "../config/mqttConfig";
const MqttPublisher: React.FC = () => {
  const { receivedMessages, initializeClient } = useMqttStore();

  useEffect(() => {
    initializeClient(mqttUrl);
  }, [initializeClient]);

  return (
    <div className="h-screen">
      <ResizablePanelGroup
        direction="vertical"
        className="min-h-[680px] max-w rounded-lg border md:min-w-[450px]"
      >
        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel>
              <MessageSender />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <MessageReceiver messagesByTopic={receivedMessages} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <SelectedMessagePanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default MqttPublisher;
