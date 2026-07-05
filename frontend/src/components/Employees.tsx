import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee } from '../slices/employeeSlice';
import type { RootState, AppDispatch } from '../store';
import { styles } from '../styles';
import type { User } from '../types';

const Employees: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list, total, loading } = useSelector((state: RootState) => state.employees);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [editing, setEditing] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<any>({
    resolver: yupResolver(
      yup.object({
        name: yup.string().required(),
        email: yup.string().email().required(),
        department: yup.string(),
        designation: yup.string(),
        phone: yup.string(),
        joiningDate: yup.date().nullable(),
        password: yup.string().min(8).when('isEdit', (isEdit: any, schema: any) =>
          isEdit ? schema.optional() : schema.required('Password required')
        ),
        status: yup.string().oneOf(['active', 'inactive']),
      })
    ),
    defaultValues: { status: 'active', isEdit: false },
  });

  useEffect(() => {
    dispatch(fetchEmployees({ page, search, sort }));
  }, [dispatch, page, search, sort]);

  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(k => {
        if (k === 'isEdit') return;
        if (data[k] !== undefined && data[k] !== null && data[k] !== '') formData.append(k, data[k]);
      });
      if (editing) {
        await dispatch(updateEmployee({ id: editing._id, data: formData })).unwrap();
      } else {
        await dispatch(createEmployee(formData)).unwrap();
      }
      setShowModal(false);
      reset();
      setEditing(null);
      dispatch(fetchEmployees({ page, search, sort }));
    } catch (err: any) {
      // handled by thunk
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this employee?')) {
      await dispatch(deleteEmployee(id)).unwrap();
      dispatch(fetchEmployees({ page, search, sort }));
    }
  };

  const openModal = (emp: User | null = null) => {
    if (emp) {
      setEditing(emp);
      setValue('name', emp.name);
      setValue('email', emp.email);
      setValue('department', emp.department || '');
      setValue('designation', emp.designation || '');
      setValue('phone', emp.phone || '');
      setValue('joiningDate', emp.joiningDate ? emp.joiningDate.split('T')[0] : '');
      setValue('status', emp.status || 'active');
      setValue('isEdit', true);
    } else {
      reset({ status: 'active', isEdit: false });
      setEditing(null);
    }
    setShowModal(true);
  };

  return (
    <div style={styles.pageNoPadding}>
      <div style={styles.toolbarNoPad}>
        <h1 style={styles.pageTitle}>👥 Employees</h1>
        <div style={styles.toolbar}>
          <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={styles.input} />
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={styles.input}>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="department">Department</option>
          </select>
          <button onClick={() => openModal()} style={styles.button}>+ Add Employee</button>
        </div>
      </div>
      <div style={styles.tableWrapper}>
        {loading ? <div style={styles.loading}>Loading...</div> : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Name</th>
                <th style={{ width: '25%' }}>Email</th>
                <th style={{ width: '20%' }}>Department</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '20%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No employees found</td></tr>
              ) : (
                list.map(emp => (
                  <tr key={emp._id}>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.department}</td>
                    <td><span style={{ color: emp.status === 'active' ? '#22c55e' : '#ef4444' }}>{emp.status}</span></td>
                    <td>
                      <button onClick={() => openModal(emp)} style={styles.smallBtn}>✏️</button>
                      <button onClick={() => handleDelete(emp._id)} style={{ ...styles.smallBtn, background: '#ef4444' }}>🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      <div style={styles.pagination}>
        <span>Total: {total}</span>
        <div>
          <button onClick={() => setPage(p => Math.max(1, p-1))}>Prev</button>
          <span style={{ margin: '0 10px' }}>Page {page}</span>
          <button onClick={() => setPage(p => p+1)}>Next</button>
        </div>
      </div>

      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>{editing ? '✏️ Edit Employee' : '➕ Add Employee'}</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <input {...register('name')} placeholder="Name" style={styles.input} />
              <p style={styles.error}>{errors.name?.message?.toString()}</p>
              <input {...register('email')} placeholder="Email" style={styles.input} />
              <p style={styles.error}>{errors.email?.message?.toString()}</p>
              <input {...register('department')} placeholder="Department" style={styles.input} />
              <input {...register('designation')} placeholder="Designation" style={styles.input} />
              <input {...register('phone')} placeholder="Phone" style={styles.input} />
              <input {...register('joiningDate')} type="date" style={styles.input} />
              {!editing && <><input {...register('password')} type="password" placeholder="Password (min 8)" style={styles.input} />
              <p style={styles.error}>{errors.password?.message?.toString()}</p></>}
              <select {...register('status')} style={styles.input}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <input {...register('isEdit')} type="hidden" />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={styles.button}>Save</button>
                <button type="button" onClick={() => { setShowModal(false); setEditing(null); reset(); }} style={{ ...styles.button, background: '#6b7280' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;