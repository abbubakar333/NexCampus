import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { Search, Plus, X, UserCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const FacultyList = () => {
  const { user } = useContext(AuthContext);
  const [faculty, setFaculty] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    faculty_id: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    department: '',
    designation: 'Assistant Professor'
  });

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const res = await api.get('/faculty');
      setFaculty(res.data.data);
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
    try {
      const res = await api.post('/faculty', formData);
      if (res.data.success) {
        setFaculty([{ ...res.data.data, email: formData.email, is_active: true }, ...faculty]);
        setShowForm(false);
        setFormData({
          faculty_id: '',
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          department: '',
          designation: 'Assistant Professor'
        });
      }
    } catch (err) {
      alert('Failed to add faculty.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = faculty.filter(f => 
    f.first_name.toLowerCase().includes(search.toLowerCase()) || 
    f.last_name.toLowerCase().includes(search.toLowerCase()) || 
    f.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Faculty Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and view all faculty members</p>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition shadow-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Faculty
          </button>
        )}
      </div>
      
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <UserCheck className="w-5 h-5 mr-2 text-primary-500" />
                Add New Faculty
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Faculty ID*</label>
                  <input required type="text" name="faculty_id" value={formData.faculty_id} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500" placeholder="e.g. FAC-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department*</label>
                  <select required name="department" value={formData.department} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500">
                    <option value="">Select Department</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name*</label>
                  <input required type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name*</label>
                  <input required type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email (Login)*</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password*</label>
                  <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                  <select name="designation" value={formData.designation} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500">
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="HOD">Head of Department</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 font-medium disabled:opacity-50 transition">
                  {loading ? 'Adding...' : 'Add Faculty'}
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
              placeholder="Search faculty by name or department..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white" 
              value={search} 
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Faculty ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Designation</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No faculty found.
                  </td>
                </tr>
              ) : (
                filtered.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">{f.faculty_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{f.first_name} {f.last_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{f.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{f.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{f.designation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-medium rounded-full ${f.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {f.is_active !== false ? 'Active' : 'Disabled'}
                      </span>
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

export default FacultyList;