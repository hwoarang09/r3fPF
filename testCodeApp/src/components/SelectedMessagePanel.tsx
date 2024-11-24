import React from "react";
import useMessageStore from "../store/messageStore";

const SelectedMessagePanel: React.FC = () => {
  const selectedMessage = useMessageStore((state) => state.selectedMessage);

  return (
    <div className="flex flex-col items-start justify-start p-6 border border-gray-300 rounded-lg shadow-md bg-white w-full h-full">
      {selectedMessage ? (
        <>
          {/* 타임스탬프를 왼쪽 상단에 작은 글씨로 표시 */}
          <span className="text-xs text-gray-500 mb-2">
            Timestamp:{" "}
            {`${new Date(selectedMessage.timestamp).toLocaleString()}.${String(
              new Date(selectedMessage.timestamp).getMilliseconds()
            ).padStart(3, "0")}000`}
          </span>

          {/* 메시지 내용을 왼쪽 상단부터 작은 글씨로 출력 */}
          <div className="flex flex-col items-start justify-start border border-gray-400 bg-gray-100 p-4 rounded w-full h-full">
            <span className="text-sm font-medium text-gray-700">
              ID: {selectedMessage.id} <br />
              Command: {selectedMessage.command}
            </span>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <span className="text-sm font-semibold text-gray-500">
            No message selected
          </span>
        </div>
      )}
    </div>
  );
};

export default SelectedMessagePanel;
