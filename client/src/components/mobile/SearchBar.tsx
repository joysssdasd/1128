import React, { useState, useRef, useEffect } from 'react';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'history' | 'popular' | 'suggestion';
}

interface SearchBarProps {
  onSearch: (keyword: string) => void;
  placeholder?: string;
  suggestions?: string[];
  showSuggestions?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "搜索交易信息...",
  suggestions = [],
  showSuggestions = true,
}) => {
  const [keyword, setKeyword] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // 热门关键词
  const popularKeywords = [
    'USDT', '比特币', '以太坊', '期权交易', '现货交易',
    '杠杆交易', '合约交易', '数字货币', '稳定币'
  ];

  // 获取搜索建议
  const getSuggestions = (): SearchSuggestion[] => {
    const results: SearchSuggestion[] = [];

    // 历史搜索
    if (!keyword) {
      searchHistory.slice(0, 3).forEach((text, index) => {
        results.push({
          id: `history-${index}`,
          text,
          type: 'history',
        });
      });
    }

    // 热门关键词
    if (!keyword) {
      popularKeywords.slice(0, 5).forEach((text, index) => {
        results.push({
          id: `popular-${index}`,
          text,
          type: 'popular',
        });
      });
    }

    // 实时建议
    if (keyword) {
      suggestions
        .filter(suggestion =>
          suggestion.toLowerCase().includes(keyword.toLowerCase())
        )
        .slice(0, 5)
        .forEach((text, index) => {
          results.push({
            id: `suggestion-${index}`,
            text,
            type: 'suggestion',
          });
        });
    }

    return results;
  };

  const handleSearch = (searchTerm: string = keyword) => {
    if (searchTerm.trim()) {
      // 添加到搜索历史
      const newHistory = [searchTerm, ...searchHistory.filter(item => item !== searchTerm)].slice(0, 10);
      setSearchHistory(newHistory);

      onSearch(searchTerm);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setKeyword(suggestion.text);
    handleSearch(suggestion.text);
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        {/* 搜索输入框 */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              // 延迟失去焦点，以便点击建议
              setTimeout(() => setIsFocused(false), 200);
            }}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ❌
            </button>
          )}
        </div>
      </form>

      {/* 搜索建议下拉框 */}
      {showSuggestions && isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
          {getSuggestions().length > 0 ? (
            <div className="py-2">
              {/* 搜索历史标题 */}
              {!keyword && searchHistory.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-500">
                  <span>搜索历史</span>
                  <button
                    onClick={clearHistory}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    清空
                  </button>
                </div>
              )}

              {/* 热门搜索标题 */}
              {!keyword && (
                <div className="px-4 py-2 text-sm text-gray-500 font-medium">
                  热门搜索
                </div>
              )}

              {/* 建议列表 */}
              {getSuggestions().map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                >
                  <span className="text-gray-400">
                    {suggestion.type === 'history' && '🕐'}
                    {suggestion.type === 'popular' && '🔥'}
                    {suggestion.type === 'suggestion' && '💡'}
                  </span>
                  <span className="text-gray-900">{suggestion.text}</span>
                  {suggestion.type === 'popular' && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                      热门
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : keyword ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              暂无相关建议
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 text-sm">
              暂无搜索历史
            </div>
          )}
        </div>
      )}
    </div>
  );
};