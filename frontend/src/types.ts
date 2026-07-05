export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  department?: string;
  designation?: string;
  phone?: string;
  joiningDate?: string;
  status?: 'active' | 'inactive';
  profileImage?: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  startDate: string;
  dueDate: string;
  assignedEmployee?: User | string;
  createdBy?: User | string;
  updatedBy?: User | string;
  attachment?: string;
  comments?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  _id: string;
  user: string;
  message: string;
  read: boolean;
  type: string;
  task?: string;
  createdAt: string;
}