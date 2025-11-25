import React from 'react';

export interface TradeType {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

interface TradeTypeTabsProps {
  types: TradeType[];
  activeType: string;
  onTypeChange: (typeId: string) => void;
}

export const TradeTypeTabs: React.FC<TradeTypeTabsProps> = ({
  types,
  activeType,
  onTypeChange,
}) => {
  return (
    <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
      {types.map((type) => {
        const isActive = activeType === type.id;

        return (
          <button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              isActive
                ? `${type.bgColor} ${type.color} shadow-md transform scale-105`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="text-sm">{type.icon}</span>
            <span className="text-sm font-medium">{type.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// 默认交易类型配置
export const DEFAULT_TRADE_TYPES: TradeType[] = [
  {
    id: 'ALL',
    label: '全部',
    icon: '📋',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'BUY',
    label: '求购',
    icon: '🟢',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 'SELL',
    label: '出售',
    icon: '🔴',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    id: 'LONG',
    label: '做多',
    icon: '📈',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'SHORT',
    label: '做空',
    icon: '📉',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
];