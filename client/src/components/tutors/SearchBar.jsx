import React, { useState, useRef, useEffect } from 'react';
import { debounce } from '../../utils/helpers';
import './SearchBar.css';

const SearchBar = ({ value, onSearch, placeholder = "Search...", suggestions = [] }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useRef(
    debounce((searchTerm) => {
      onSearch(searchTerm);
    }, 300)
  ).current;

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedSuggestion(-1);
    
    // Show suggestions if there's input and suggestions available
    setShowSuggestions(newValue.length > 0 && suggestions.length > 0);
    
    // Trigger debounced search
    debouncedSearch(newValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(inputValue);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestion]);
        } else {
          handleSubmit(e);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        inputRef.current?.blur();
        break;
      
      default:
        break;
    }
  };

  const handleFocus = () => {
    if (inputValue.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = (e) => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget)) {
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
      }
    }, 150);
  };

  const clearSearch = () => {
    setInputValue('');
    onSearch('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              className="search-input"
              autoComplete="off"
            />
            {inputValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="clear-search-btn"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          
          <button type="submit" className="search-submit-btn">
            Search
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div ref={suggestionsRef} className="search-suggestions">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`suggestion-item ${
                  index === selectedSuggestion ? 'selected' : ''
                }`}
                onMouseEnter={() => setSelectedSuggestion(index)}
              >
                <span className="suggestion-icon">🔍</span>
                <span className="suggestion-text">{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
