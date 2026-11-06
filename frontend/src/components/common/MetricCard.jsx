import React from 'react';

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'blue',
  trend,
  onClick,
}) => {
  const schemes = {
    navy: {
      bg: 'bg-white',
      border: 'border-slate-200 hover:border-slate-300',
      iconBg: 'bg-slate-900 text-white',
      accent: 'text-slate-900',
    },
    blue: {
      bg: 'bg-white',
      border: 'border-sky-100 hover:border-sky-300',
      iconBg: 'bg-sky-50 text-sky-600',
      accent: 'text-sky-600',
    },
    indigo: {
      bg: 'bg-white',
      border: 'border-indigo-100 hover:border-indigo-300',
      iconBg: 'bg-indigo-50 text-indigo-700',
      accent: 'text-indigo-700',
    },
    emerald: {
      bg: 'bg-white',
      border: 'border-emerald-100 hover:border-emerald-300',
      iconBg: 'bg-emerald-50 text-emerald-600',
      accent: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-white',
      border: 'border-amber-100 hover:border-amber-300',
      iconBg: 'bg-amber-50 text-amber-600',
      accent: 'text-amber-600',
    },
    rose: {
      bg: 'bg-white',
      border: 'border-rose-100 hover:border-rose-300',
      iconBg: 'bg-rose-50 text-rose-600',
      accent: 'text-rose-600',
    },
  };

  const scheme = schemes[colorScheme] || schemes.blue;

  return (
    <div
      onClick={onClick}
      className={`${scheme.bg} ${scheme.border} relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.iconBg} shadow-sm`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">{trend.label}</span>
          <span className={`font-semibold ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
