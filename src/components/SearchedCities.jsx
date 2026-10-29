import { CityCard } from "./CityCard";
import { useWeather } from "../queries/weatherQueries";
import { useSettings } from "../settings/settings";
import { formatTemp } from "../utils/unitConverter";

// List of saved cities. Each row runs its own weather query; rows for a
// city already viewed elsewhere are served from the cache.
function SearchedCities({ cities, mode, selectedName, onSelect, onDelete }) {
    return (
        <ul className="cities-list">
            {cities.map((city) => (
                <li key={city.id}>
                    <SavedCityRow
                        city={city}
                        mode={mode}
                        selected={city.name === selectedName}
                        onSelect={() => onSelect?.(city.name)}
                        onDelete={() => onDelete?.(city.id)}
                    />
                </li>
            ))}
        </ul>
    )
}

function SavedCityRow({ city, mode, selected, onSelect, onDelete }) {
    const { settings } = useSettings();
    const { data: forecast, isError } = useWeather(city.name);
    const localTime = forecast
        ? new Date(forecast.current.datetimeEpoch * 1000).toLocaleTimeString('en-US', {
            timeZone: forecast.timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: settings['12FormatTimer'],
        })
        : isError ? 'Unavailable' : 'Loading...';
    return (
        <CityCard
            mode={mode}
            pending={city.pending}
            selected={selected}
            onSelect={onSelect}
            deleteCity={onDelete}
            icon={forecast?.current.icon ?? 'cloudy'}
            address={city.address}
            currTime={localTime}
            temp={formatTemp(forecast?.current.temp, settings)}
        />
    )
}
export { SearchedCities }
