import React, { useState } from 'react';
import type { TradeType, PostFilters } from '../types/api';

interface PostFilterProps {
  filters: PostFilters;
  onFiltersChange: (filters: PostFilters) => void;
  onSearch: (keyword: string) => void;
}

export const PostFilter: React.FC<PostFilterProps> = ({
  filters,
  onFiltersChange,
  onSearch
}) => {
  const [keyword, setKeyword] = useState(filters.keyword || '');
  const [priceRange, setPriceRange] = useState({
    min: filters.priceRange?.min || '',
    max: filters.priceRange?.max || ''
  });

  const handleSearch = () => {
    onSearch(keyword);
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTradeTypeChange = (tradeType: TradeType | '') => {
    onFiltersChange({
      ...filters,
      tradeType: tradeType || undefined
    });
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    const newPriceRange = { ...priceRange, [type]: value };
    setPriceRange(newPriceRange);

    const min = type === 'min' ? parseFloat(value) : priceRange.min ? parseFloat(priceRange.min as string) : undefined;
    const max = type === 'max' ? parseFloat(value) : priceRange.max ? parseFloat(priceRange.max as string) : undefined;

    onFiltersChange({
      ...filters,
      priceRange: (min !== undefined || max !== undefined) ? {
        min,
        max
      } : undefined
    });
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    onFiltersChange({
      ...filters,
      sortBy,
      sortOrder
    });
  };

  const clearFilters = () => {
    setKeyword('');
    setPriceRange({ min: '', max: '' });
    onFiltersChange({});
    onSearch('');
  };

  const hasActiveFilters = keyword || filters.tradeType || filters.priceRange?.min || filters.priceRange?.max;

  return (
    <div className="card p-6 mb-6">
      {/* 搜索框 */}
      <div className="mb-4">
        <label className="form-label">关键词搜索</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={handleKeywordKeyPress}
            placeholder="搜索标题或关键词..."
            className="form-input flex-1"
          />
          <button
            onClick={handleSearch}
            className="btn btn-primary"
          >
            搜索
          </button>
        </div>
      </div>

      {/* 筛选选项 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* 交易类型 */}
        <div>
          <label className="form-label">交易类型</label>
          <select
            value={filters.tradeType || ''}
            onChange={(e) => handleTradeTypeChange(e.target.value as TradeType)}
            className="form-input"
          >
            <option value="">全部类型</option>
            <option value="BUY">买入</option>
            <option value="SELL">卖出</option>
            <option value="LONG">做多</option>
            <option value="SHORT">做空</option>
          </select>
        </div>

        {/* 价格范围 */}
        <div>
          <label className="form-label">价格区间</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) => handlePriceRangeChange('min', e.target.value)}
              placeholder="最低价"
              className="form-input w-1/2"
            />
            <span className="self-center">-</span>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) => handlePriceRangeChange('max', e.target.value)}
              placeholder="最高价"
              className="form-input w-1/2"
            />
          </div>
        </div>

        {/* 排序方式 */}
        <div>
          <label className="form-label">排序方式</label>
          <div className="flex gap-2">
            <select
              value={filters.sortBy || 'createdAt'}
              onChange={(e) => handleSortChange(e.target.value, filters.sortOrder || 'desc')}
              className="form-input flex-1"
            >
              <option value="createdAt">发布时间</option>
              <option value="price">价格</option>
              <option value="dealCount">成交数</option>
            </select>
            <select
              value={filters.sortOrder || 'desc'}
              onChange={(e) => handleSortChange(filters.sortBy || 'createdAt', e.target.value as 'asc' | 'desc')}
              className="form-input w-20"
            >
              <option value="desc">降序</option>
              <option value="asc">升序</option>
            </select>
          </div>
        </div>
      </div>

      {/* 清除筛选 */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={clearFilters}
            className="btn btn-secondary"
          >
            清除筛选
          </button>
        </div>
      )}
    </div>
  );
};