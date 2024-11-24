// components/DynamicMessageInput.tsx
import React from "react";

interface MessageInputProps {
  keyList: { [key: string]: string };
  messageData: { [key: string]: any };
  onChangeMessageData: (key: string, value: any) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  keyList,
  messageData,
  onChangeMessageData,
}) => {
  return (
    <div>
      {/* Inline fields for vehId, from_station, to_station */}
      <div className="mb-4 flex space-x-2">
        {["vehId", "from_station", "to_station"].map(
          (key) =>
            keyList[key] && (
              <div key={key} className="flex-1">
                <label className="block text-gray-700">{key}</label>
                <input
                  type="text"
                  value={messageData[key] || ""}
                  onChange={(e) => onChangeMessageData(key, e.target.value)}
                  className="border p-2 rounded w-full"
                  maxLength={7} // 제한을 두어 한 줄로 처리
                />
              </div>
            )
        )}
      </div>

      {/* Multi-line Input for edges */}
      {keyList["edges"] === "array" && (
        <div className="mb-2">
          <label className="block text-gray-700">edges</label>
          <textarea
            value={(messageData["edges"] || []).join(",")}
            onChange={(e) =>
              onChangeMessageData(
                "edges",
                e.target.value.split(",").map((item) => item.trim())
              )
            }
            className="border p-2 rounded w-full h-24 resize-none"
            placeholder="Enter comma-separated values"
          />
        </div>
      )}
    </div>
  );
};

export default MessageInput;
