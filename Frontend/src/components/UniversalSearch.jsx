import React, { useState, useEffect, useRef } from 'react';
import '../styles/UniversalSearch.css';

const UniversalSearch = ({ 
  onSearch, 
  placeholder = "Search by name, email, or group...",
  searchTypes = ['groups', 'users', 'expenses'],
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Debounced search function
  const debouncedSearch = (query) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  };

  // Perform search API call
  const performSearch = async (query) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: query.trim(),
          types: searchTypes
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.results || []);
        setShowSuggestions(true);
      } else {
        // Fallback to mock data for demo
        setSuggestions(getMockSuggestions(query));
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to mock data
      setSuggestions(getMockSuggestions(query));
      setShowSuggestions(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock suggestions for demo purposes
  const getMockSuggestions = (query) => {
    const mockData = [
      { id: 1, type: 'group', title: 'Trip to Goa', subtitle: 'Travel Group', icon: '🏖️' },
      { id: 2, type: 'group', title: 'Office Lunch', subtitle: 'Food Group', icon: '🍕' },
      { id: 3, type: 'user', title: 'Alice Johnson', subtitle: 'alice@example.com', icon: '👤' },
      { id: 4, type: 'user', title: 'Bob Smith', subtitle: 'bob@example.com', icon: '👤' },
      { id: 5, type: 'expense', title: 'Dinner at Restaurant', subtitle: '₹450.00 - Trip to Goa', icon: '🍽️' },
      { id: 6, type: 'expense', title: 'Taxi Fare', subtitle: '₹120.00 - Office Lunch', icon: '🚗' }
    ];

    return mockData.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
    
    if (value.length > 0) {
      setIsExpanded(true);
    }
  };

  // Handle focus
  const handleFocus = () => {
    setIsExpanded(true);
    if (searchQuery.length >= 2) {
      setShowSuggestions(true);
    }
  };

  // Handle blur
  const handleBlur = () => {
    setTimeout(() => {
      setIsExpanded(false);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }, 200);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.title);
    setShowSuggestions(false);
    setIsExpanded(false);
    onSearch && onSearch(suggestion);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setIsExpanded(false);
        break;
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setIsExpanded(false);
    onSearch && onSearch(null);
  };

  // Highlight matching text
  const highlightText = (text, query) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="search-highlight">{part}</mark>
      ) : part
    );
  };

  // Get suggestion icon based on type
  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'group': return '👥';
      case 'user': return '👤';
      case 'expense': return '💰';
      default: return '🔍';
    }
  };

  return (
    <div className={`universal-search ${className} ${isExpanded ? 'expanded' : ''}`}>
      <div className="search-container">
        <div className="search-input-wrapper">
          <div className="search-icon">
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <span>🔍</span>
            )}
          </div>
          
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="search-input"
          />
          
          {searchQuery && (
            <button 
              className="clear-btn"
              onClick={clearSearch}
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div ref={suggestionsRef} className="suggestions-dropdown">
            <div className="suggestions-header">
              <span className="suggestions-title">Search Results</span>
              <span className="suggestions-count">{suggestions.length} found</span>
            </div>
            
            <div className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className={`suggestion-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="suggestion-icon">
                    {suggestion.icon || getSuggestionIcon(suggestion.type)}
                  </div>
                  
                  <div className="suggestion-content">
                    <div className="suggestion-title">
                      {highlightText(suggestion.title, searchQuery)}
                    </div>
                    <div className="suggestion-subtitle">
                      {highlightText(suggestion.subtitle, searchQuery)}
                    </div>
                  </div>
                  
                  <div className="suggestion-type">
                    {suggestion.type}
                  </div>
                </div>
              ))}
            </div>
            
            {suggestions.length === 0 && !isLoading && (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <div className="no-results-text">No results found</div>
                <div className="no-results-subtext">Try different keywords</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalSearch;
