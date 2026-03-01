'use client';

import { useEffect } from 'react';
import { useChatPageContext, PageContextData } from './ChatContext';

interface PageContextSetterProps {
  context: PageContextData;
}

export default function PageContextSetter({ context }: PageContextSetterProps) {
  const { setContext } = useChatPageContext();

  useEffect(() => {
    setContext(context);
  }, [context.pageName, context.entityType, context.entityName, context.entityId]);

  return null;
}
