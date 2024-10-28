import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Calendar, Pin, Link, File, Image, User, AtSign } from 'lucide-react';
import { useMessages } from '../store/messages';
import { useUsers } from '../store/users';
import SearchResults from './SearchResults';

interface SearchBarProps {
  channelId: string;
  channelName?: string;
  serverId?: string;
  onHighlightMessage: (messageId: string) => void;
  isDM?: boolean;
}

export default function SearchBar({ 
  channelId, 
  channelName, 
  serverId,
  onHighlightMessage, 
  isDM = false 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { searchMessages } = useMessages();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowOptions(false);
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    
    // Add to search history
    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(h => h !== query)].slice(0, 5);
      return newHistory;
    });
    
    setShowResults(true);
    setShowOptions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowOptions(false);
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
    setSelectedFilter(null);
    inputRef.current?.focus();
  };

  const handleMessageClick = (messageId: string) => {
    onHighlightMessage(messageId);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => setShowOptions(true)}
          placeholder="Search"
          className="w-[240px] bg-[#1e1f22] text-white rounded px-8 py-1 focus:outline-none focus:ring-2 focus:ring-[#5865f2] placeholder-[#949ba4]"
        />
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#949ba4]" />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#949ba4] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-[440px] bg-[#2b2d31] rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-[#b5bac1] text-xs font-semibold mb-2">SEARCH OPTIONS</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#949ba4] hover:text-white cursor-pointer">
                <User className="w-4 h-4" />
                <span>from:</span>
                <span className="text-[#949ba4]">user</span>
              </div>
              <div className="flex items-center gap-2 text-[#949ba4] hover:text-white cursor-pointer">
                <AtSign className="w-4 h-4" />
                <span>mentions:</span>
                <span className="text-[#949ba4]">user</span>
              </div>
              <div className="flex items-center gap-2 text-[#949ba4] hover:text-white cursor-pointer">
                <Link className="w-4 h-4" />
                <span>has:</span>
                <span className="text-[#949ba4]">link, file, or embed</span>
              </div>
              <div className="flex items-center gap-2 text-[#949ba4] hover:text-white cursor-pointer">
                <Pin className="w-4 h-4" />
                <span>pinned:</span>
                <span className="text-[#949ba4]">true or false</span>
              </div>
            </div>

            {searchHistory.length > 0 && (
              <>
                <h3 className="text-[#b5bac1] text-xs font-semibold mt-4 mb-2">HISTORY</h3>
                <div className="space-y-1">
                  {searchHistory.map((term, index) => (
                    <div
                      key={index}
                      className="px-2 py-1 text-[#949ba4] hover:text-white hover:bg-[#35373c] rounded cursor-pointer"
                      onClick={() => {
                        setQuery(term);
                        handleSearch();
                      }}
                    >
                      {term}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showResults && (
        <SearchResults
          results={searchMessages(query, channelId, serverId, isDM)}
          onClose={() => setShowResults(false)}
          onMessageClick={handleMessageClick}
          channelId={channelId}
          channelName={channelName}
        />
      )}
    </div>
  );
}