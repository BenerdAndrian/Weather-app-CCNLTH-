import { TodayForecastSection, TodayTempMain, SevendayForecastSection, AirConditionSection } from "./Weather.jsx"
import backIcon from '../assets/img/back.svg'
import { Link, useParams } from "react-router-dom"
import { useWeather } from "../queries/weatherQueries"
import { LoadingPage } from "./LoadingPage"
import { QueryError } from "./QueryStatus"

// Same query key as the weather page (['weather', city]): coming here from
// /weather/:city reads the cache, so no new request is sent.
export default function AirConditionDetailPage() {
    const { city } = useParams()
    const { data: forecast, isPending, isError, error, refetch } = useWeather(city)
    const targetHours = ['06', "09", "12"]
    return (
        <>
            {isPending && <LoadingPage />}
            <div className="bg-black md:grid md:grid-cols-[1.5fr_1fr] md:grid-rows-[40px_1fr_1fr_1fr] pb-[5rem] md:pb-0 gap-3 px-5">
                <div className="grid md:col-start-1 md:col-end-2 md:row-start-1 md:row-end-5">
                    <div className="md:row-start-1 md:row-end-2 flex text-center mb-3 ml-5">
                        <Link to={`/weather/${encodeURIComponent(city)}`} aria-label="Back to weather">
                            <img className="h-5 w-5" src={backIcon} alt="" />
                        </Link>
                        <h1 className="font-bold text-gray-400 w-full text-center">Air Conditions</h1>
                    </div>
                    {isError && <QueryError error={error} onRetry={() => refetch()} />}
                    <div className="md:row-start-2 md:row-end-3 md:ml-[3rem] mt-7">
                        <TodayTempMain forecast={forecast} />
                    </div>
                    <div className="md:row-start-3 md:row-end-5 mt-4">
                        <AirConditionSection forecast={forecast} mode={'card'} />
                    </div>
                </div>
                <div className="grid md:col-start-2 md:col-end-3 md:row-start-2 md:row-end-5 mt-3 md:-mt-[2rem]">
                    <div className="md:row-start-2 md:row-end-3 mb-3">
                        <TodayForecastSection targetHours={targetHours} forecast={forecast} />
                    </div>
                    <div className="md:row-start-3 md:row-end-5">
                        <SevendayForecastSection forecast={forecast} numOfDays={5} />
                    </div>
                </div>
            </div>
        </>
    )
}
