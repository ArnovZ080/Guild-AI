import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  X,
  Send,
  Mic,
  Calendar,
  Clock,
  CheckCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';

const FloatingDock = ({ messages, setMessages, onSchedule, events, isOpen, setIsOpen, onPAInteraction, orchestratorConnected }) => {
  // Use prop-controlled state if provided, otherwise use local state
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const actualIsOpen = isOpen !== undefined ? isOpen : localIsOpen;
  const actualSetIsOpen = setIsOpen !== undefined ? setIsOpen : setLocalIsOpen;
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: Date.now(),
        type: 'assistant',
        content: "Hi! I'm your PA Agent. I can help you schedule events, set reminders, check availability, and optimize your calendar. What would you like me to help with?",
        timestamp: new Date(),
        quickActions: [
          'Check my availability today',
          'Schedule a meeting',
          'Set a reminder',
          'Optimize my week'
        ]
      }]);
    }
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Use orchestrator if available and connected
      if (orchestratorConnected && onPAInteraction) {
        await onPAInteraction(messageText);
        setIsTyping(false);
        return;
      }
    } catch (error) {
      console.error('PA Agent orchestrator interaction failed:', error);
    }

    // Fallback to local response generation
    setTimeout(() => {
      const response = generatePAResponse(messageText);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);

      // Execute any actions
      if (response.action) {
        executeAction(response.action);
      }
    }, 1500);
  };

  const generatePAResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    // Check availability
    if (lowerInput.includes('available') || lowerInput.includes('free')) {
      const todayEvents = events.filter(e => 
        new Date(e.date).toDateString() === new Date().toDateString()
      );
      
      return {
        id: Date.now() + 1,
        type: 'assistant',
        content: `You have ${todayEvents.length} events today. ${
          todayEvents.length < 3 ? 'You have good availability for additional meetings.' : 
          todayEvents.length < 5 ? 'Your day is moderately busy.' :
          'Your day is quite packed. Consider rescheduling if possible.'
        }`,
        timestamp: new Date(),
        quickActions: ['See full schedule', 'Block focus time', 'Reschedule low priority']
      };
    }
    
    // Schedule meeting or appointment
    if (lowerInput.includes('schedule') || lowerInput.includes('meeting') || lowerInput.includes('appointment') || lowerInput.includes('set')) {
      // Check for recurring appointment patterns - more comprehensive matching
      if ((lowerInput.includes('every') || lowerInput.includes('weekly')) && lowerInput.includes('wednesday') && (lowerInput.includes('lunch') || lowerInput.includes('wife'))) {
        return {
          id: Date.now() + 1,
          type: 'assistant',
          content: "Perfect! I'll set up a recurring weekly lunch appointment with your wife every Wednesday at 12:00 PM. Let me create this recurring event in your calendar.",
          timestamp: new Date(),
          action: { 
            type: 'schedule_recurring_appointment', 
            data: {
              title: 'Lunch with Wife',
              day: 'wednesday',
              time: '12:00 PM',
              recurring: true,
              frequency: 'weekly'
            }
          },
          quickActions: ['Confirm & Create', 'Change time', 'Add location', 'Set reminder']
        };
      }
      
      // More flexible pattern matching for recurring appointments
      if (lowerInput.includes('every') && lowerInput.includes('wednesday') && lowerInput.includes('12')) {
        return {
          id: Date.now() + 1,
          type: 'assistant',
          content: "Great! I'll create a recurring weekly appointment every Wednesday at 12:00 PM. What would you like to call this appointment?",
          timestamp: new Date(),
          action: { 
            type: 'schedule_recurring_appointment', 
            data: {
              title: 'Weekly Wednesday Appointment',
              day: 'wednesday',
              time: '12:00 PM',
              recurring: true,
              frequency: 'weekly'
            }
          },
          quickActions: ['Lunch with Wife', 'Personal Time', 'Business Meeting', 'Custom Title']
        };
      }
      
      // Check for other recurring patterns
      if (lowerInput.includes('every') && (lowerInput.includes('monday') || lowerInput.includes('tuesday') || lowerInput.includes('thursday') || lowerInput.includes('friday'))) {
        const day = lowerInput.includes('monday') ? 'monday' : 
                   lowerInput.includes('tuesday') ? 'tuesday' : 
                   lowerInput.includes('thursday') ? 'thursday' : 'friday';
        
        return {
          id: Date.now() + 1,
          type: 'assistant',
          content: `I'll set up a recurring appointment every ${day} for you. Let me know the time and details, and I'll create it in your calendar.`,
          timestamp: new Date(),
          action: { 
            type: 'schedule_recurring_appointment', 
            data: {
              day: day,
              recurring: true,
              frequency: 'weekly'
            }
          },
          quickActions: ['Set time', 'Add title', 'Confirm & Create']
        };
      }
      
      // Regular meeting scheduling
      return {
        id: Date.now() + 1,
        type: 'assistant',
        content: "I'll help you schedule that. I'm checking your calendar for the best available slots and coordinating with attendees.",
        timestamp: new Date(),
        action: { type: 'schedule_meeting', data: input },
        quickActions: ['Add to calendar', 'Send invites', 'Set reminder']
      };
    }
    
    // Set reminder
    if (lowerInput.includes('remind')) {
      return {
        id: Date.now() + 1,
        type: 'assistant',
        content: "I've set that reminder for you. You'll get a notification at the right time.",
        timestamp: new Date(),
        action: { type: 'set_reminder', data: input },
        quickActions: ['View all reminders', 'Edit timing', 'Add another']
      };
    }
    
    // Optimize
    if (lowerInput.includes('optimize')) {
      return {
        id: Date.now() + 1,
        type: 'assistant',
        content: "Let me analyze your schedule and suggest optimizations. I'll look at your workload, meeting density, and well-being indicators.",
        timestamp: new Date(),
        action: { type: 'optimize_week' },
        quickActions: ['View suggestions', 'Apply changes', 'Custom optimization']
      };
    }
    
    // Confirmation responses
    if (lowerInput.includes('confirm') && lowerInput.includes('create')) {
      return {
        id: Date.now() + 1,
        type: 'assistant',
        content: "Excellent! I've confirmed and created your appointment. The recurring lunch appointment with your wife every Wednesday at 12:00 PM is now active in your calendar.",
        timestamp: new Date(),
        action: { 
          type: 'confirm_appointment_creation',
          data: {
            title: 'Lunch with Wife',
            day: 'wednesday',
            time: '12:00 PM',
            recurring: true,
            frequency: 'weekly'
          }
        },
        quickActions: ['View in calendar', 'Set reminder', 'Add location', 'Edit appointment']
      };
    }
    
    // Quick action responses
    if (lowerInput.includes('change time')) {
      return {
        id: Date.now() + 1,
        type: 'assistant',
        content: "What time would you prefer for your weekly Wednesday lunch with your wife? Just let me know the new time and I'll update the appointment.",
        timestamp: new Date(),
        quickActions: ['12:30 PM', '1:00 PM', '11:30 AM', 'Custom time']
      };
    }
    
    if (lowerInput.includes('add location')) {
      return {
        id: Date.now() + 1,
        type: 'assistant',
        content: "Where would you like to have your weekly Wednesday lunch with your wife? I can add a location to the appointment.",
        timestamp: new Date(),
        quickActions: ['Home', 'Restaurant', 'Office', 'Custom location']
      };
    }
    
    if (lowerInput.includes('set reminder')) {
      return {
        id: Date.now() + 1,
        type: 'assistant',
        content: "I'll add a reminder for your weekly Wednesday lunch with your wife. How much notice would you like before each appointment?",
        timestamp: new Date(),
        quickActions: ['15 minutes before', '1 hour before', '1 day before', 'Custom reminder']
      };
    }
    
    // Time selection responses
    if (lowerInput.includes('12:30') || lowerInput.includes('12:30 pm')) {
      return {
        id: Date.now() + 1,
        type: 'assistant',
        content: "Perfect! I've updated your weekly Wednesday lunch with your wife to 12:30 PM. The appointment has been modified in your calendar.",
        timestamp: new Date(),
        action: { 
          type: 'update_appointment_time',
          data: {
            title: 'Lunch with Wife',
            day: 'wednesday',
            time: '12:30 PM',
            recurring: true,
            frequency: 'weekly'
          }
        },
        quickActions: ['Confirm change', 'View in calendar', 'Set reminder']
      };
    }
    
    if (lowerInput.includes('1:00') || lowerInput.includes('1:00 pm')) {
      return {
        id: Date.now() + 1,
        type: 'assistant',
        content: "Great choice! I've updated your weekly Wednesday lunch with your wife to 1:00 PM. The appointment has been modified in your calendar.",
        timestamp: new Date(),
        action: { 
          type: 'update_appointment_time',
          data: {
            title: 'Lunch with Wife',
            day: 'wednesday',
            time: '1:00 PM',
            recurring: true,
            frequency: 'weekly'
          }
        },
        quickActions: ['Confirm change', 'View in calendar', 'Set reminder']
      };
    }
    
    // Default
    return {
      id: Date.now() + 1,
      type: 'assistant',
      content: "I can help with that. Could you provide more details? I can schedule meetings, set reminders, check your availability, or optimize your calendar.",
      timestamp: new Date(),
      quickActions: ['Schedule meeting', 'Check availability', 'Set reminder', 'Optimize week']
    };
  };

  const executeAction = (action) => {
    if (action.type === 'schedule_meeting') {
      // This would trigger the add event modal
      console.log('Schedule meeting:', action.data);
    } else if (action.type === 'schedule_recurring_appointment') {
      // Create recurring appointment
      console.log('Schedule recurring appointment:', action.data);
      createRecurringAppointment(action.data);
    } else if (action.type === 'confirm_appointment_creation') {
      // Confirm and finalize appointment creation
      console.log('Confirm appointment creation:', action.data);
      createRecurringAppointment(action.data);
    } else if (action.type === 'update_appointment_time') {
      // Update appointment time
      console.log('Update appointment time:', action.data);
      createRecurringAppointment(action.data);
    } else if (action.type === 'set_reminder') {
      // This would create a reminder event
      console.log('Set reminder:', action.data);
    } else if (action.type === 'optimize_week') {
      // This would trigger optimization
      console.log('Optimize week');
    }
  };

  const createRecurringAppointment = (appointmentData) => {
    // Get current date and find next occurrence of the specified day
    const today = new Date();
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDayIndex = daysOfWeek.indexOf(appointmentData.day);
    
    // Find next occurrence of the target day
    const nextDate = new Date(today);
    const currentDayIndex = today.getDay();
    const daysUntilTarget = (targetDayIndex - currentDayIndex + 7) % 7;
    
    if (daysUntilTarget === 0 && today.getHours() >= 12) {
      // If it's the target day but past the appointment time, schedule for next week
      nextDate.setDate(today.getDate() + 7);
    } else {
      nextDate.setDate(today.getDate() + daysUntilTarget);
    }
    
    // Set the time (assuming 12:00 PM for lunch)
    const [hours, minutes] = appointmentData.time.replace(/[^\d:]/g, '').split(':');
    nextDate.setHours(parseInt(hours) + (appointmentData.time.includes('PM') && hours !== '12' ? 12 : 0), parseInt(minutes || 0), 0, 0);
    
    // Create the appointment event
    const appointmentEvent = {
      id: `recurring_${Date.now()}`,
      title: appointmentData.title || `Weekly ${appointmentData.day} appointment`,
      type: 'appointment',
      date: nextDate,
      time: appointmentData.time,
      duration: 60, // 1 hour default
      recurring: true,
      frequency: appointmentData.frequency,
      dayOfWeek: appointmentData.day,
      attendees: appointmentData.attendees || [],
      location: appointmentData.location || '',
      description: `Recurring ${appointmentData.frequency} appointment`,
      priority: 'medium',
      agentCreated: true,
      reminders: [15, 60]
    };
    
    // Add to calendar (this would integrate with the calendar service)
    console.log('Creating recurring appointment:', appointmentEvent);
    
    // Trigger the schedule callback to add the event
    if (onSchedule) {
      onSchedule(appointmentEvent);
    }
    
    // Show success message
    setMessages(prev => [...prev, {
      id: Date.now() + 2,
      type: 'assistant',
      content: `✅ Perfect! I've created your recurring ${appointmentData.frequency} lunch appointment with your wife every ${appointmentData.day} at ${appointmentData.time}. The first occurrence is scheduled for ${nextDate.toLocaleDateString()}.`,
      timestamp: new Date(),
      quickActions: ['View in calendar', 'Edit appointment', 'Set additional reminders']
    }]);
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleQuickAction = (action) => {
    // Handle specific quick actions that should trigger immediate responses
    if (action === 'Confirm & Create') {
      // Send a confirmation message
      const confirmMessage = {
        id: Date.now(),
        type: 'user',
        content: 'Confirm & Create',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmMessage]);
      
      // Generate immediate response
      setTimeout(() => {
        const response = generatePAResponse('confirm & create');
        setMessages(prev => [...prev, response]);
        
        // Execute the action if it exists
        if (response.action) {
          executeAction(response.action);
        }
      }, 500);
      return;
    }
    
    if (action === 'Change time') {
      const changeTimeMessage = {
        id: Date.now(),
        type: 'user',
        content: 'Change time',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, changeTimeMessage]);
      
      setTimeout(() => {
        const response = generatePAResponse('change time');
        setMessages(prev => [...prev, response]);
      }, 500);
      return;
    }
    
    if (action === 'Add location') {
      const addLocationMessage = {
        id: Date.now(),
        type: 'user',
        content: 'Add location',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, addLocationMessage]);
      
      setTimeout(() => {
        const response = generatePAResponse('add location');
        setMessages(prev => [...prev, response]);
      }, 500);
      return;
    }
    
    if (action === 'Set reminder') {
      const setReminderMessage = {
        id: Date.now(),
        type: 'user',
        content: 'Set reminder',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, setReminderMessage]);
      
      setTimeout(() => {
        const response = generatePAResponse('set reminder');
        setMessages(prev => [...prev, response]);
      }, 500);
      return;
    }
    
    // For other actions, use the default behavior
    setInputValue(action);
    handleSend();
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!actualIsOpen && (
          <motion.button
            className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all z-50"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => actualSetIsOpen(true)}
          >
            <Bot className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {actualIsOpen && (
          <motion.div
            className={`fixed ${isMinimized ? 'bottom-6 right-6' : 'bottom-6 right-6'} bg-white rounded-2xl shadow-2xl z-50 ${
              isMinimized ? 'w-80' : 'w-96'
            } ${isMinimized ? 'h-16' : 'h-[600px]'} flex flex-col overflow-hidden`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bot className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border border-white" />
                </div>
                <div>
                  <h3 className="font-bold">PA Agent</h3>
                  <p className="text-xs text-purple-100">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => actualSetIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`max-w-[80%] ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border border-gray-200'
                      } rounded-2xl p-3 shadow-sm`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        
                        {message.quickActions && (
                          <div className="mt-3 space-y-1">
                            {message.quickActions.map((action, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleQuickAction(action)}
                                className="block w-full text-left text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      className="flex justify-start"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t bg-white p-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleVoiceInput}
                      className={`p-2 rounded-lg transition-colors ${
                        isListening
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask me anything..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!inputValue.trim() || isTyping}
                      className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingDock;

