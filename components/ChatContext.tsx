'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface PageContextData {
  pageName: string;
  entityType?: string;
  entityName?: string;
  entityId?: string;
  additionalContext?: string;
}

interface ChatPageContextType {
  context: PageContextData;
  setContext: (ctx: PageContextData) => void;
}

const ChatPageContext = createContext<ChatPageContextType>({
  context: { pageName: 'Home' },
  setContext: () => {},
});

export function ChatPageProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<PageContextData>({ pageName: 'Home' });

  return (
    <ChatPageContext.Provider value={{ context, setContext }}>
      {children}
    </ChatPageContext.Provider>
  );
}

export function useChatPageContext() {
  return useContext(ChatPageContext);
}
