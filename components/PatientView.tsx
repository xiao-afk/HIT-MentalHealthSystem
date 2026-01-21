import React, { useState, useEffect, useRef } from 'react';
import { Role, Message, Task, TaskType, TaskStatus } from '../types';
import { ChatInterface } from './ChatInterface';
import { Button } from './Button';
import { generateDepressionScaleQuestions } from '../services/geminiService';
import { DrawingBoard } from './DrawingBoard';

interface PatientViewProps {
  messages: Message[];
  activeTask: Task | null;
  onSendMessage: (text: string) => void;
  onCompleteTask: (task: Task, result: any) => void;
}

export const PatientView: React.FC<PatientViewProps> = ({
  messages,
  activeTask,
  onSendMessage,
  onCompleteTask
}) => {
  const [scaleQuestions, setScaleQuestions] = useState<any[]>([]);
  const [scaleAnswers, setScaleAnswers] = useState<Record<number, string>>({});
  const [isLoadingTask, setIsLoadingTask] = useState(false);
  const [htpMode, setHtpMode] = useState<'draw' | 'upload'>('draw');
  
  // Camera Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Initialize task data when a task becomes active
  useEffect(() => {
    if (!activeTask) {
        setStream(null);
        setIsCameraActive(false);
        return;
    }

    if (activeTask.type === TaskType.DEPRESSION_SCALE) {
      setIsLoadingTask(true);
      generateDepressionScaleQuestions().then(q => {
        setScaleQuestions(q);
        setIsLoadingTask(false);
      });
    }
  }, [activeTask]);

  // Clean up stream on unmount or task end
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      alert("Permission denied or camera not found.");
    }
  };

  const handleFinishTask = () => {
    if (!activeTask) return;

    let result = null;

    if (activeTask.type === TaskType.DEPRESSION_SCALE) {
      result = scaleAnswers;
    } else if (activeTask.type === TaskType.TEXT_READING) {
      result = "Reading task completed (Video recorded successfully).";
      if (stream) stream.getTracks().forEach(track => track.stop());
    }

    onCompleteTask(activeTask, result);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeTask) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // For uploads, we only have the image
        onCompleteTask(activeTask, { image: base64, video: null });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrawingSave = (result: { image: string, video: string }) => {
    if (activeTask) {
      onCompleteTask(activeTask, result);
    }
  };

  // --- Render Task Overlays ---

  const renderTaskModal = () => {
    if (!activeTask) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{activeTask.title}</h3>
              <p className="text-sm text-slate-500">{activeTask.description}</p>
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50">
            {/* 1. Depression Scale */}
            {activeTask.type === TaskType.DEPRESSION_SCALE && (
              <div className="space-y-6">
                {isLoadingTask ? (
                  <div className="text-center py-10 flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-slate-500">Preparing assessment questions...</p>
                  </div>
                ) : (
                  scaleQuestions.map((q) => (
                    <div key={q.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="font-semibold text-slate-800 mb-3">{q.question}</p>
                      <div className="space-y-2">
                        {q.options?.map((opt: string) => (
                          <label key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-blue-100 hover:bg-blue-50 transition-all cursor-pointer group">
                            <input 
                              type="radio" 
                              name={`q-${q.id}`} 
                              value={opt}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                              onChange={() => setScaleAnswers(prev => ({...prev, [q.id]: opt}))}
                            />
                            <span className="text-sm text-slate-700 group-hover:text-blue-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))
                )}
                <Button 
                  onClick={handleFinishTask} 
                  className="w-full mt-4 py-3"
                  disabled={Object.keys(scaleAnswers).length < scaleQuestions.length}
                >
                  Submit Assessment
                </Button>
              </div>
            )}

            {/* 2. Text Reading */}
            {activeTask.type === TaskType.TEXT_READING && (
              <div className="space-y-6 text-center">
                {!isCameraActive ? (
                  <div className="py-12 bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    </div>
                    <p className="mb-6 text-slate-600 px-10">This task requires video and audio recording for speech and facial analysis.</p>
                    <Button onClick={startCamera}>Grant Camera & Mic Access</Button>
                  </div>
                ) : (
                  <>
                    <div className="relative bg-black rounded-xl overflow-hidden aspect-video mx-auto max-w-md shadow-lg">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div> RECORDING
                      </div>
                    </div>
                    <div className="bg-white p-8 rounded-xl border border-blue-100 shadow-sm text-left">
                      <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-4">Please Read Aloud:</h4>
                      <p className="text-slate-800 text-xl leading-relaxed font-medium italic">
                        "The sun was shining brightly over the meadow. Birds were chirping in the tall oak trees, and a gentle breeze rustled through the wildflowers. It was a perfect day for a walk."
                      </p>
                    </div>
                    <Button onClick={handleFinishTask} className="w-full py-3" variant="primary">
                      Finish and Stop Recording
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* 3. HTP Test */}
            {activeTask.type === TaskType.HTP_TEST && (
              <div className="space-y-6">
                <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm mb-2">
                  <button 
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${htpMode === 'draw' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setHtpMode('draw')}
                  >
                    Online Canvas
                  </button>
                  <button 
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${htpMode === 'upload' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setHtpMode('upload')}
                  >
                    Upload Photo
                  </button>
                </div>

                {htpMode === 'draw' ? (
                  <div className="space-y-4">
                     <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm border border-blue-100">
                       <p>Please use the tools below to draw a <strong>House</strong>, a <strong>Tree</strong>, and a <strong>Person</strong> in the canvas.</p>
                       <p className="mt-1 text-xs opacity-80">Your drawing process will be recorded for analysis.</p>
                     </div>
                     <DrawingBoard onSave={handleDrawingSave} />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-lg text-slate-700 border border-slate-200">
                      <p>Please draw a <strong>House</strong>, a <strong>Tree</strong>, and a <strong>Person</strong> on a piece of paper.</p>
                      <p className="mt-2 text-sm text-slate-500">When you are finished, take a clear photo of your drawing and upload it below.</p>
                    </div>
                    
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center bg-white hover:bg-slate-50 hover:border-blue-400 transition-all group">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 mb-4 transition-all">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <label className="cursor-pointer">
                        <span className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition shadow-md inline-block">Select Image File</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                      </label>
                      <p className="mt-4 text-xs text-slate-400">Supports JPG, PNG (Max 5MB)</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none p-4 bg-white border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">My Consultation</h2>
        <p className="text-sm text-slate-500">Communicating with Dr. Smith</p>
      </div>
      <div className="flex-1 p-4 overflow-hidden">
        <ChatInterface 
          messages={messages} 
          currentUserRole={Role.PATIENT} 
          onSendMessage={onSendMessage} 
        />
      </div>
      {renderTaskModal()}
    </div>
  );
};