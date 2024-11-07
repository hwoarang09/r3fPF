import { create } from "zustand";
// import { Message } from "../components/types/messages"; // Message 타입이 정의된 파일을 가져옵니다.

interface MessageStore {
  selectedMessage: any;
  setSelectedMessage: (message: any) => void;
}

const useMessageStore = create<MessageStore>((set) => ({
  selectedMessage: null,
  setSelectedMessage: (message) => set({ selectedMessage: message }),
}));

export default useMessageStore;
