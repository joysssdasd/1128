import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface BottomNavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

interface BottomNavProps {
  items: BottomNavItem[];
}

export const BottomNav: React.FC<BottomNavProps> = ({ items }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50">
      <div className="flex justify-around items-center">
        {items.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors relative ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs">{item.label}</span>

              {/* 徽章 */}
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};