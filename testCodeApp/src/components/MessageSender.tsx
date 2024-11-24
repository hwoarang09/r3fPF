import React, { useState } from "react";
import SendMessageForm from "./MessageSender/SendMessageForm";

const MessageSender = () => {
  return (
    <div className="flex-1 p-5 border-r border-gray-300">
      <h2 className="text-xl font-bold mb-2">Sender</h2>
      <SendMessageForm />
    </div>
  );
};

export default MessageSender;
