import { useCallback } from 'react';
import { messageAPI } from '../services/api/message.api';

interface MessageResponse {
  id: number;
  content: string;
  is_user: boolean;
  is_edited?: boolean;
  edited_from_message_id?: number;
}

interface PathMessageResponse {
  path_messages: MessageResponse[];
}

interface UseChatNavigationProps {
  conversationId?: string;
  setPath: React.Dispatch<React.SetStateAction<number[]>>;
}

interface UseChatNavigationReturn {
  handleChangePath: (messageId: number, type: string, edited_from_message_id?: number) => Promise<void>;
}

export const useChatNavigation = ({ 
  conversationId, 
  setPath 
}: UseChatNavigationProps): UseChatNavigationReturn => {
  
  const handleChangePath = useCallback(async (
    message_id: number, 
    type: string, 
    edited_from_message_id?: number
  ) => {
    if (!conversationId) return;

    try {
      // Get all paths for this conversation
      const allPathsResponse = await messageAPI.getPathMessages(conversationId);
      const allPaths: number[][] = (allPathsResponse as PathMessageResponse[]).map((pathData: PathMessageResponse) => {
        if (pathData.path_messages && Array.isArray(pathData.path_messages)) {
          return pathData.path_messages.map((msg: MessageResponse) => msg.id).filter((id: number) => id != null);
        }
        return [];
      }).filter((path: number[]) => path.length > 0);
      
      // Get all messages for chain navigation
      const allMessageIds = allPaths.flat();
      const allMessages = await messageAPI.getMessageByIds(allMessageIds);
      
      // Find current path containing this message
      const currentPath = allPaths.find(path => path.includes(message_id));
      if (!currentPath) {
        return;
      }
      
      const currentPathIndex = allPaths.indexOf(currentPath);
      
      let targetPath: number[];
      
      // Handle edit-based navigation
      if (edited_from_message_id !== undefined) {
        if (type === 'prev') {
          // Find path that contains the original message (edited_from_message_id)
          const originalPath = allPaths.find(path => path.includes(edited_from_message_id));
          if (originalPath) {
            targetPath = originalPath;
          } else {
            return;
          }
        } else {
          // For 'next' with edited_from_message_id, find the next message in chain edit
          const currentMessage = allMessages.find(msg => msg.id === message_id);
          if (currentMessage) {
            const nextMessage = allMessages.find(msg => 
              msg.edited_from_message_id === message_id && msg.id
            );
            
            if (nextMessage) {
              const nextPath = allPaths.find(path => path.includes(nextMessage.id));
              if (nextPath) {
                targetPath = nextPath;
              } else {
                if (currentPathIndex + 1 >= allPaths.length) {
                  return;
                }
                targetPath = allPaths[currentPathIndex + 1];
              }
            } else {
              if (currentPathIndex + 1 >= allPaths.length) {
                return;
              }
              targetPath = allPaths[currentPathIndex + 1];
            }
          } else {
            if (currentPathIndex + 1 >= allPaths.length) {
              return;
            }
            targetPath = allPaths[currentPathIndex + 1];
          }
        }
      } else {
        // Original chain-based navigation logic
        if (type === 'next') {
          if (currentPathIndex + 1 >= allPaths.length) {
            return;
          }
          targetPath = allPaths[currentPathIndex + 1];
        } else {
          if (currentPathIndex - 1 < 0) {
            return;
          }
          targetPath = allPaths[currentPathIndex - 1];
        }
      }
      
      // Update path to show target path
      setPath(targetPath);

    } catch (error) {
      console.error("Error in handleChangePath:", error);
    }
  }, [conversationId, setPath]);

  return {
    handleChangePath,
  };
};
