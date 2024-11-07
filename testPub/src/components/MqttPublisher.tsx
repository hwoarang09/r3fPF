import React from "react";
import useMqtt from "../hooks/useMqtt";
import MessageSender from "./MessageSender";
import MessageReceiver from "./MessageReceiver";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import useMessageStore from "../store/messageStore"; // zustand 스토어 import
import SelectedMessagePanel from "./SelectedMessagePanel";

const MqttPublisher: React.FC = () => {
  const { receivedMessages, sendMessage } = useMqtt();
  const selectedMessage = useMessageStore((state) => state.selectedMessage); // zustand로 선택된 메시지 읽기

  return (
    <div className="h-screen">
      <ResizablePanelGroup
        direction="vertical"
        className="min-h-[680px] max-w rounded-lg border md:min-w-[450px]"
      >
        <ResizablePanel defaultSize={50}>
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
        <ResizablePanel defaultSize={50}>
          <SelectedMessagePanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default MqttPublisher;
