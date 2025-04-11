
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import AudioCapture from './AudioCapture';
import FeedbackBubble from './FeedbackBubble';
import { v4 as uuidv4 } from 'uuid';

interface FeedbackMessage {
  id: string;
  text: string;
  type: 'good' | 'warning' | 'alert';
  timestamp: number;
}

interface Stats {
  fillerWords: number;
  speakingPace: number;
  clarity: number;
  totalTime: number;
}

const Dashboard = () => {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [isFeedbackActive, setIsFeedbackActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState<Stats>({
    fillerWords: 0,
    speakingPace: 0,
    clarity: 0,
    totalTime: 0
  });
  
  const handleFeedback = (feedback: string, type: 'good' | 'warning' | 'alert') => {
    const newMessage: FeedbackMessage = {
      id: uuidv4(),
      text: feedback,
      type,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Update mock stats based on feedback type
    setStats(prev => ({
      ...prev,
      fillerWords: prev.fillerWords + (type === 'warning' ? 1 : 0),
      speakingPace: Math.min(100, prev.speakingPace + (type === 'alert' ? 5 : type === 'good' ? 2 : 0)),
      clarity: Math.min(100, prev.clarity + (type === 'good' ? 5 : -2)),
      totalTime: prev.totalTime + 5
    }));
    
    // Auto-activate and expand feedback on first message
    if (!isFeedbackActive) {
      setIsFeedbackActive(true);
      setIsExpanded(true);
    }
  };
  
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleCloseFeedback = () => {
    setIsFeedbackActive(false);
    setIsExpanded(false);
  };
  
  // Mock example feedbacks for demonstration
  const demoFeedbacks = [
    { text: "Great pace, keep it up! 👍", type: "good" as const },
    { text: "Try to avoid saying 'um' too much", type: "warning" as const },
    { text: "You're speaking too fast 🚀", type: "alert" as const },
    { text: "Good energy in your voice! 🔥", type: "good" as const },
    { text: "Consider pausing for emphasis", type: "warning" as const }
  ];
  
  // Function to trigger a demo feedback (for testing)
  const triggerDemoFeedback = () => {
    const randomFeedback = demoFeedbacks[Math.floor(Math.random() * demoFeedbacks.length)];
    handleFeedback(randomFeedback.text, randomFeedback.type);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-mirror-purple mb-2">MirrorMe.AI</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Your AI Voice Coach
        </p>
      </header>
      
      <Tabs defaultValue="record" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="record">Record & Analyze</TabsTrigger>
          <TabsTrigger value="stats">Your Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="record" className="space-y-6 py-4">
          <Card>
            <CardHeader>
              <CardTitle>Start Recording</CardTitle>
              <CardDescription>
                Click the button below to start recording and receiving real-time feedback.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <AudioCapture onFeedbackGenerated={handleFeedback} />
              
              {/* Test button for demo purposes */}
              <button 
                onClick={triggerDemoFeedback}
                className="mt-8 text-sm text-gray-500 hover:text-mirror-purple"
              >
                (Demo: Trigger random feedback)
              </button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>How it Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-mirror-purple-light flex items-center justify-center mb-3">
                    <span className="text-mirror-purple font-bold">1</span>
                  </div>
                  <h3 className="font-medium mb-2">Record Your Voice</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Allow microphone access and start speaking
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-mirror-purple-light flex items-center justify-center mb-3">
                    <span className="text-mirror-purple font-bold">2</span>
                  </div>
                  <h3 className="font-medium mb-2">AI Analysis</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Our AI analyzes your speaking patterns in real-time
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-mirror-purple-light flex items-center justify-center mb-3">
                    <span className="text-mirror-purple font-bold">3</span>
                  </div>
                  <h3 className="font-medium mb-2">Get Feedback</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive instant suggestions to improve your speaking
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-6 py-4">
          <Card>
            <CardHeader>
              <CardTitle>Speaking Statistics</CardTitle>
              <CardDescription>
                Your speaking performance metrics from this session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Filler Words</span>
                  <span className="text-sm text-gray-600">{stats.fillerWords} detected</span>
                </div>
                <Progress value={Math.min(100, stats.fillerWords * 10)} 
                          className={`h-2 ${stats.fillerWords > 5 ? 'bg-red-200' : 'bg-green-200'}`} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Speaking Pace</span>
                  <span className="text-sm text-gray-600">{stats.speakingPace}%</span>
                </div>
                <Progress value={stats.speakingPace} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Clarity</span>
                  <span className="text-sm text-gray-600">{stats.clarity}%</span>
                </div>
                <Progress value={stats.clarity} className="h-2" />
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Session Duration</span>
                  <span>{Math.floor(stats.totalTime / 60)}m {stats.totalTime % 60}s</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-3 p-2 border rounded-lg">
                      {msg.type === 'good' && <Check className="h-5 w-5 text-green-500" />}
                      {msg.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                      {msg.type === 'alert' && <X className="h-5 w-5 text-red-500" />}
                      <div>
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Info className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No feedback recorded yet. Start speaking to see feedback here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Feedback Bubble Component */}
      <FeedbackBubble 
        isActive={isFeedbackActive}
        messages={messages}
        onClose={handleCloseFeedback}
        onToggleExpand={handleToggleExpand}
        isExpanded={isExpanded}
      />
    </div>
  );
};

export default Dashboard;
