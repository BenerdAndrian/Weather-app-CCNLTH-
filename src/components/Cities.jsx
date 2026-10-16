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
            <div className="md:grid pb-[3rem] md:pb-0 md:grid-cols-[1.5fr_1fr] md:grid-rows-[40px_1fr_1fr_1fr] bg-black px-5">
                <div className="md:col-start-1 md:col-end-2 md:row-start-1 md:row-end-2">
                    <InputSection placeholder="Add a city to your list" onSubmit={(name) => addCity.mutate(name)} />
                </div>
                <div className="md:col-start-1 md:col-end-2 md:row-start-2 md:row-end-5 mt-[2rem]">
                    {savedCities.isError && <QueryError error={savedCities.error} onRetry={() => savedCities.refetch()} />}
                    {savedCities.isSuccess && cities.length === 0 && (
                        <p className="text-gray-400 text-center mt-10">No saved cities yet. Type a city above to add it.</p>
                    )}
                    <SearchedCities
                        cities={cities}
                        mode="trans"
                        selectedName={selected?.name}
                        onSelect={setSelectedName}
                        onDelete={(id) => deleteCity.mutate(id)}
                    />
                </div>
                {selectedWeather.data && (
                    <div className="md:col-start-2 md:col-end-3 md:row-start-2 row-end-5 md:ml-[2rem]">
                        <TodayTempMain forecast={selectedWeather.data} />
                        <div className="mb-4">
                            <TodayForecastSection targetHours={['06', '09', '12']} forecast={selectedWeather.data} />
                            <div className="mt-3">
                                <SevendayForecastSection numOfDays={3} forecast={selectedWeather.data} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
