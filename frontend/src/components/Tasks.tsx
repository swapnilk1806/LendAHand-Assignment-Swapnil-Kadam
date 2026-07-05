import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { fetchTasks, createTask, updateTask, deleteTask } from '../slices/taskSlice';
import type { RootState, AppDispatch } from '../store';
import { API } from '../api';
import { styles } from '../styles';
import type { Task, User } from '../types';

const Tasks: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list, total, loading } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ status: '', priority: '' });
  const [sort, setSort] = useState('dueDate');
  const [editing, setEditing] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);

  // ---------- Yup Schema (strict) ----------
  const schema = yup.object({
    title: yup.string().required('Title is required'),
    description: yup.string(),
    priority: yup.string().oneOf(['Low', 'Medium', 'High', 'Urgent']).required('Priority is required'),
    status: yup.string().oneOf(['Pending', 'In Progress', 'Completed', 'Cancelled']).required('Status is required'),
    startDate: yup.string()
      .required('Start date is required')
      .matches(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD')
      .test('is-valid-date', 'Start date must be a valid date', (value) => !isNaN(Date.parse(value))),
    dueDate: yup.string()
      .required('Due date is required')
      .matches(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD')
      .test('is-valid-date', 'Due date must be a valid date', (value) => !isNaN(Date.parse(value)))
      .test('is-after-start', 'Due date cannot be before start date', function(value) {
        const start = this.parent.startDate;
        if (!start || !value) return true;
        return new Date(value) >= new Date(start);
      }),
    assignedEmployee: yup.string().required('Please select an employee'),
    attachment: yup.mixed().nullable(),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: {
      priority: 'Medium',
      status: 'Pending',
      startDate: new Date().toISOString().split('T')[0], // today
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 days
      assignedEmployee: '',
    },
  });

  // Fetch tasks and employees
  useEffect(() => {
    dispatch(fetchTasks({ page, search, ...filter, sort }));
    API.get('/employees')
      .then(res => setEmployees(res.data.data))
      .catch(() => toast.error('Failed to load employees list'));
  }, [dispatch, page, search, filter, sort]);

  // ---------- SUBMIT HANDLER (FIXED) ----------
  const onSubmit: SubmitHandler<any> = async (data) => {
    // Prevent editing completed tasks
    if (editing && data.status === 'Completed' && editing.status === 'Completed') {
      toast.error('Completed tasks cannot be edited');
      return;
    }

    // ----- Guard: ensure date fields are non-empty and valid -----
    // This should never trigger if Yup works, but it's a safety net.
    if (!data.startDate || !data.dueDate) {
      toast.error('Start date and due date are required');
      return;
    }
    // Ensure they are in YYYY-MM-DD format (already enforced by input type)
    // But we can force them to be valid dates:
    const start = new Date(data.startDate);
    const due = new Date(data.dueDate);
    if (isNaN(start.getTime()) || isNaN(due.getTime())) {
      toast.error('Please enter valid dates');
      return;
    }
    if (due < start) {
      toast.error('Due date cannot be before start date');
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (key === 'attachment') {
          if (value && value instanceof FileList && value.length > 0) {
            formData.append(key, value[0]);
          }
          return;
        }
        // Append all fields, including empty strings (they are guarded above)
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      if (editing) {
        await dispatch(updateTask({ id: editing._id, data: formData })).unwrap();
      } else {
        await dispatch(createTask(formData)).unwrap();
      }

      setShowModal(false);
      reset();
      setEditing(null);
      dispatch(fetchTasks({ page, search, ...filter, sort }));
    } catch (err: any) {
      // Error already shown by slice
      console.error('Task submission error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this task?')) {
      try {
        await dispatch(deleteTask(id)).unwrap();
        dispatch(fetchTasks({ page, search, ...filter, sort }));
      } catch (err) {
        // Error already shown
      }
    }
  };

  const openModal = (task: Task | null = null) => {
    if (task) {
      if (task.status === 'Completed') {
        toast.error('Completed task cannot be edited');
        return;
      }
      setEditing(task);
      setValue('title', task.title);
      setValue('description', task.description || '');
      setValue('priority', task.priority);
      setValue('status', task.status);
      setValue('startDate', task.startDate ? task.startDate.split('T')[0] : '');
      setValue('dueDate', task.dueDate ? task.dueDate.split('T')[0] : '');
      const assigned = typeof task.assignedEmployee === 'object' ? task.assignedEmployee?._id : task.assignedEmployee;
      setValue('assignedEmployee', assigned || '');
    } else {
      reset({
        priority: 'Medium',
        status: 'Pending',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignedEmployee: '',
        title: '',
        description: '',
      });
      setEditing(null);
    }
    setShowModal(true);
  };

  const priorityColors = { Low: '#22c55e', Medium: '#eab308', High: '#f59e0b', Urgent: '#ef4444' };

  // ----- JSX (unchanged) -----
  return (
    <div style={styles.pageNoPadding}>
      <div style={styles.toolbarNoPad}>
        <h1 style={styles.pageTitle}>📋 Tasks</h1>
        <div style={styles.toolbar}>
          <input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.input}
          />
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            style={styles.input}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            style={styles.input}
          >
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={styles.input}
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="createdAt">Created</option>
          </select>
          {user?.role === 'admin' && (
            <button onClick={() => openModal()} style={styles.button}>
              + Add Task
            </button>
          )}
        </div>
      </div>

      <div style={styles.tableWrapper}>
        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  list.map((task, index) => (
                    <tr key={task._id} style={{ background: index % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
                      <td style={{ fontWeight: '500' }}>{task.title}</td>
                      <td>
                        <span style={{ color: priorityColors[task.priority], fontWeight: 'bold' }}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            background:
                              task.status === 'Completed'
                                ? '#d1fae5'
                                : task.status === 'Pending'
                                ? '#fef3c7'
                                : task.status === 'In Progress'
                                ? '#dbeafe'
                                : '#f3f4f6',
                            color:
                              task.status === 'Completed'
                                ? '#065f46'
                                : task.status === 'Pending'
                                ? '#92400e'
                                : task.status === 'In Progress'
                                ? '#1e40af'
                                : '#6b7280',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                          }}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td>
                        {typeof task.assignedEmployee === 'object'
                          ? task.assignedEmployee?.name
                          : 'Unassigned'}
                      </td>
                      <td>
                        {new Date(task.dueDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td>
                        <button
                          onClick={() => openModal(task)}
                          style={styles.smallBtn}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          style={{ ...styles.smallBtn, background: '#ef4444' }}
                          title="Delete"
                        >
                          🗑️
                        </button>
                        {task.attachment && (
                          <a
                            href={`http://localhost:5000/uploads/${task.attachment}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.smallBtn}
                            title="Download"
                          >
                            📎
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={styles.pagination}>
        <span>Total: {total}</span>
        <div>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
          <span style={{ margin: '0 10px' }}>Page {page}</span>
          <button onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>

      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>{editing ? '✏️ Edit Task' : '➕ Add Task'}</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <input {...register('title')} placeholder="Title" style={styles.input} />
              <p style={styles.error}>{errors.title?.message?.toString()}</p>

              <textarea {...register('description')} placeholder="Description" style={styles.input} />

              <select {...register('priority')} style={styles.input}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
              <p style={styles.error}>{errors.priority?.message?.toString()}</p>

              <select {...register('status')} style={styles.input}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <p style={styles.error}>{errors.status?.message?.toString()}</p>

              <input {...register('startDate')} type="date" style={styles.input} />
              <p style={styles.error}>{errors.startDate?.message?.toString()}</p>

              <input {...register('dueDate')} type="date" style={styles.input} />
              <p style={styles.error}>{errors.dueDate?.message?.toString()}</p>

              <select {...register('assignedEmployee')} style={styles.input}>
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>
              <p style={styles.error}>{errors.assignedEmployee?.message?.toString()}</p>

              <input {...register('attachment')} type="file" accept=".pdf,.png,.jpg,.jpeg" style={styles.input} />

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={styles.button}>
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditing(null);
                    reset();
                  }}
                  style={{ ...styles.button, background: '#6b7280' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;