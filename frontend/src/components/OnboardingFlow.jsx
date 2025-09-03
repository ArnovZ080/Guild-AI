import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Loader2, Bot, User } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const API_URL = '/api'; // Use the Vite proxy to connect to local backend

const OnboardingFlow = ({ onOnboardingComplete }) => {
    const [sessionId] = useState(uuidv4());
    const [conversation, setConversation] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentState, setCurrentState] = useState('GREETING');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [conversation]);

    // Start the conversation on component mount
    useEffect(() => {
        const startConversation = async () => {
            try {
                const response = await fetch(`${API_URL}/onboarding/start`, { method: 'POST' });
                if (!response.ok) throw new Error('Failed to start onboarding.');
                const data = await response.json();

                setConversation(prev => [...prev, { sender: 'agent', text: data.agent_response }]);
                setCurrentState(data.next_state);
            } catch (error) {
                setConversation(prev => [...prev, { sender: 'agent', text: `Error: ${error.message}` }]);
            } finally {
                setIsLoading(false);
            }
        };
        startConversation();
    }, []);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const userMessage = { sender: 'user', text: userInput };
        setConversation(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/onboarding/converse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    current_state: currentState,
                    user_response: userInput,
                }),
            });
            if (!response.ok) throw new Error('Failed to get agent response.');
            const data = await response.json();

            setConversation(prev => [...prev, { sender: 'agent', text: data.agent_response }]);
            setCurrentState(data.next_state);

            if (data.is_complete) {
                // In a real app, we'd save the output_document and then call onOnboardingComplete
                setTimeout(() => {
                    onOnboardingComplete();
                }, 3000); // Wait 3 seconds before completing
            }
        } catch (error) {
            setConversation(prev => [...prev, { sender: 'agent', text: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-full p-4">
            <Card className="w-full max-w-2xl h-[80vh] flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center"><Bot className="mr-2" /> Onboarding Assistant</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto space-y-4">
                    {conversation.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'agent' && <Bot className="h-6 w-6 text-blue-500" />}
                            <div className={`rounded-lg p-3 max-w-[80%] ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            {msg.sender === 'user' && <User className="h-6 w-6" />}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </CardContent>
                <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Type your response..."
                            disabled={isLoading}
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export default OnboardingFlow;
