import { TodayForecastSection, TodayTempMain, SevendayForecastSection, AirConditionSection } from "./Weather.jsx"
import backIcon from '../assets/img/back.svg'
import { Link, useParams } from "react-router-dom"
import { useWeather } from "../queries/weatherQueries"
import { LoadingPage } from "./LoadingPage"
import { QueryError } from "./QueryStatus"

// Same query key as the weather page; the cached forecast is shared.
export default function AirConditionDetailPage() {
    const { city } = useParams()
    const { data: forecast, isPending, isError, error, refetch } = useWeather(city)
    const targetHours = ['06', "09", "12"]
    return (
        <div className="air-page">
            {isPending && <LoadingPage />}
            <div className="page-heading">
                <Link to={`/weather/${encodeURIComponent(city)}`} aria-label="Back to weather" className="back-link">
                    <img src={backIcon} alt="" />
                    <span>Back to weather</span>
                </Link>
                <h1>Air Conditions</h1>
            </div>
            {isError && <QueryError error={error} onRetry={() => refetch()} />}
            {forecast && (
                <div className="air-layout">
                    <div className="air-main">
                        <TodayTempMain forecast={forecast} />
                        <AirConditionSection forecast={forecast} mode="card" />
                    </div>
                    <aside className="air-side">
                        <TodayForecastSection targetHours={targetHours} forecast={forecast} />
                        <SevendayForecastSection forecast={forecast} numOfDays={5} />
                    </aside>
                </div>
            )}
        </div>
    )
}
