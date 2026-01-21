import React, { useState } from 'react';
import { Role, Message, Task, TaskType, TaskStatus } from '../types';
import { ChatInterface } from './ChatInterface';
import { Button } from './Button';
import { analyzeHTPImage, summarizeInterview, generateAIResponse } from '../services/geminiService';

interface DoctorViewProps {
  messages: Message[];
  completedTasks: Task[];
  onSendMessage: (text: string) => void;
  onAssignTask: (type: TaskType, title: string, desc: string) => void;
  onArchiveInterview: (messages: Message[]) => void;
}

export const DoctorView: React.FC<DoctorViewProps> = ({
  messages,
  completedTasks,
  onSendMessage,
  onAssignTask,
  onArchiveInterview
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'records'>('chat');
  const [analyzingTask, setAnalyzingTask] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<Record<string, string>>({});
  
  // Input state for AI Draft
  const [draftInput, setDraftInput] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  const handleSummarize = async () => {
    setIsSummarizing(true);
    const result = await summarizeInterview(messages);
    setSummary(result);
    setIsSummarizing(false);
  };

  const handleAnalyzeHTP = async (taskId: string, imageData: string) => {
    setAnalyzingTask(taskId);
    const analysis = await analyzeHTPImage(imageData);
    setAiAnalysisResult(prev => ({ ...prev, [taskId]: analysis }));
    setAnalyzingTask(null);
  };

  const handleAIDraft = async () => {
    setIsDrafting(true);
    const suggestion = await generateAIResponse(messages);
    setDraftInput(suggestion);
    setIsDrafting(false);
  };

  return (
    <div className="h-full flex flex-row">
      {/* Left Sidebar: Controls & Tasks */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shadow-lg z-10">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Dr. Dashboard</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-sm text-slate-500">Patient Online</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Action Modules */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Diagnostic Tools</h3>
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Depression Scale</div>
                    <div className="text-xs text-slate-500">PHQ-9 Adapted</div>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full text-xs h-8"
                  onClick={() => onAssignTask(TaskType.DEPRESSION_SCALE, 'Depression Assessment', 'Please answer the following questions honestly.')}
                >
                  Assign to Patient
                </Button>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Text Reading</div>
                    <div className="text-xs text-slate-500">Video Analysis</div>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full text-xs h-8"
                  onClick={() => onAssignTask(TaskType.TEXT_READING, 'Reading Assessment', 'Read the provided paragraph aloud.')}
                >
                  Assign to Patient
                </Button>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <div>
                    <div className="font-medium text-sm">HTP Test</div>
                    <div className="text-xs text-slate-500">Projective Drawing</div>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full text-xs h-8"
                  onClick={() => onAssignTask(TaskType.HTP_TEST, 'HTP Drawing Test', 'Draw a House, Tree, and Person.')}
                >
                  Assign to Patient
                </Button>
              </div>
            </div>
          </div>

          <div>
             <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Session Control</h3>
             <Button 
                variant="primary" 
                className="w-full text-sm bg-slate-800 hover:bg-slate-900"
                onClick={() => onArchiveInterview(messages)}
                disabled={messages.length === 0}
             >
                Finalize Interview
             </Button>
             <p className="text-xs text-slate-400 mt-2">Saves current chat log as 'Interview' task.</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Navigation Tabs */}
        <div className="bg-white border-b border-slate-200 px-6 pt-4 flex gap-6">
          <button 
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'chat' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('chat')}
          >
            Live Interview
          </button>
          <button 
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'records' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('records')}
          >
            Medical Records ({completedTasks.length})
          </button>
        </div>

        <div className="flex-1 p-6 overflow-hidden">
          {activeTab === 'chat' ? (
            <div className="h-full flex flex-col gap-4">
               <div className="flex-1 overflow-hidden relative">
                 <ChatInterface 
                   messages={messages} 
                   currentUserRole={Role.DOCTOR} 
                   onSendMessage={onSendMessage} 
                   inputValue={draftInput}
                   onInputChange={setDraftInput}
                 />
                 {/* AI Assist Overlay Button */}
                 <div className="absolute bottom-20 right-6">
                    <Button 
                        variant="secondary" 
                        className="shadow-lg text-xs rounded-full border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={handleAIDraft}
                        isLoading={isDrafting}
                    >
                        ✨ AI Suggestion
                    </Button>
                 </div>
               </div>
               
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                 <div className="flex justify-between items-center mb-2">
                   <h4 className="font-semibold text-slate-800 text-sm">Real-time Analysis</h4>
                   <Button variant="ghost" className="text-xs h-8" onClick={handleSummarize} isLoading={isSummarizing}>
                     Update Summary
                   </Button>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 max-h-32 overflow-y-auto">
                   {summary || "Chat with the patient to build context. Click update to generate insights."}
                 </div>
               </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto space-y-6">
              <h3 className="font-bold text-xl text-slate-800">Patient Portfolio</h3>
              
              {completedTasks.length === 0 && (
                <div className="text-slate-400 italic">No tasks completed yet.</div>
              )}

              {completedTasks.map(task => (
                <div key={task.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                          <h4 className="font-bold text-lg">{task.title}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${
                              task.type === TaskType.INTERVIEW ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}>
                              {task.type}
                          </span>
                      </div>
                      <p className="text-slate-500 text-sm">{new Date(task.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
                      Completed
                    </span>
                  </div>

                  {/* Render Task Specific Result */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    {task.type === TaskType.INTERVIEW && (
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-slate-700 mb-2">Chat Transcript:</p>
                            <div className="max-h-40 overflow-y-auto space-y-2 text-sm text-slate-600 bg-white p-3 rounded border border-slate-100">
                                {(task.result as Message[]).map(m => (
                                    <div key={m.id}>
                                        <span className="font-bold">{m.sender === Role.DOCTOR ? 'Dr.' : 'Pt.'}:</span> {m.content}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {task.type === TaskType.DEPRESSION_SCALE && (
                      <div className="space-y-2">
                        {Object.entries(task.result).map(([qId, ans]) => (
                           <div key={qId} className="flex justify-between text-sm border-b border-slate-200 pb-2 last:border-0">
                             <span className="text-slate-500">Question {qId}</span>
                             <span className="font-medium text-slate-800">{ans as string}</span>
                           </div>
                        ))}
                      </div>
                    )}

                    {task.type === TaskType.TEXT_READING && (
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                         </div>
                         <p className="text-sm font-medium text-slate-700">{task.result}</p>
                      </div>
                    )}

                    {task.type === TaskType.HTP_TEST && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-tight">Final Image</h5>
                            <img 
                              src={task.result.image} 
                              alt="HTP Drawing" 
                              className="w-full rounded-lg border border-slate-200 shadow-sm bg-white"
                            />
                          </div>
                          {task.result.video && (
                            <div className="space-y-2">
                              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-tight">Drawing Process</h5>
                              <div className="relative rounded-lg border border-slate-200 overflow-hidden shadow-sm bg-black aspect-[4/3]">
                                <video 
                                  src={task.result.video} 
                                  controls 
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                              AI Analysis
                            </h5>
                            {!aiAnalysisResult[task.id] && (
                                <Button size="sm" className="text-xs py-1 h-8" onClick={() => handleAnalyzeHTP(task.id, task.result.image)} isLoading={analyzingTask === task.id}>
                                  Analyze Drawing
                                </Button>
                            )}
                          </div>
                          {aiAnalysisResult[task.id] ? (
                            <p className="text-sm text-slate-700 leading-relaxed">{aiAnalysisResult[task.id]}</p>
                          ) : (
                            <p className="text-xs text-slate-400 italic">Analysis not yet generated.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};