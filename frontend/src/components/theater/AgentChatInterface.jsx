import React, { useState } from 'react';

const mockMessages = [
  { id: 1, sender: 'user', text: 'Generate a marketing campaign for our new product.' },
  { id: 2, sender: 'agent', agentName: 'Marketing Agent', text: 'Understood. I will start by researching the target audience and competitors. What is the product?' },
  { id: 3, sender: 'user', text: 'It\'s a new AI-powered coffee machine.' },
  { id: 4, sender: 'agent', agentName: 'Research Agent', text: 'Interesting. I am now gathering data on the smart home appliance market. I will provide a summary shortly.' },
];

const AgentChatInterface = () => {
  const [messages, setMessages] = useState(mockMessages);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;
    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputText,
    };
    setMessages([...messages, newMessage]);
    setInputText('');
    // In a real app, you would send the message to the backend here.
  };

  return (
    <div className="flex flex-col h-full bg-gray-700 rounded-lg">
      {/* Message History */}
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
            {msg.sender === 'agent' && <p className="text-xs text-gray-400 font-bold">{msg.agentName}</p>}
            <div className={`inline-block p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-gray-800'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-600">
        <div className="flex">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-grow p-2 rounded-l-lg bg-gray-800 text-white focus:outline-none"
            placeholder="Talk to your agents..."
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-600 text-white p-2 rounded-r-lg hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentChatInterface;
