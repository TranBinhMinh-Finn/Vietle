import { useEffect, useRef, useState } from "react";

const AutoSuggestInput = ({provinceNames = [], handleSubmit = () => {}}) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState([false]);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const [isFocused, setIsFocused] = useState(false);
    const [isSelectionLocked, setIsSelectionLocked] = useState(false);

    const inputRef = useRef(null);
    const suggestionRefs = useRef([]); 

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
            .filter(item => 
                item.toLowerCase().includes(query.toLowerCase())
            )

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
        console.log('entered');
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
          const newIndex = prev < suggestions.length - 1 ? prev + 1 : prev;
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
          const newIndex = prev > 0 ? prev - 1 : -1;
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
        if (activeSuggestion >= 0) {
          handleSuggestionClick(suggestions[activeSuggestion]);
        } else {
            console.log('entered');
            handleSubmit();
        }
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
        
        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.split(regex);
        
        return parts.map((part, index) => 
        regex.test(part) ? (
            <span key={index} className="bg-amber-800 text-amber-100 font-medium">
            {part}
            </span>
        ) : (
            part
        )
        );
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
                className="px-3 py-2 
                    border border-[#3b4043] rounded-md 
                    focus:outline-none focus:ring-2 
                    text-sm w-full"
                    autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-[#181a1b] 
                rounded-lg shadow-lg border border-gray-100 overflow-hidden 
                z-50 animate-in slide-in-from-top-2 duration-200">
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