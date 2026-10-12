import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Coffee, Calendar as CalendarIcon, Info, Plus, Trash2, Edit2 } from 'lucide-react';

const MessMenu = () => {
  const { user } = useContext(AuthContext);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ date: '', meal_type: 'Breakfast', items: '', special_notes: '' });
  const [showModal, setShowModal] = useState(false);

  const fetchMenu = async () => {
    try {
      const res = await api.get('/mess/menu');
      
      // Group by date
      const grouped = res.data.data.reduce((acc, curr) => {
          const d = new Date(curr.date).toLocaleDateString('en-CA'); // YYYY-MM-DD local
          if (!acc[d]) acc[d] = [];
          acc[d].push(curr);
          return acc;
      }, {});
      
      // Sort dates descending
      const sortedKeys = Object.keys(grouped).sort((a,b) => new Date(b) - new Date(a));
      const sortedMenus = sortedKeys.map(k => [k, grouped[k]]);
      
      setMenus(sortedMenus);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/mess/menu', formData);
      setShowModal(false);
      setFormData({ date: '', meal_type: 'Breakfast', items: '', special_notes: '' });
      fetchMenu();
    } catch (error) {
      alert('Failed to save menu');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this menu item?')) return;
    try {
      await api.delete(`/mess/menu/${id}`);
      fetchMenu();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  const canManage = user.role === 'admin' || user.role === 'mess_incharge';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Campus Dining</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Daily Mess Menu</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Weekly schedule and meal offerings.</p>
        </div>
        {canManage && (
            <button onClick={() => setShowModal(true)} className="premium-button flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Menu
            </button>
        )}
      </div>

      <div className="space-y-6">
        {menus.length > 0 ? menus.map(([date, meals], index) => {
            const dateObj = new Date(date);
            const isToday = dateObj.toDateString() === new Date().toDateString();
            
            return (
            <div key={index} className="premium-card">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-xl text-orange-500">
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                            {isToday ? 'Today' : dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">Standard Menu</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(type => {
                        const meal = meals.find(m => m.meal_type === type);
                        return (
                            <div key={type} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700 relative group">
                                {canManage && meal && (
                                    <button onClick={() => handleDelete(meal.id)} className="absolute top-3 right-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                                    <Coffee className="w-4 h-4 text-orange-500" /> {type}
                                </h3>
                                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                    {meal ? (
                                        <>
                                        {meal.items.split(',').map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 mb-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> {item.trim()}
                                            </div>
                                        ))}
                                        {meal.special_notes && (
                                            <div className="mt-3 text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 p-2 rounded">
                                                Note: {meal.special_notes}
                                            </div>
                                        )}
                                        </>
                                    ) : <span className="italic text-slate-400">Not scheduled</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}) : (
            <div className="text-center py-20 premium-card">
                <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No Menus Published</h3>
                <p className="text-slate-500">The mess menu hasn't been uploaded yet.</p>
            </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Add Menu Items</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="premium-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Meal Type</label>
                <select required value={formData.meal_type} onChange={e => setFormData({...formData, meal_type: e.target.value})} className="premium-input">
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Items (comma separated)</label>
                <textarea required value={formData.items} onChange={e => setFormData({...formData, items: e.target.value})} className="premium-input h-24" placeholder="Rice, Dal, Paneer..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Special Notes (Optional)</label>
                <input type="text" value={formData.special_notes} onChange={e => setFormData({...formData, special_notes: e.target.value})} className="premium-input" placeholder="e.g. Festival Special" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="premium-button">Save Menu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MessMenu;
