import { useState } from "react";

// Search box. The typed text is local UI state; the parent decides what a
// submitted city means (open its forecast, or save it).
function InputSection({ onSubmit, placeholder = "Search For A City", disabled = false }) {
    const [inputValue, setInputValue] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        const city = inputValue.trim();
        if (!city) return;
        onSubmit(city);
        setInputValue('');
    }
    return (
        <form onSubmit={handleSubmit} role="search" className="search-form">
            <label className="search-label" htmlFor="city-search">{placeholder}</label>
            <input
                className="search-field"
                id="city-search"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                type="text"
                placeholder={placeholder}
                aria-label={placeholder}
                maxLength={80}
                disabled={disabled}
            />
            <button className="search-submit" type="submit" disabled={disabled}>Search</button>
        </form>
    )
}
export { InputSection }
