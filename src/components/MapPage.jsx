import { useState } from "react"
import { InputSection } from "./Input"
import MapComponent from "./MapComponent"
import { SearchedCities } from "./SearchedCities"
import { ErrorPage } from "./ErrorPage"
import { useAddCity, useSavedCities } from "../queries/cityQueries"
import { useWeather } from "../queries/weatherQueries"
import { DEFAULT_CITY } from "../constants"

export default function MapPage() {
    const savedCities = useSavedCities()
    const { data: cities = [] } = savedCities
    const addCity = useAddCity()
    const [selectedName, setSelectedName] = useState(null)
    const shownCity = selectedName ?? cities.find((c) => !c.pending)?.name ?? DEFAULT_CITY
    const weather = useWeather(shownCity)
    const { data: forecast } = weather

    return (
        <>
            {addCity.isError && <ErrorPage message={addCity.error.message} handleStatus={() => addCity.reset()} />}
            <div className="map-page">
                <div className="page-heading"><h1>Map</h1></div>
                <div className="map-layout">
                <section>
                    <InputSection placeholder="Add a city to your list" onSubmit={(name) => { addCity.mutate(name); setSelectedName(name) }} />
                    {weather.isPending && <p className="inline-state" role="status">Loading forecast…</p>}
                    {weather.isError && <QueryError error={weather.error} onRetry={() => weather.refetch()} />}
                    <MapComponent forecast={forecast} />
                </section>
                <aside className="cities-list-panel">
                    {savedCities.isPending && <p className="inline-state" role="status">Loading saved cities…</p>}
                    {savedCities.isError && <QueryError error={savedCities.error} onRetry={() => savedCities.refetch()} />}
                    {savedCities.isSuccess && cities.length === 0 && <p className="inline-state">No saved cities yet. Type a city above to add it.</p>}
                    <SearchedCities cities={cities} mode='no-trans' selectedName={shownCity} onSelect={setSelectedName} />
                </aside>
                </div>
            </div>
        </>
    )
}
