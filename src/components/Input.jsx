import { useEffect, useMemo, useState } from 'react';
import { normalizeCity } from '../queries/queryKeys';
import { useCitySuggestions } from '../queries/citySuggestionQueries';

// Search box. The typed text is local UI state; the parent decides what a
// submitted city means (open its forecast, or save it).
function InputSection({ onSubmit, placeholder = 'Search For A City', disabled = false, savedCities = [], includeSavedSuggestions = false }) {
    const [inputValue, setInputValue] = useState('');
    const [debouncedValue, setDebouncedValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(inputValue.trim()), 300);
        return () => clearTimeout(timer);
    }, [inputValue]);

    const suggestionsQuery = useCitySuggestions(debouncedValue);
    const savedMatches = useMemo(() => {
        const query = normalizeCity(inputValue);
        if (!includeSavedSuggestions || query.length < 2) return [];
        return savedCities
            .filter((city) => normalizeCity(city.name).includes(query))
            .slice(0, 5)
            .map((city) => ({ key: `saved-${city.id}`, label: city.address || city.name, value: city.name, source: 'Saved city' }));
    }, [includeSavedSuggestions, inputValue, savedCities]);

    const externalMatches = useMemo(() => {
        const query = normalizeCity(debouncedValue);
        if (query.length < 2 || inputValue.trim() !== debouncedValue) return [];
        const savedNames = new Set(savedCities.map((city) => normalizeCity(city.name)));
        return (suggestionsQuery.data ?? [])
            .filter((place) => !savedNames.has(normalizeCity(place.name)))
            .map((place) => ({ key: `external-${place.id}`, label: place.displayName, value: place.displayName, source: 'Vietnam' }));
    }, [debouncedValue, inputValue, savedCities, suggestionsQuery.data]);

    const suggestions = [...savedMatches, ...externalMatches];

    const chooseSuggestion = (value) => {
        setInputValue('');
        setDebouncedValue('');
        setIsOpen(false);
        onSubmit(value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const city = inputValue.trim();
        if (!city) return;
        chooseSuggestion(city);
    }
    return (
        <div className="city-search" onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
        }}>
            <form onSubmit={handleSubmit} role="search" className="search-form">
                <label className="search-label" htmlFor="city-search">{placeholder}</label>
                <input
                    className="search-field"
                    id="city-search"
                    value={inputValue}
                    onChange={(e) => { setInputValue(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(event) => {
                        if (event.key === 'Escape') setIsOpen(false);
                    }}
                    type="text"
                    placeholder={placeholder}
                    aria-label={placeholder}
                    aria-autocomplete="list"
                    aria-expanded={isOpen && (suggestions.length > 0 || suggestionsQuery.isFetching || suggestionsQuery.isError)}
                    aria-controls="city-suggestions"
                    maxLength={80}
                    disabled={disabled}
                />
                <button className="search-submit" type="submit" disabled={disabled}>Search</button>
            </form>
            {isOpen && inputValue.trim().length >= 2 && (suggestions.length > 0 || suggestionsQuery.isFetching || suggestionsQuery.isError) && (
                <div className="suggestions-panel" id="city-suggestions" role="listbox" aria-label="City suggestions">
                    {savedMatches.length > 0 && <p className="suggestions-heading">Saved cities</p>}
                    {savedMatches.map((suggestion) => (
                        <button
                            className="suggestion-option"
                            type="button"
                            role="option"
                            aria-selected="false"
                            key={suggestion.key}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => chooseSuggestion(suggestion.value)}
                        >
                            <span>{suggestion.label}</span>
                            <small>{suggestion.source}</small>
                        </button>
                    ))}
                    {externalMatches.length > 0 && <p className="suggestions-heading">Other locations in Vietnam</p>}
                    {externalMatches.map((suggestion) => (
                        <button
                            className="suggestion-option"
                            type="button"
                            role="option"
                            aria-selected="false"
                            key={suggestion.key}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => chooseSuggestion(suggestion.value)}
                        >
                            <span>{suggestion.label}</span>
                            <small>{suggestion.source}</small>
                        </button>
                    ))}
                    {suggestionsQuery.isFetching && <p className="suggestions-message" role="status">Searching Vietnamese locations…</p>}
                    {suggestionsQuery.isError && <p className="suggestions-message" role="status">City suggestions are unavailable. You can still submit the city name.</p>}
                    {!suggestionsQuery.isFetching && !suggestionsQuery.isError && suggestions.length === 0 && debouncedValue.length >= 2 && inputValue.trim() === debouncedValue && (
                        <p className="suggestions-message" role="status">No matching Vietnamese locations.</p>
                    )}
                </div>
            )}
        </div>
    )
}
export { InputSection }
