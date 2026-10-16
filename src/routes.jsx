import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import App from "./App";
import { LandingPage } from "./components/LandingPage";
import WeatherSection from "./components/Weather";
import AirConditionDetailPage from "./components/AirConditionDetail";
import CitiesPage from "./components/Cities";
import SettingPage from "./components/settings";
import { LoadingPage } from "./components/LoadingPage";
import { RouteError } from "./components/RouteError";
import { DEFAULT_CITY } from "./constants";

// The map page pulls in Leaflet (~150 kB), so it is split into its own
// chunk and only downloaded when the user opens /map.
const MapPage = lazy(() => import("./components/MapPage"));

const routes = [
    {
        path: "/",
        element: <App />,
        // Error boundary: any render error inside these routes shows RouteError
        // instead of a blank page.
        errorElement: <RouteError />,
        children: [
            { index: true, element: <LandingPage /> },
            { path: "weather", element: <Navigate to={`/weather/${DEFAULT_CITY}`} replace /> },
            // :city is a route param, so every city has its own shareable URL.
            { path: "weather/:city", element: <WeatherSection /> },
            { path: "weather/:city/air-conditions", element: <AirConditionDetailPage /> },
            { path: "cities", element: <CitiesPage /> },
            {
                path: "map",
                element: (
                    <Suspense fallback={<LoadingPage />}>
                        <MapPage />
                    </Suspense>
                ),
            },
            { path: "settings", element: <SettingPage /> },
            { path: "*", element: <RouteError notFound /> },
        ],
    },
];

export { routes };
