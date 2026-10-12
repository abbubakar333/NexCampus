import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { Search, Plus, X, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const StudentsList = () => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    student_id: '',
    roll_number: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    course: 'B.Tech',
    semester: 1,
    section: 'A',
    admission_year: new Date().getFullYear(),
    dob: '',
    batch: `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await api.post('/students', formData);
      if (res.data.success) {
        setSuccess('Student added successfully.');
        setStudents([res.data.data, ...students]);
        setTimeout(() => {
          setShowForm(false);
          setSuccess(null);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s => 
    s.first_name?.toLowerCase().includes(search.toLowerCase()) || 
    s.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.student_id?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Student Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and view all students</p>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition shadow-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </button>
        )}
      </div>
      
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-500" />
                Add New Student
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>}
              {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded border border-green-200">{success}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-700 border-b border-slate-100 pb-2">Academic Details</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Student ID*</label>
                    <input required type="text" name="student_id" value={formData.student_id} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500" placeholder="e.g. STU-001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
                    <input type="text" name="roll_number" value={formData.roll_number} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Department*</label>
                    <select required name="department" value={formData.department} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500">
                      <option value="">Select Department</option>
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Course</label>
                      <input type="text" name="course" value={formData.course} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                      <input type="number" min="1" max="8" name="semester" value={formData.semester} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                      <input type="text" name="section" value={formData.section} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Admission Year</label>
                      <input type="number" name="admission_year" value={formData.admission_year} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded" />
                    </div>
                  </div>
                </div>

                {/* Personal Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-700 border-b border-slate-100 pb-2">Personal & Account Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">First Name*</label>
                      <input required type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Last Name*</label>
                      <input required type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email (Login)*</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password*</label>
                    <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded" />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 font-medium disabled:opacity-50">
                  {loading ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search students by name, ID, or email..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
              value={search} 
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sem</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Hostel</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                filtered.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">{student.student_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{student.first_name} {student.last_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{student.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{student.semester} - {student.section}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {student.hostel_status === 'hosteller' ? (
                        <div className="flex flex-col">
                          <span className="text-indigo-600 font-medium">Hosteller</span>
                          <span className="text-xs text-slate-500">{student.hostel_block || 'Unassigned'}, {student.room_number || 'No Room'}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-slate-600">Day Scholar</span>
                          <span className="text-xs text-slate-400">N/A</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-medium rounded-full ${student.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {student.is_active !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <button className="text-primary-600 hover:text-primary-800 font-medium mr-3">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentsList;