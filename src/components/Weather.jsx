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
  const { data: savedCities = [] } = useSavedCities();
  // isPending: nothing cached yet. isFetching: any request in flight,
  // including a background refresh of cached data.
  const { data: forecast, isPending, isError, error, isFetching, refetch } = useWeather(city);

  return (
    <div className="weather-page">
      {isPending && <LoadingPage />}
      <div className="page-heading weather-heading">
        <h1>Weather</h1>
        <InputSection savedCities={savedCities} includeSavedSuggestions onSubmit={(name) => navigate(`/weather/${encodeURIComponent(name)}`)} />
      </div>
      {isError && <QueryError error={error} onRetry={() => refetch()} />}
      {forecast && (
        <div className="weather-grid">
          <div className="weather-main-column">
            <section>
              <TodayTempMain forecast={forecast} refreshing={isFetching && !isPending} />
              <SaveCityButton city={city} />
            </section>
            <TodayForecastSection forecast={forecast} targetHours={TARGET_HOURS} />
            <AirConditionSection forecast={forecast} mode={'board'} />
          </div>
          <aside className="weather-side-column">
            <SevendayForecastSection forecast={forecast} numOfDays={7} />
          </aside>
        </div>
      )}
    </div>
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
        className="save-city"
      >
        {isSaved ? 'Saved' : addCity.isPending ? 'Saving...' : '+ Save city'}
      </button>
    </>
  )
}

// component to render city name and temperature,icon
function TodayTempMain({ forecast, refreshing = false }) {
  const { settings } = useSettings();
  if (!forecast) return null;
  return (
    <div className="current-conditions">
      <div className="current-copy">
        <div>
          <h2>
            {forecast.resolvedAddress}
            <RefreshingBadge show={refreshing} />
          </h2>
          <p className="current-meta">Chance Of Rain: {forecast.current.precipprob ?? 0}%</p>
        </div>
        <p className="current-temp">{formatTemp(forecast.current.temp, settings)}</p>
      </div>
      <img className="current-icon" src={`/${forecast.current.icon}.png`} alt={forecast.current.icon} />
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
    <section className="surface">
      <div className="surface-heading"><h2>Today’s forecast</h2></div>
      <ul className="hour-list">
        {hours.map((hour) => (
          <li key={hour.datetime} className="hour-item">
            <p>{formatClock(hour.datetime, settings['12FormatTimer'])}</p>
            <img src={`/${hour.icon}.png`} alt={hour.icon} />
            <strong>{formatTemp(hour.temp, settings)}</strong>
          </li>
        ))}
      </ul>
    </section>
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
    <section className="surface">
      <div className="surface-heading"><h2>{numOfDays}-day forecast</h2></div>
      <ul className="day-list">
        {days.map((day) => (
          <li key={day.datetime} className="day-item">
            <p className="day-name">{extractWeekDay(day.datetime)}</p>
            <div className="day-condition">
              <img src={`/${day.icon}.png`} alt="" />
              <p>{discardHyphen(day.icon)}</p>
            </div>
            <p className="day-temp">
              {formatTemp(day.tempmax, settings)} / {formatTemp(day.tempmin, settings)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
export { TodayForecastSection, TodayTempMain, AirConditionSection, SevendayForecastSection }
