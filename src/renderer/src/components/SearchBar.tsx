import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Search, Filter, X, Clock } from 'lucide-react';
import { Trade, TradeOutcome, TradeType } from '../../../shared/types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select } from './ui/select';
import Fuse from 'fuse.js';

interface SearchFilters {
  dateFrom?: string;
  dateTo?: string;
  ticker?: string;
  outcome?: TradeOutcome | 'all';
  type?: TradeType | 'all';
  content?: string;
}

interface SearchBarProps {
  trades: Trade[];
  onSearchResults: (results: Trade[]) => void;
  onClearSearch: () => void;
  className?: string;
}

interface SearchSuggestion {
  type: 'ticker' | 'tag' | 'recent';
  value: string;
  count?: number;
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const RECENT_SEARCHES_KEY = 'trading-journal-recent-searches';
const MAX_RECENT_SEARCHES = 5;

export const SearchBar: React.FC<SearchBarProps> = ({
  trades,
  onSearchResults,
  onClearSearch,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    
    const newRecent = [term, ...recentSearches.filter(s => s !== term)]
      .slice(0, MAX_RECENT_SEARCHES);
    
    setRecentSearches(newRecent);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecent));
  }, [recentSearches]);

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    if (!trades.length) return null;

    const fuseOptions = {
      keys: [
        { name: 'ticker', weight: 0.3 },
        { name: 'preTradeNotes.thesis', weight: 0.2 },
        { name: 'preTradeNotes.riskAssessment', weight: 0.1 },
        { name: 'postTradeNotes.exitReason', weight: 0.1 },
        { name: 'postTradeNotes.lessonsLearned', weight: 0.1 },
        { name: 'duringTradeNotes.content', weight: 0.1 },
        { name: 'tags', weight: 0.1 }
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true
    };

    return new Fuse(trades, fuseOptions);
  }, [trades]);

  // Generate search suggestions
  const suggestions = useMemo((): SearchSuggestion[] => {
    if (!searchTerm.trim() || !trades.length) {
      return recentSearches.map(search => ({
        type: 'recent' as const,
        value: search
      }));
    }

    const allTickers = [...new Set(trades.map(t => t.ticker))];
    const allTags = [...new Set(trades.flatMap(t => t.tags))];
    
    const tickerSuggestions = allTickers
      .filter(ticker => ticker.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(ticker => ({
        type: 'ticker' as const,
        value: ticker,
        count: trades.filter(t => t.ticker === ticker).length
      }));

    const tagSuggestions = allTags
      .filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(tag => ({
        type: 'tag' as const,
        value: tag,
        count: trades.filter(t => t.tags.includes(tag)).length
      }));

    return [...tickerSuggestions, ...tagSuggestions].slice(0, 5);
  }, [searchTerm, trades, recentSearches]);

  // Perform search with filters
  const performSearch = useCallback(() => {
    if (!debouncedSearchTerm.trim() && !Object.values(filters).some(v => v && v !== 'all')) {
      onClearSearch();
      return;
    }

    let results = trades;

    // Apply text search using Fuse.js
    if (debouncedSearchTerm.trim() && fuse) {
      const fuseResults = fuse.search(debouncedSearchTerm);
      results = fuseResults.map(result => result.item);
    }

    // Apply filters
    if (filters.dateFrom) {
      results = results.filter(trade => trade.entryDate >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      results = results.filter(trade => trade.entryDate <= filters.dateTo!);
    }
    if (filters.ticker) {
      results = results.filter(trade => 
        trade.ticker.toLowerCase().includes(filters.ticker!.toLowerCase())
      );
    }
    if (filters.outcome && filters.outcome !== 'all') {
      results = results.filter(trade => trade.postTradeNotes?.outcome === filters.outcome);
    }
    if (filters.type && filters.type !== 'all') {
      results = results.filter(trade => trade.type === filters.type);
    }
    if (filters.content) {
      const contentFilter = filters.content.toLowerCase();
      results = results.filter(trade => 
        trade.preTradeNotes.thesis.toLowerCase().includes(contentFilter) ||
        trade.preTradeNotes.riskAssessment.toLowerCase().includes(contentFilter) ||
        trade.postTradeNotes?.exitReason?.toLowerCase().includes(contentFilter) ||
        trade.postTradeNotes?.lessonsLearned?.toLowerCase().includes(contentFilter) ||
        trade.duringTradeNotes.some(note => 
          note.content.toLowerCase().includes(contentFilter)
        )
      );
    }

    onSearchResults(results);
    
    // Save search term if it was a text search
    if (debouncedSearchTerm.trim()) {
      saveRecentSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, filters, trades, fuse, onSearchResults, onClearSearch, saveRecentSearch]);

  // Trigger search when search term or filters change
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchTerm(suggestion.value);
    setShowSuggestions(false);
    saveRecentSearch(suggestion.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilters({});
    setShowSuggestions(false);
    onClearSearch();
  };

  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'all');

  return (
    <div className={`relative ${className}`}>
      {/* Main search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search trades, tickers, notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-7 px-2 ${hasActiveFilters ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Filter className="h-4 w-4" />
          </Button>
          {(searchTerm || hasActiveFilters) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-7 px-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Search suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 p-2 shadow-lg">
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.value}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-gray-100 text-left"
              >
                {suggestion.type === 'recent' && <Clock className="h-3 w-3 text-gray-400" />}
                {suggestion.type === 'ticker' && <Badge variant="outline" className="text-xs">TICKER</Badge>}
                {suggestion.type === 'tag' && <Badge variant="outline" className="text-xs">TAG</Badge>}
                <span>{suggestion.value}</span>
                {suggestion.count && (
                  <span className="text-xs text-gray-400 ml-auto">{suggestion.count}</span>
                )}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Advanced filters */}
      {showFilters && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-40 p-4 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date From</label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date To</label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ticker</label>
              <Input
                type="text"
                placeholder="e.g., AAPL"
                value={filters.ticker || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, ticker: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Outcome</label>
              <Select
                value={filters.outcome || 'all'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, outcome: value as TradeOutcome | 'all' }))}
              >
                <option value="all">All Outcomes</option>
                <option value="win">Win</option>
                <option value="loss">Loss</option>
                <option value="breakeven">Breakeven</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value as TradeType | 'all' }))}
              >
                <option value="all">All Types</option>
                <option value="long">Long</option>
                <option value="short">Short</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Note Content</label>
              <Input
                type="text"
                placeholder="Search in notes..."
                value={filters.content || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, content: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setFilters({})}
              disabled={!hasActiveFilters}
            >
              Clear Filters
            </Button>
            <Button onClick={() => setShowFilters(false)}>
              Done
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};