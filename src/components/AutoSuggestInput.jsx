import { useEffect, useRef, useState } from "react";

const AutoSuggestInput = ({provinceNames = [], handleSubmit = () => {}, disabled=false}) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState([false]);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const [isFocused, setIsFocused] = useState(false);
    const [isSelectionLocked, setIsSelectionLocked] = useState(false);
    
    const inputRef = useRef(null);
    const suggestionRefs = useRef([]); 

    const removeAccents = (str) => {
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
    };

    useEffect(() => {
        if (isSelectionLocked) {
            setIsSelectionLocked(false);
            setShowSuggestions(false);
            return;
        }

        if (query.trim() === '' || provinceNames.length == 0) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const filtered = provinceNames
            .filter(item => {
              const normalizedItem = removeAccents(item.toLowerCase());
              const normalizedQuery = removeAccents(query.toLowerCase());
              return normalizedItem.includes(normalizedQuery);
            })

        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setActiveSuggestion(-1);
    }, [query]);

    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion);
        setIsSelectionLocked(true);
        setShowSuggestions(false);
        setActiveSuggestion(-1);
        handleFocus();
        // inputRef.current?.blur(); 
    };

    const handleKeyDown = (e) => {
    
    if(e.key == 'Enter' && activeSuggestion < 0) {
        handleSubmit();
        return;
    }
    if (!showSuggestions) {
        return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion(prev => {
          const newIndex = prev < suggestions.length - 1 ? prev + 1 : 0;
          setTimeout(() => {
            if (suggestionRefs.current[newIndex]) {
              suggestionRefs.current[newIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
              });
            }
          }, 0);
          return newIndex;
        });
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion(prev => {
          const newIndex = prev > 0 ? prev - 1 : suggestions.length - 1;
          setTimeout(() => {
            if (newIndex >= 0 && suggestionRefs.current[newIndex]) {
              suggestionRefs.current[newIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
              });
            }
          }, 0);
          return newIndex;
        });
        break;

      case 'Enter':
        e.preventDefault();
        if (activeSuggestion >= 0)
          handleSuggestionClick(suggestions[activeSuggestion]);

        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestion(-1);
        break;
        }
    };
    
    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
        setTimeout(() => {
        setShowSuggestions(false);
        }, 150);
    };

    const highlightMatch = (text, query) => {
      if (!query) return text;
        
      const normalizedQuery = removeAccents(query.toLowerCase());
      const regex = new RegExp(`(${normalizedQuery})`, 'gi');
      const normalizedText = removeAccents(text.toLowerCase());
      const parts = normalizedText.split(regex);
      const accentedParts = [];
      let currentIndex = 0;
      for (const part of parts) {
        const accentedPart = text.slice(currentIndex, currentIndex + part.length);
        accentedParts.push(accentedPart);
        currentIndex += part.length;
      }
      return parts.map((part, index) => {
        if (part.includes(normalizedQuery) && normalizedQuery.length > 0) {
          return (
            <span key={index} className="bg-amber-800 text-amber-100 font-medium">
                {accentedParts[index]}
              </span>
          );
        }
        else {
          return accentedParts[index];
        }
          
      });
    };

    return (
        <div className="relative">
            <input 
                id="guess" 
                ref={inputRef}
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={disabled}
                className="px-3 py-2 
                    border border-[#3b4043] rounded-md 
                    focus:outline-none focus:ring-2 
                    text-sm w-full"
                    autoComplete="off"
                
            />
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mt-3 bg-[#181a1b] 
                rounded-lg shadow-lg border border-gray-100 overflow-hidden 
                z-50 animate-in slide-in-from-bottom-2 duration-200">
                    <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {suggestions.map((suggestion, index) => (
                        <div
                        key={suggestion}
                        ref={el => suggestionRefs.current[index] = el}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`px-4 py-3 cursor-pointer transition-all duration-150 flex items-center ${
                            index === activeSuggestion
                            ? 'bg-gray-800 border-l-2 border-amber-500'
                            : 'hover:bg-gray-800'
                        }`}
                        >
                        <span className="">
                            {highlightMatch(suggestion, query)}
                        </span>
                        </div>
                    ))}
                    </div>
                </div>
            )}
        </div>
    )
};

export default AutoSuggestInput;