
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

interface FeedbackBubbleProps {
  isActive: boolean;
  messages: Array<{
    id: string;
    text: string;
    type: 'good' | 'warning' | 'alert';
    timestamp: number;
  }>;
  onClose: () => void;
  onToggleExpand: () => void;
  isExpanded: boolean;
}

const FeedbackBubble: React.FC<FeedbackBubbleProps> = ({
  isActive,
  messages,
  onClose,
  onToggleExpand,
  isExpanded
}) => {
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && isExpanded) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);
  
  // Add new messages to visible messages
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (!visibleMessages.includes(latestMessage.id)) {
        setVisibleMessages(prev => [...prev, latestMessage.id]);
        
        // Remove message after 8 seconds
        setTimeout(() => {
          setVisibleMessages(prev => prev.filter(id => id !== latestMessage.id));
        }, 8000);
      }
    }
  }, [messages]);
  
  // Filter messages to only show those in the visibleMessages array
  const displayMessages = messages.filter(msg => visibleMessages.includes(msg.id));
  
  if (!isActive) return null;
  
  return (
    <motion.div 
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Feedback Messages Panel (Visible when expanded) */}
      {isExpanded && (
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 mb-2 w-72 max-h-80 overflow-y-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-sm">MirrorMe.AI Feedback</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {displayMessages.length > 0 ? (
                displayMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className={`feedback-message feedback-${msg.type} text-sm p-2 rounded`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {msg.text}
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic text-center py-4">
                  Feedback will appear here as you speak...
                </p>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </motion.div>
      )}
      
      {/* Main Bubble Button */}
      <motion.button
        className={`rounded-full p-3 bg-mirror-purple text-white shadow-lg flex items-center space-x-2
                   hover:bg-mirror-purple-dark transition-colors duration-300
                   ${displayMessages.length > 0 && !isExpanded ? 'animate-bounce-subtle' : ''}`}
        onClick={onToggleExpand}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {!isExpanded && displayMessages.length > 0 && (
          <span className="text-xs font-medium mr-1">{displayMessages.length}</span>
        )}
        <span className="font-medium">MirrorMe.AI</span>
        {isExpanded ? (
          <ChevronDown size={16} />
        ) : (
          <ChevronUp size={16} />
        )}
      </motion.button>
    </motion.div>
  );
};

export default FeedbackBubble;
