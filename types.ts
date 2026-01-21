export enum Role {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  AI = 'AI'
}

export enum TaskType {
  INTERVIEW = 'INTERVIEW', // The chat itself
  DEPRESSION_SCALE = 'DEPRESSION_SCALE',
  TEXT_READING = 'TEXT_READING',
  HTP_TEST = 'HTP_TEST' // House-Tree-Person
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface Message {
  id: string;
  sender: Role;
  content: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  status: TaskStatus;
  result?: any; // Stores the survey answers, image URL, or analysis
  createdAt: number;
}

export interface AppState {
  activeRole: Role;
  messages: Message[];
  activeTask: Task | null; // The task currently being performed by the patient
  completedTasks: Task[];
}