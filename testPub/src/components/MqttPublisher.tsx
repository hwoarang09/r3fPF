import React from "react";
import useMqtt from "../hooks/useMqtt";
import MessageSender from "./MessageSender";
import MessageReceiver from "./MessageReceiver";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const MqttPublisher: React.FC = () => {
  const { receivedMessages, sendMessage } = useMqtt();

  return (
    <ResizablePanelGroup
      direction="vertical"
      className="min-h-[680px] max-w rounded-lg border md:min-w-[450px]"
    >
      <ResizablePanel defaultSize={75}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>
            <MessageSender onSend={sendMessage} />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>
            <MessageReceiver messagesByTopic={receivedMessages} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={25}>
        <div className="flex items-center justify-center p-6">
          <span className="font-semibold">Header</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default MqttPublisher;
