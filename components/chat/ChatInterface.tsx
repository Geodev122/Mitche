import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Conversation, Message, ConversationType, MessageType } from '../../types-enhanced';
import { MessageBubble } from './MessageBubble';
import { ConversationList } from './ConversationList';

// Simple icons as SVG components instead of external library
const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const PaperclipIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
);

const EmojiHappyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface ChatInterfaceProps {
  requestId?: string;
  eventId?: string;
  participantIds?: string[];
  type?: ConversationType;
  conversationId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  requestId,
  eventId,
  participantIds = [],
  type = ConversationType.DirectMessage
  ,conversationId
}) => {
  const { user, enhancedFirebase } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user conversations
  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      setIsLoading(true);
      try {
        const response = await enhancedFirebase.getUserConversations(user.id);
        if (response.success && response.data) {
          setConversations(response.data);
          // If a conversationId was provided via props, try to select it
          if (conversationId) {
            const found = response.data.find(c => c.id === conversationId);
            if (found) {
              setActiveConversation(found);
            } else {
              // Fallback: try fetching the conversation directly by id
              try {
                const convResp = await enhancedFirebase.getConversationById(conversationId);
                if (convResp.success && convResp.data) {
                  setActiveConversation(convResp.data);
                  setConversations(prev => [convResp.data!, ...prev]);
                }
              } catch (err) {
                console.error('Error fetching conversation by id fallback:', err);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [user, enhancedFirebase]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConversation) return;

    const unsubscribe = enhancedFirebase.subscribeToMessages(
      activeConversation.id,
      (newMessages) => {
        setMessages(newMessages);
        scrollToBottom();
      }
    );

    return () => unsubscribe?.();
  }, [activeConversation, enhancedFirebase]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Create new conversation if needed
  const createConversation = async () => {
    if (!user || participantIds.length === 0) return;

    try {
      const conversationData: Partial<Conversation> = {
        type,
        participants: [user.id, ...participantIds],
        participantInfo: {
          [user.id]: {
            symbolicName: user.symbolicName || user.username,
            symbolicIcon: user.symbolicIcon || '👤',
            joinedAt: new Date()
          }
        },
        relatedId: requestId || eventId,
        relatedType: requestId ? 'Request' : eventId ? 'Event' : undefined,
        metadata: {
          title: type === ConversationType.DirectMessage ? 'Direct Message' : 
                 type === ConversationType.RequestChat ? 'Request Discussion' :
                 type === ConversationType.EventChat ? 'Event Chat' : 'Support Chat',
          description: '',
          tags: []
        },
        settings: {
          isPrivate: true,
          allowFileSharing: true,
          allowReactions: true,
          messageRetentionDays: 30,
          maxParticipants: type === ConversationType.DirectMessage ? 2 : 50
        }
      };

      const response = await enhancedFirebase.createConversation(conversationData);
      if (response.success && response.data) {
        setActiveConversation(response.data);
        setConversations(prev => [response.data!, ...prev]);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!user || !activeConversation || !newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const messageData: Partial<Message> = {
        conversationId: activeConversation.id,
        senderId: user.id,
        senderName: user.username,
        type: MessageType.Text,
        content: {
          text: newMessage.trim()
        },
        metadata: {
          edited: false,
          replyTo: null,
          mentions: [],
          tags: []
        }
      };

      const response = await enhancedFirebase.sendMessage(messageData, activeConversation.id);
      if (response.success) {
        setNewMessage('');
        // Update conversation last activity
        await enhancedFirebase.updateConversation(activeConversation.id, {
          lastActivity: new Date(),
          lastMessage: {
            content: newMessage.trim(),
            senderId: user.id,
            timestamp: new Date()
          }
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle key press for sending messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Mark messages as read
  const markAsRead = async () => {
    if (!user || !activeConversation) return;

    try {
      await enhancedFirebase.markMessagesAsRead(activeConversation.id, user.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Mark as read when conversation becomes active
  useEffect(() => {
    if (activeConversation) {
      markAsRead();
    }
  }, [activeConversation]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Please log in to access chat
      </div>
    );
  }

  return (
    <div className="flex h-96 bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Conversation List */}
      <div className="w-1/3 border-r border-gray-200">
        <ConversationList
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={setActiveConversation}
          isLoading={isLoading}
          onCreateConversation={createConversation}
          canCreate={participantIds.length > 0}
        />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                {activeConversation.metadata?.title || 'Chat'}
              </h3>
              <p className="text-sm text-gray-600">
                {activeConversation.participants.length} participants
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === user.id}
                  onReact={(messageId: string, reaction: string) =>
                    enhancedFirebase.addReaction(messageId, user.id, reaction)
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={1}
                    disabled={isSending}
                  />
                </div>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Attach file"
                  >
                    <PaperclipIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Add emoji"
                  >
                    <EmojiHappyIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Send message"
                  >
                    <SendIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="mb-2">Select a conversation to start chatting</p>
              {participantIds.length > 0 && (
                <button
                  onClick={createConversation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start New Chat
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};