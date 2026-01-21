import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Role, Message, Task, TaskStatus, TaskType } from './types';
import { PatientView } from './components/PatientView';
import { DoctorView } from './components/DoctorView';

const App = () => {
  const [currentView, setCurrentView] = useState<Role>(Role.DOCTOR);
  
  // App Global State (Simulating a database)
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  // Handlers
  const handleSendMessage = (text: string, sender: Role) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      content: text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleAssignTask = (type: TaskType, title: string, description: string) => {
    // Only one active task at a time for simplicity in this demo
    if (activeTask) {
      alert("Patient already has an active task.");
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      type,
      title,
      description,
      status: TaskStatus.PENDING,
      createdAt: Date.now()
    };

    setActiveTask(newTask);
    
    // System message in chat
    const sysMessage: Message = {
      id: Date.now().toString(),
      sender: Role.DOCTOR,
      content: `New Assessment Assigned: ${title}`,
      timestamp: Date.now(),
      isSystem: true
    };
    setMessages(prev => [...prev, sysMessage]);
  };

  const handleCompleteTask = (task: Task, result: any) => {
    const finishedTask: Task = {
      ...task,
      status: TaskStatus.COMPLETED,
      result
    };

    setCompletedTasks(prev => [finishedTask, ...prev]);
    setActiveTask(null);

    // System message
    const sysMessage: Message = {
      id: Date.now().toString(),
      sender: Role.PATIENT,
      content: `Assessment Completed: ${task.title}`,
      timestamp: Date.now(),
      isSystem: true
    };
    setMessages(prev => [...prev, sysMessage]);
  };

  const handleArchiveInterview = (chatHistory: Message[]) => {
      if (chatHistory.length === 0) return;

      const interviewTask: Task = {
          id: Date.now().toString(),
          type: TaskType.INTERVIEW,
          title: "Initial Interview Session",
          description: "Recorded chat session between Doctor and Patient",
          status: TaskStatus.COMPLETED,
          result: [...chatHistory], // Store a copy of messages
          createdAt: Date.now()
      };

      setCompletedTasks(prev => [interviewTask, ...prev]);
      
      const sysMessage: Message = {
        id: Date.now().toString(),
        sender: Role.DOCTOR,
        content: `Session Archived to Medical Records.`,
        timestamp: Date.now(),
        isSystem: true
      };
      setMessages(prev => [...prev, sysMessage]);
  };

  return (
    <div className="h-screen w-screen bg-slate-100 flex flex-col overflow-hidden">
      {/* Top Navigation Bar (Demo purposes only, to switch views) */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          </div>
          <h1 className="font-bold text-slate-800 text-lg">MediMind AI</h1>
        </div>

        <div className="flex bg-slate-100 rounded-lg p-1">
          <button 
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === Role.DOCTOR ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setCurrentView(Role.DOCTOR)}
          >
            Doctor View
          </button>
          <button 
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === Role.PATIENT ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setCurrentView(Role.PATIENT)}
          >
            Patient View
          </button>
        </div>
      </header>

      {/* Main App Canvas */}
      <main className="flex-1 overflow-hidden relative">
        {currentView === Role.DOCTOR ? (
          <DoctorView 
            messages={messages}
            completedTasks={completedTasks}
            onSendMessage={(text) => handleSendMessage(text, Role.DOCTOR)}
            onAssignTask={handleAssignTask}
            onArchiveInterview={handleArchiveInterview}
          />
        ) : (
          <PatientView 
            messages={messages}
            activeTask={activeTask}
            onSendMessage={(text) => handleSendMessage(text, Role.PATIENT)}
            onCompleteTask={handleCompleteTask}
          />
        )}
      </main>
    </div>
  );
};

export default App;