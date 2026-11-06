import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const CategoryPieChart = ({ data = [] }) => {
  const COLORS = ['#0284c7', '#1e3a8a', '#0d9488', '#8b5cf6'];

  const formattedData = data.map((item, index) => ({
    name: item.name || item.category,
    value: item.totalQuantity || item.count || 0,
    color: item.color || COLORS[index % COLORS.length],
  }));

  const totalQuantity = formattedData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Stock Distribution by Category
          </h3>
          <p className="text-xs text-slate-500">
            Total of {totalQuantity.toLocaleString()} physical items in inventory
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        {formattedData.length === 0 || totalQuantity === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No product categories registered yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const info = payload[0];
                    const percent = ((info.value / totalQuantity) * 100).toFixed(1);
                    return (
                      <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-lg border border-slate-800">
                        <p className="font-bold">{info.name}</p>
                        <p className="text-slate-300 mt-0.5">
                          {info.value.toLocaleString()} units ({percent}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
              />
              <Pie
                data={formattedData}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default CategoryPieChart;
