import React from 'react';
import { Message, MessageType } from '../../types-enhanced';
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReact?: (messageId: string, reaction: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onReact
}) => {
  const formatTime = (timestamp: Date | any) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const renderContent = () => {
    switch (message.type) {
      case MessageType.Text:
        return (
          <p className="text-sm whitespace-pre-wrap break-words">
            {typeof message.content === 'string' ? message.content : message.content?.text || ''}
          </p>
        );
      case MessageType.Image:
        return (
          <div>
            <img 
              src={typeof message.content === 'string' ? message.content : message.content?.url} 
              alt="Shared image"
              className="max-w-xs rounded-lg"
            />
            {(typeof message.content === 'object' && message.content?.caption) && (
              <p className="text-sm mt-2">{message.content.caption}</p>
            )}
          </div>
        );
      case MessageType.Document:
        return (
          <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {typeof message.content === 'object' && message.content?.filename || 'Document'}
              </p>
              <p className="text-xs text-gray-500">
                {typeof message.content === 'object' && message.content?.size && `${(message.content.size / 1024).toFixed(1)} KB`}
              </p>
            </div>
          </div>
        );
      default:
        return <p className="text-sm text-gray-500">Unsupported message type</p>;
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-lg px-3 py-2 ${
            isOwn
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-900'
          }`}
        >
          {!isOwn && (
            <p className="text-xs font-medium mb-1 opacity-75">
              {message.senderName}
            </p>
          )}
          {renderContent()}
          
          {/* Message reactions */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(message.reactions).map(([emoji, users]) => (
                <button
                  key={emoji}
                  onClick={() => onReact?.(message.id, emoji)}
                  className="text-xs bg-white bg-opacity-20 rounded-full px-2 py-1 hover:bg-opacity-30 transition-colors"
                >
                  {emoji} {users.length}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Message timestamp and status */}
        <div className={`flex items-center mt-1 space-x-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>
          {isOwn && message.deliveryStatus && (
            <span className={`text-xs ${
              message.deliveryStatus.status === 'delivered' ? 'text-green-500' :
              message.deliveryStatus.status === 'read' ? 'text-blue-500' :
              'text-gray-400'
            }`}>
              {message.deliveryStatus.status === 'read' ? '✓✓' : '✓'}
            </span>
          )}
          {message.metadata?.edited && (
            <span className="text-xs text-gray-400">(edited)</span>
          )}
        </div>
      </div>
    </div>
  );
};