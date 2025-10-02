import React from 'react';
import { useParams } from 'react-router-dom';
import { ChatInterface } from '../components/chat/ChatInterface';

const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>
      {/* Render ChatInterface and allow it to load the conversation by id via enhancedService (it will list conversations and match id) */}
      <ChatInterface participantIds={[]} />
    </div>
  );
};

export default ChatPage;
