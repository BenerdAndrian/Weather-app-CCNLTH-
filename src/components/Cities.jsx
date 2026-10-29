import { useState } from "react";
import { SearchedCities } from "./SearchedCities";
import { SevendayForecastSection, TodayForecastSection, TodayTempMain } from "./Weather";
import { InputSection } from "./Input";
import { ErrorPage } from "./ErrorPage";
import { LoadingPage } from "./LoadingPage";
import { QueryError } from "./QueryStatus";
import { useAddCity, useDeleteCity, useSavedCities } from "../queries/cityQueries";
import { useWeather } from "../queries/weatherQueries";

export default function CitiesPage() {
    const savedCities = useSavedCities();
    const addCity = useAddCity();
    const deleteCity = useDeleteCity();
    // UI state: which card the user clicked. If none (or it was deleted),
    // fall back to the first saved city. This is derived, not stored.
    const [selectedName, setSelectedName] = useState(null);
    const cities = savedCities.data ?? [];
    const selected = cities.find((c) => c.name === selectedName && !c.pending) ?? cities.find((c) => !c.pending);
    const selectedWeather = useWeather(selected?.name);

    const mutationError = addCity.error ?? deleteCity.error;
    const closeError = () => { addCity.reset(); deleteCity.reset(); };

    return (
        <>
            {mutationError && <ErrorPage message={mutationError.message} handleStatus={closeError} />}
            {savedCities.isPending && <LoadingPage />}
            <div className="cities-page">
                <div className="page-heading">
                    <h1>Cities</h1>
                    <InputSection placeholder="Add a city to your list" onSubmit={(name) => addCity.mutate(name)} />
                </div>
                <div className="cities-layout">
                <section className="cities-list-panel">
                    {savedCities.isError && <QueryError error={savedCities.error} onRetry={() => savedCities.refetch()} />}
                    {savedCities.isSuccess && cities.length === 0 && (
                        <div className="empty-state">
                            <h2>No saved cities yet</h2>
                            <p>Type a city above to add it.</p>
                        </div>
                    )}
                    <SearchedCities
                        cities={cities}
                        mode="trans"
                        selectedName={selected?.name}
                        onSelect={setSelectedName}
                        onDelete={(id) => deleteCity.mutate(id)}
                    />
                </section>
                <aside className="city-preview">
                    {selected && selectedWeather.isPending && <p className="inline-state" role="status">Loading forecast…</p>}
                    {selectedWeather.isError && <QueryError error={selectedWeather.error} onRetry={() => selectedWeather.refetch()} />}
                    {selectedWeather.data && (
                        <>
                            <TodayTempMain forecast={selectedWeather.data} />
                            <TodayForecastSection targetHours={['06', '09', '12']} forecast={selectedWeather.data} />
                            <SevendayForecastSection numOfDays={3} forecast={selectedWeather.data} />
                        </>
                    )}
                </aside>
                </div>
            </div>
        </>
    )
}
