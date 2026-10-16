import { useNavigate, useParams } from "react-router-dom";
import { InputSection } from "./Input";
import { LoadingPage } from "./LoadingPage";
import { ErrorPage } from "./ErrorPage";
import { QueryError, RefreshingBadge } from "./QueryStatus";
import { AirInfoBoard, AirInfoCard } from "./InfoCard.jsx";
import { useWeather } from "../queries/weatherQueries";
import { useAddCity, useSavedCities } from "../queries/cityQueries";
import { normalizeCity } from "../queries/queryKeys";
import { useSettings } from "../settings/settings";
import { formatClock, formatDistance, formatPressure, formatTemp, formatWind } from "../utils/unitConverter";
//importing images
import tempIcon from '../assets/img/temp.svg'
import sunIcon from '../assets/img/uvIndex.svg'
import windIcon from '../assets/img/wind.svg'
import waterDrop from '../assets/img/waterDrop.svg'
import visibility from '../assets/img/visibility.svg'
import sunset from '../assets/img/sunset.svg'
import shower from '../assets/img/shower.svg'
import pressure from '../assets/img/pressure.svg'

// the fixed hours shown in "Today's forecast"
const TARGET_HOURS = ['06', '09', '12', '15', '18', '21'];

// Main weather page. The city comes from the URL (/weather/:city), so the
// selected city is not duplicated in React state.
export default function WeatherSection() {
  const { city } = useParams();
  const navigate = useNavigate();
  // isPending: nothing cached yet. isFetching: any request in flight,
  // including a background refresh of cached data.
  const { data: forecast, isPending, isError, error, isFetching, refetch } = useWeather(city);

  return (
    <>
      {isPending && <LoadingPage />}
      <div className="md:grid md:grid-cols-[1.5fr_1fr] md:grid-rows-[40px_1fr_1fr_1fr] pb-[4rem] md:pb-0 bg-black gap-4 px-5">
        <div className="md:col-start-1 md:col-end-2 md:row-start-1 md:row-end-5">
          <InputSection onSubmit={(name) => navigate(`/weather/${encodeURIComponent(name)}`)} />
          {isError && <QueryError error={error} onRetry={() => refetch()} />}
          {forecast && (
            <>
              <div className="md:ml-[3rem]">
                <TodayTempMain forecast={forecast} refreshing={isFetching && !isPending} />
                <SaveCityButton city={city} />
              </div>
              <TodayForecastSection forecast={forecast} targetHours={TARGET_HOURS} />
              <AirConditionSection forecast={forecast} mode={'board'} />
            </>
          )}
        </div>
        <div className="md:col-start-2 md:col-end-3 md:row-start-2 md:row-end-5">
          {forecast && <SevendayForecastSection forecast={forecast} numOfDays={7} />}
        </div>
      </div>
    </>
  )
}

// Saves the current city on the server (mutation). Whether it is already
// saved is derived from the cached saved-cities list, not stored separately.
function SaveCityButton({ city }) {
  const { data: savedCities = [] } = useSavedCities();
  const addCity = useAddCity();
  const isSaved = savedCities.some((saved) => normalizeCity(saved.name) === normalizeCity(city));

  return (
    <>
      {addCity.isError && <ErrorPage message={addCity.error.message} handleStatus={() => addCity.reset()} />}
      <button
        onClick={() => addCity.mutate(city)}
        disabled={isSaved || addCity.isPending}
        className="mt-2 text-[0.8rem] font-bold rounded-full px-3 py-1 cursor-pointer bg-blue-600 text-white disabled:bg-gray-700 disabled:text-gray-300 disabled:cursor-default"
      >
        {isSaved ? 'Saved ✓' : addCity.isPending ? 'Saving…' : '+ Save city'}
      </button>
    </>
  )
}

// component to render city name and temperature,icon
function TodayTempMain({ forecast, refreshing = false }) {
  const { settings } = useSettings();
  if (!forecast) return null;
  return (
    <div className="grid grid-cols-2 bg-black">
      <div className="grid grid-rows-2">
        <div>
          <p className="font-bold text-white text-[1.5rem]">
            {forecast.resolvedAddress}
            <RefreshingBadge show={refreshing} />
          </p>
          <p className="text-gray-400">Chance Of Rain: {forecast.current.precipprob ?? 0}%</p>
        </div>
        <p className="font-bold text-white text-[1.6rem] mt-5">{formatTemp(forecast.current.temp, settings)}</p>
      </div>
      <img className="w-25 h-25 md:w-30 md:h-30 ml-[2rem] md:ml-[4rem]" src={`/${forecast.current.icon}.png`} alt={forecast.current.icon} />
    </div>
  )
}

// component to render timeframe forecast in today which render at fixed hours
function TodayForecastSection({ targetHours = [], forecast }) {
  const { settings } = useSettings();
  if (!forecast?.days?.length) return null;
  // datetime has the format "06:00:00", so compare the first two characters
  const hours = forecast.days[0].hours.filter((hour) => targetHours.includes(hour.datetime.split(':')[0]));
  return (
    <div className="bg-[rgb(30,40,55)] rounded-2xl pt-3 mt-3 px-3 pb-5">
      <h2 className="text-[lightgray] font-bold ml-[2rem] text-[0.7rem]">TODAY'S FORECAST</h2>
      <ul className="grid grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))] p-2">
        {hours.map((hour) => (
          <li key={hour.datetime} className="flex flex-col items-center justify-center border-r-1 border-r-gray-300 last:border-r-0 text-[0.6rem]">
            <p className="text-[lightgray] mb-2 text-[0.8rem]">{formatClock(hour.datetime, settings['12FormatTimer'])}</p>
            <img className="w-8 h-8" src={`/${hour.icon}.png`} alt={hour.icon} />
            <p className="font-bold text-white mt-2 pb-2 text-[0.95rem]">{formatTemp(hour.temp, settings)}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

//componenent to render air condition information at the time
function AirConditionSection({ forecast, mode }) {
  const { settings } = useSettings();
  if (!forecast) return null;
  const current = forecast.current;
  // values are derived from the forecast + settings on every render;
  // nothing converted is stored in state
  const categories = [
    { name: 'Real Feel', image: tempIcon, info: formatTemp(current.feelslike, settings) },
    { name: 'Wind', image: windIcon, info: formatWind(current.windspeed, settings) },
    { name: 'Chance Of Rain', image: waterDrop, info: `${current.precipprob ?? 0}%` },
    { name: 'UV Index', image: sunIcon, info: current.uvindex },
    { name: 'Humidity', image: shower, info: `${current.humidity}%` },
    { name: 'Visibility', image: visibility, info: formatDistance(current.visibility, settings) },
    { name: 'Pressure', image: pressure, info: formatPressure(current.pressure, settings) },
    { name: 'Sunset', image: sunset, info: formatClock(current.sunset, settings['12FormatTimer']) },
  ]
  return (
    <>
      {mode === 'board' && <AirInfoBoard categories={categories} num={4} />}
      {mode === 'card' && <AirInfoCard categories={categories} num={8} />}
    </>
  )
}

function SevendayForecastSection({ forecast, numOfDays = 0 }) {
  const { settings } = useSettings();
  if (!forecast?.days) return null;
  const days = forecast.days.slice(0, numOfDays);
  // "2026-10-16" -> "Fri". Parsed as local midnight so the weekday does not shift.
  const extractWeekDay = (datetime) =>
    new Date(`${datetime}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' });
  // icon names use hyphens ("partly-cloudy-day"); show them with spaces
  const discardHyphen = (string) => string.replace(/-/g, ' ');
  return (
    <div className="mt-[1rem] h-full md:mt-0 bg-[rgb(30,40,55)] rounded-2xl pt-4 px-[2rem]">
      <h2 className="text-[lightgray] font-bold text-[0.7rem]">{numOfDays}-DAY FORECAST</h2>
      <ul className="flex flex-col justify-between gap-3 mt-2 h-full">
        {days.map((day) => (
          <li key={day.datetime} className="flex py-3 justify-between items-center border-b-1 border-b-[rgb(60,60,80)] last:border-b-0 last:pb-8 -mt-[1rem] h-full">
            <p className="text-[lightgray] text-[0.7rem] font-bold w-8">{extractWeekDay(day.datetime)}</p>
            <div className="flex items-center h-[2.5rem]">
              <img className="w-8 h-8 mr-2" src={`/${day.icon}.png`} alt="" />
              <p className="text-white font-bold text-[0.8rem] w-10">{discardHyphen(day.icon)}</p>
            </div>
            <p className="text-white text-[0.7rem] font-bold">
              {formatTemp(day.tempmax, settings)} / {formatTemp(day.tempmin, settings)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
export { TodayForecastSection, TodayTempMain, AirConditionSection, SevendayForecastSection }
