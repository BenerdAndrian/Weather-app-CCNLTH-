import { useState } from "react"
import { InputSection } from "./Input"
import MapComponent from "./MapComponent"
import { SearchedCities } from "./SearchedCities"
import { ErrorPage } from "./ErrorPage"
import { useAddCity, useSavedCities } from "../queries/cityQueries"
import { useWeather } from "../queries/weatherQueries"
import { DEFAULT_CITY } from "../constants"

export default function MapPage() {
    const { data: cities = [] } = useSavedCities()
    const addCity = useAddCity()
    const [selectedName, setSelectedName] = useState(null)
    const shownCity = selectedName ?? cities.find((c) => !c.pending)?.name ?? DEFAULT_CITY
    const { data: forecast } = useWeather(shownCity)

    return (
        <>
            {addCity.isError && <ErrorPage message={addCity.error.message} handleStatus={() => addCity.reset()} />}
            <div className="bg-black grid gap-5 md:grid-cols-[1.5fr_1fr] md:grid-rows-[40px_1fr]">
                <div className="md:col-start-1 md:col-end-2 md:row-start-1 md:row-end-3 ml-3 mb-[2rem] pr-3 md:mb-0">
                    <InputSection placeholder="Add a city to your list" onSubmit={(name) => { addCity.mutate(name); setSelectedName(name) }} />
                    <MapComponent forecast={forecast} />
                </div>
                <div className="md:block md:col-start-2 md:col-end-3 md:row-start-2 md:row-end-3">
                    <SearchedCities cities={cities} mode='no-trans' selectedName={shownCity} onSelect={setSelectedName} />
                </div>
            </div>
        </>
    )
}
