import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import employeesReducer from './slices/employeeSlice';
import tasksReducer from './slices/taskSlice';
import notificationsReducer from './slices/notificationSlice';
import dashboardReducer from './slices/dashboardSlice';
import reportsReducer from './slices/reportSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeesReducer,
    tasks: tasksReducer,
    notifications: notificationsReducer,
    dashboard: dashboardReducer,
    reports: reportsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;