import React, { useContext, useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { LogOut, Home, Users, BookOpen, Calendar, FileText, Settings, Bell, GraduationCap, Home as HomeIcon, Coffee, CreditCard, Activity, CheckSquare, Sun, Moon, Globe } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

const DashboardLayout = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-primary-600 font-medium dark:bg-slate-900">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  const getLinks = () => {
    switch (user.role) {
      case 'admin':
        return [
          { name: t('dashboard'), path: '/admin', icon: Home },
          { name: t('students'), path: '/admin/students', icon: Users },
          { name: t('faculty'), path: '/admin/faculty', icon: BookOpen },
          { name: t('attendance'), path: '/admin/attendance', icon: CheckSquare },
          { name: t('notices'), path: '/admin/notices', icon: Bell },
          { name: t('leaves'), path: '/admin/leaves', icon: FileText },
          { name: t('gatePasses'), path: '/admin/gate-passes', icon: Activity },
          { name: t('complaints'), path: '/admin/complaints', icon: Bell },
          { name: 'Certificates', path: '/admin/certificates', icon: GraduationCap },
          { name: t('hostel'), path: '/admin/hostel', icon: HomeIcon },
          { name: t('mess'), path: '/admin/mess', icon: Coffee },
          { name: t('fees'), path: '/admin/fees', icon: CreditCard },
          { name: 'Payments', path: '/admin/payments', icon: Activity },
          { name: t('settings'), path: '/admin/settings', icon: Settings },
        ];
      case 'faculty':
        return [
          { name: t('dashboard'), path: '/faculty', icon: Home },
          { name: t('attendance'), path: '/faculty/attendance', icon: CheckSquare },
          { name: t('students'), path: '/faculty/students', icon: Users },
          { name: t('leaves'), path: '/faculty/leaves', icon: FileText },
          { name: t('notices'), path: '/faculty/notices', icon: Bell },
        ];
      case 'hod':
        return [
          { name: t('dashboard'), path: '/hod', icon: Home },
          { name: t('students'), path: '/hod/students', icon: Users },
          { name: t('faculty'), path: '/hod/faculty', icon: BookOpen },
          { name: 'Timetable', path: '/hod/timetable', icon: Calendar },
          { name: t('attendance'), path: '/hod/attendance', icon: CheckSquare },
          { name: t('leaves'), path: '/hod/leaves', icon: FileText },
          { name: t('notices'), path: '/hod/notices', icon: Bell },
          { name: t('complaints'), path: '/hod/complaints', icon: Bell },
        ];
      case 'hostel_incharge':
        return [
          { name: t('dashboard'), path: '/hostel', icon: HomeIcon },
          { name: 'Manage Allocation', path: '/hostel/manage', icon: Users },
          { name: t('complaints'), path: '/hostel/complaints', icon: Bell },
          { name: t('notices'), path: '/hostel/notices', icon: Bell },
        ];
      case 'gate_incharge':
        return [
          { name: t('dashboard'), path: '/gate', icon: Activity },
          { name: 'Gate Passes', path: '/gate/passes', icon: FileText },
          { name: 'Reports', path: '/gate/reports', icon: FileText },
        ];
      case 'mess_incharge':
        return [
          { name: t('dashboard'), path: '/mess', icon: Coffee },
          { name: 'Daily Menu', path: '/mess/menu', icon: FileText },
          { name: t('complaints'), path: '/mess/complaints', icon: Bell },
          { name: t('notices'), path: '/mess/notices', icon: Bell },
        ];
      case 'account_section_incharge':
        return [
          { name: t('dashboard'), path: '/account', icon: CreditCard },
          { name: 'Fee Records', path: '/account/fees', icon: FileText },
          { name: 'Payments', path: '/account/payments', icon: Activity },
          { name: 'Reports', path: '/account/reports', icon: FileText },
        ];
      case 'examination_section_incharge':
        return [
          { name: t('dashboard'), path: '/exam', icon: GraduationCap },
          { name: 'Manage Exams', path: '/exam/manage', icon: FileText },
          { name: 'Timetable', path: '/exam/timetable', icon: Calendar },
          { name: t('notices'), path: '/exam/notices', icon: Bell },
        ];
      case 'student':
      default:
        return [
          { name: t('dashboard'), path: '/student', icon: Home },
          { name: t('attendance'), path: '/student/attendance', icon: CheckSquare },
          { name: t('examinations'), path: '/student/examinations', icon: GraduationCap },
          { name: t('notices'), path: '/student/notices', icon: Bell },
          { name: t('leaves'), path: '/student/leaves', icon: FileText },
          { name: t('gatePasses'), path: '/student/gate-pass', icon: Activity },
          { name: t('complaints'), path: '/student/complaints', icon: Bell },
          { name: t('hostel'), path: '/student/hostel', icon: HomeIcon },
          { name: t('mess'), path: '/student/mess', icon: Coffee },
          { name: t('fees'), path: '/student/fees', icon: CreditCard },
          { name: 'Certificates', path: '/student/certificates', icon: FileText },
          { name: t('profile'), path: '/student/profile', icon: Users },
        ];
    }
  };

  const links = getLinks();
  const activeLabelClass = "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:bg-primary-600 before:rounded-r-md";
  const inactiveLabelClass = "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200";

  return (
    <div className="flex h-screen bg-[#F7F8FA] dark:bg-[#0f172a] overflow-hidden transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white dark:bg-[#1e293b] border-r border-slate-100 dark:border-slate-800 flex-col hidden md:flex z-10 shadow-[2px_0_10px_-4px_rgba(0,0,0,0.02)] transition-colors duration-200">
        <div className="h-20 flex items-center px-8 border-b border-slate-100/60 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-md shadow-primary-500/20">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">NexCampus</h1>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">ONE CONNECTED EXPERIENCE</p>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 flex justify-between items-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('dashboard')}</p>
            <div className="flex items-center gap-1">
              <LanguageSwitcher />
              <button 
                onClick={toggleDarkMode}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-hide">
          <ul className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              // Check active status precisely
              let isActive = location.pathname === link.path;
              if (link.path !== `/${user.role}` && location.pathname.startsWith(link.path)) {
                  isActive = true;
              }

              return (
                <li key={link.path} className="relative">
                  <Link
                    to={link.path}
                    className={`flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 group ${isActive ? activeLabelClass : inactiveLabelClass}`}
                  >
                    <Icon className={`mr-3.5 h-5 w-5 transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} strokeWidth={isActive ? 2.5 : 2} />
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-[#1e293b]/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-100 to-primary-50 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold border border-primary-100 dark:border-primary-800 shadow-sm">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.profile?.first_name ? `${user.profile.first_name} ${user.profile.last_name}` : 'Admin User'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize font-medium">{user.role.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
          >
            <LogOut className="h-4 w-4" />
            {t('signOut')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 md:hidden z-20">
          <span className="text-xl font-bold text-primary-600">NexCampus</span>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={logout} className="text-slate-500 dark:text-slate-400 p-2"><LogOut className="h-5 w-5" /></button>
          </div>
        </header>
        
        {/* Main scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
