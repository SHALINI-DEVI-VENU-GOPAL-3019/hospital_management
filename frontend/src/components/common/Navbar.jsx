import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Bell,
  LogOut,
  User,
  ShieldCheck,
  Building2,
  ChevronDown,
} from 'lucide-react';

export const Navbar = ({ toggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur transition-all">
      {/* Left side: Hamburger button + Hospital badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden focus:outline-none"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Central Hospital System</span>
          </div>
          <span className="text-xs text-slate-400 hidden md:inline">|</span>
          <span className="text-xs font-medium text-slate-500 hidden md:inline">
            {user?.department || 'Central Pharmacy & Stores'}
          </span>
        </div>
      </div>

      {/* Right side: Role badge + User profile menu */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Role Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>{user?.role || 'Staff'}</span>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-800 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-xs font-semibold text-slate-800 leading-none">
                {user?.name || 'Authorized User'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-none">
                {user?.email || 'user@hospital.com'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl z-20 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-50 text-sky-700">
                    {user?.role}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
