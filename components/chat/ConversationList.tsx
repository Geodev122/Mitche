import React from 'react';
import { Conversation } from '../../types-enhanced';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  isLoading: boolean;
  onCreateConversation?: () => void;
  canCreate?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversation,
  onSelectConversation,
  isLoading,
  onCreateConversation,
  canCreate = false
}) => {
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) return conversation.title;
    if (conversation.metadata?.title) return conversation.metadata.title;
    if (conversation.type === 'DirectMessage') {
      return 'Direct Message';
    }
    if (conversation.type === 'RequestChat') {
      return 'Request Discussion';
    }
    if (conversation.type === 'EventChat') {
      return 'Event Chat';
    }
    if (conversation.type === 'SupportTicket') {
      return 'Support Chat';
    }
    return 'Chat';
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    if (conversation.lastMessage) {
      return conversation.lastMessage.content?.substring(0, 50) + 
             (conversation.lastMessage.content?.length > 50 ? '...' : '');
    }
    return 'No messages yet';
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-16 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Chats</h2>
          {canCreate && onCreateConversation && (
            <button
              onClick={onCreateConversation}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + New
            </button>
          )}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="mb-2">No conversations yet</p>
            {canCreate && onCreateConversation && (
              <button
                onClick={onCreateConversation}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Start your first chat
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  activeConversation?.id === conversation.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {getConversationTitle(conversation)}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {getLastMessagePreview(conversation)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {conversation.lastActivity && (
                      <span className="text-xs text-gray-400">
                        {formatTime(conversation.lastActivity)}
                      </span>
                    )}
                    {conversation.unreadCount && conversation.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Participants indicator */}
                <div className="flex items-center mt-2 space-x-1">
                  <div className="flex -space-x-1">
                    {conversation.participants.slice(0, 3).map((participantId, index) => (
                      <div
                        key={participantId}
                        className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center"
                        title={`Participant ${index + 1}`}
                      >
                        <span className="text-xs text-gray-600">
                          {String(index + 1)}
                        </span>
                      </div>
                    ))}
                    {conversation.participants.length > 3 && (
                      <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-xs text-white">
                          +{conversation.participants.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {conversation.participants.length} {conversation.participants.length === 1 ? 'participant' : 'participants'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};