import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface AutocompleteInputProps {
    value: string;
    onChange: (value: string) => void;
    suggestions: string[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    icon?: React.ReactNode;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const AutocompleteInput = ({
    value,
    onChange,
    suggestions,
    placeholder,
    disabled,
    className,
    icon,
    onKeyDown,
}: AutocompleteInputProps) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter suggestions based on input
    useEffect(() => {
        if (value && !disabled) {
            // Check if value is an exact match
            const isExactMatch = suggestions.some(
                suggestion => suggestion.toLowerCase() === value.toLowerCase()
            );

            if (isExactMatch) {
                // Hide suggestions on exact match
                setFilteredSuggestions([]);
                setShowSuggestions(false);
            } else {
                // Filter suggestions that contain the input value
                const filtered = suggestions.filter(suggestion =>
                    suggestion.toLowerCase().includes(value.toLowerCase())
                );
                setFilteredSuggestions(filtered);
                setShowSuggestions(filtered.length > 0);
            }
        } else {
            setFilteredSuggestions([]);
            setShowSuggestions(false);
        }
    }, [value, suggestions, disabled]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSuggestionClick = (suggestion: string) => {
        onChange(suggestion);
        setShowSuggestions(false);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {icon}
                    </div>
                )}
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    onFocus={() => {
                        if (value && filteredSuggestions.length > 0) {
                            setShowSuggestions(true);
                        }
                    }}
                    placeholder={placeholder}
                    className={className}
                    disabled={disabled}
                />
                {suggestions.length > 0 && !disabled && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                )}
            </div>

            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredSuggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors first:rounded-t-xl last:rounded-b-xl focus:outline-none focus:bg-slate-100"
                        >
                            <span className="text-sm text-slate-700">{suggestion}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
