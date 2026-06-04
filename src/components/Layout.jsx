import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, CalendarDays, BarChart3, LogOut, Menu } from 'lucide-react';
import { format } from 'date-fns';

const Layout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleScroll = (e) => {
    const currentScrollY = e.target.scrollTop;
    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      setShowNav(false); // scrolling down
    } else {
      setShowNav(true);  // scrolling up
    }
    setLastScrollY(currentScrollY);
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Calendar', path: '/calendar', icon: CalendarDays },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden text-text">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass border-r border-border/50 z-20">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            GM Super Service
          </h1>
          <p className="text-xs text-textMuted mt-1">Booking Manager</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm' 
                    : 'text-textMuted hover:bg-surface hover:text-text'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-textMuted hover:text-danger w-full px-4 py-3 rounded-xl hover:bg-danger/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 glass border-b border-border/50 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center">
            {/* Mobile Title */}
            <h1 className="md:hidden text-lg font-bold text-primary mr-4">GM Service</h1>
            <h2 className="hidden md:block text-lg font-medium text-text capitalize">
              {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1)}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{format(new Date(), 'EEEE, MMMM d')}</p>
              <p className="text-xs text-textMuted">0773181037</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main 
          onScroll={handleScroll} 
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 relative z-0"
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 glass border-t border-border/50 pb-safe z-30 transition-transform duration-300 ease-in-out ${showNav ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-primary' : 'text-textMuted'
                }`
              }
            >
              <item.icon className={`w-6 h-6 ${location.pathname === item.path ? 'fill-primary/20' : ''}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center w-full h-full space-y-1 text-textMuted hover:text-danger"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
