import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  chatId: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatBotState {
  // Chat management
  chats: Chat[];
  currentChatId: string | null;
  isOpen: boolean;
  
  // Actions
  createNewChat: () => string;
  setCurrentChat: (chatId: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp' | 'chatId'>) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  deleteChat: (chatId: string) => void;
  clearAllChats: () => void;
  
  // UI state
  setIsOpen: (isOpen: boolean) => void;
  
  // Context management
  clearContext: () => void;
}

const generateChatTitle = (firstMessage: string): string => {
  // Generate a title from the first user message
  const words = firstMessage.trim().split(' ');
  if (words.length <= 4) {
    return firstMessage;
  }
  return words.slice(0, 4).join(' ') + '...';
};

export const useChatBotStore = create<ChatBotState>()(
  persist(
    (set, get) => ({
      // Initial state
      chats: [],
      currentChatId: null,
      isOpen: false,

      // Create a new chat
      createNewChat: () => {
        const newChat: Chat = {
          id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: newChat.id,
        }));

        return newChat.id;
      },

      // Set current chat
      setCurrentChat: (chatId: string) => {
        set({ currentChatId: chatId });
      },

      // Add a message to the current chat
      addMessage: (messageData) => {
        const { currentChatId, chats } = get();
        
        if (!currentChatId) {
          // Create a new chat if none exists
          const newChatId = get().createNewChat();
          get().addMessage(messageData);
          return;
        }

        const message: Message = {
          ...messageData,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          chatId: currentChatId,
        };

        const updatedChats = chats.map((chat) => {
          if (chat.id === currentChatId) {
            const updatedMessages = [...chat.messages, message];
            
            // Update chat title if this is the first user message
            let updatedTitle = chat.title;
            if (message.sender === 'user' && chat.messages.length === 0) {
              updatedTitle = generateChatTitle(message.text);
            }

            return {
              ...chat,
              messages: updatedMessages,
              title: updatedTitle,
              updatedAt: new Date(),
            };
          }
          return chat;
        });

        set({ chats: updatedChats });
      },

      // Update a message
      updateMessage: (messageId, updates) => {
        const { chats } = get();
        
        const updatedChats = chats.map((chat) => ({
          ...chat,
          messages: chat.messages.map((message) =>
            message.id === messageId ? { ...message, ...updates } : message
          ),
          updatedAt: new Date(),
        }));

        set({ chats: updatedChats });
      },

      // Delete a message
      deleteMessage: (messageId) => {
        const { chats } = get();
        
        const updatedChats = chats.map((chat) => ({
          ...chat,
          messages: chat.messages.filter((message) => message.id !== messageId),
          updatedAt: new Date(),
        }));

        set({ chats: updatedChats });
      },

      // Delete a chat
      deleteChat: (chatId) => {
        const { chats, currentChatId } = get();
        
        const updatedChats = chats.filter((chat) => chat.id !== chatId);
        const newCurrentChatId = currentChatId === chatId 
          ? (updatedChats.length > 0 ? updatedChats[0].id : null)
          : currentChatId;

        set({ 
          chats: updatedChats,
          currentChatId: newCurrentChatId,
        });
      },

      // Clear all chats
      clearAllChats: () => {
        set({ 
          chats: [],
          currentChatId: null,
        });
      },

      // Set chatbot open state
      setIsOpen: (isOpen) => {
        set({ isOpen });
      },

      // Clear context (called on logout or close)
      clearContext: () => {
        set({
          chats: [],
          currentChatId: null,
          isOpen: false,
        });
      },
    }),
    {
      name: 'selamnew-chatbot-storage',
      // Only persist chats, not UI state
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId,
      }),
      // Custom serialization to handle Date objects
      serialize: (state) => {
        return JSON.stringify(state);
      },
      // Custom deserialization to convert date strings back to Date objects
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        if (parsed.state?.chats) {
          parsed.state.chats = parsed.state.chats.map((chat: any) => ({
            ...chat,
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt),
            messages: chat.messages.map((message: any) => ({
              ...message,
              timestamp: new Date(message.timestamp),
            })),
          }));
        }
        return parsed;
      },
    }
  )
);

