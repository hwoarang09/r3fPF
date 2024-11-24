import React, { useState, useRef, useEffect } from "react";
import useMessageStore from "@store/messageStore";
import { Message } from "@customTypes/messageType";

interface MessageListProps {
  messages: Message[]; // Message 타입 지정
  containerRef: React.RefObject<HTMLDivElement>; // 바깥 스크롤 컨테이너 ref
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  containerRef,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedRef = useRef<HTMLLIElement | null>(null);
  const setSelectedMessage = useMessageStore(
    (state) => state.setSelectedMessage
  ); // zustand의 setSelectedMessage 함수 가져오기

  const handleItemClick = (index: number) => {
    setSelectedIndex(index);
    setSelectedMessage(messages[index]); // 선택된 메시지 전역 상태에 설정
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    let newIndex = selectedIndex;

    if (event.key === "ArrowDown") {
      newIndex =
        selectedIndex === null || selectedIndex >= messages.length - 1
          ? 0
          : selectedIndex + 1;
    } else if (event.key === "ArrowUp") {
      newIndex =
        selectedIndex === null || selectedIndex <= 0
          ? messages.length - 1
          : selectedIndex - 1;
    }

    if (newIndex !== selectedIndex && newIndex !== null) {
      setSelectedIndex(newIndex);
      setSelectedMessage(messages[newIndex]); // 키보드로 선택 시에도 전역 상태 업데이트
    }
  };

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  const disableOuterScroll = () => {
    if (containerRef.current) {
      containerRef.current.style.overflow = "hidden";
    }
  };

  const enableOuterScroll = () => {
    if (containerRef.current) {
      containerRef.current.style.overflow = "auto";
    }
  };

  return (
    <ul
      className="list-none p-0 overflow-y-auto max-h-80 border border-gray-300 rounded-lg"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={disableOuterScroll} // 포커스 시 바깥 스크롤 비활성화
      onBlur={enableOuterScroll} // 포커스 해제 시 바깥 스크롤 활성화
    >
      {messages.map((msg, index) => (
        <li
          key={index}
          onClick={() => handleItemClick(index)}
          ref={selectedIndex === index ? selectedRef : null}
          className={`border-b border-gray-300 py-1 px-3 cursor-pointer ${
            selectedIndex === index ? "bg-blue-100" : ""
          }`}
        >
          <div className="truncate">
            ID: {msg.id} | Command: {msg.command} | Timestamp:{" "}
            {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : "N/A"}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MessageList;
