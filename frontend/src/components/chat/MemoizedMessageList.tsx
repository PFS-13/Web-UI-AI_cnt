import React, { memo } from 'react';
import MessageList from './MessageList';

interface MessageListProps {
  messages: Array<{
    id?: number;
    content: string;
    is_user: boolean;
    is_edited?: boolean;
    edited_from_message_id?: number;
  }>;
  isLoading: boolean;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  conversationId?: string;
  currentPath: number[];
  onChangePath: (messageId: number, type: string, edited_from_message_id?: number) => void;
  OnEditMessage: (messageId: number, content: string, is_edited?: boolean) => void;
}

const MemoizedMessageList: React.FC<MessageListProps> = memo((props) => {
  return <MessageList {...props} />;
});

MemoizedMessageList.displayName = 'MemoizedMessageList';

export default MemoizedMessageList;
