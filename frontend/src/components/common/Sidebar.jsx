import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  AlertTriangle,
  Truck,
  FileSpreadsheet,
  PlusCircle,
  X,
  Cross,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inventory Management', href: '/inventory', icon: Boxes },
  { name: 'Stock In / Out', href: '/stock', icon: ArrowLeftRight },
  { name: 'Expiry Tracking', href: '/expiry', icon: AlertTriangle },
  { name: 'Supplier Management', href: '/suppliers', icon: Truck },
  { name: 'Reports & Analytics', href: '/reports', icon: FileSpreadsheet },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-slate-100 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo & Title */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20">
              <Cross className="w-5 h-5 rotate-45" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                MediStock <span className="text-sky-400 font-extrabold">Pro</span>
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Hospital Inventory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-1.5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Menu
          </p>
          {navigation.map((item) => {
            const isActive =
              item.href === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'
                  }`}
                />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Quick Stock Indicator Banner */}
        <div className="p-4 m-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              System Active
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Connected to Hospital Central Database
          </p>
        </div>

        {/* System Version */}
        <div className="border-t border-slate-800 p-4 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            Hospital Stock Management System v1.0
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
