import { create } from "zustand";

interface MessageStore {
  selectedMessage: any;
  setSelectedMessage: (message: any) => void;
}

const useMessageStore = create<MessageStore>((set) => ({
  selectedMessage: null,
  setSelectedMessage: (message) => set({ selectedMessage: message }),
}));

export default useMessageStore;
