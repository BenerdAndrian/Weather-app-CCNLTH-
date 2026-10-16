import { Link, useRouteError } from "react-router-dom";

// Shown by React Router's error boundary (errorElement) when a route throws
// while rendering, and for unknown URLs.
export function RouteError({ notFound = false }) {
    const error = useRouteError();
    if (error) console.error(error);
    return (
        <div role="alert" className="min-h-[60vh] flex flex-col items-center justify-center text-center text-white gap-3 p-5">
            <h1 className="text-[1.5rem] font-bold">{notFound ? "Page not found" : "Something went wrong"}</h1>
            <p className="text-gray-400">
                {notFound ? "This page does not exist." : "An unexpected error happened while showing this page."}
            </p>
            <Link to="/weather" className="bg-blue-600 py-1.5 px-4 font-bold rounded-2xl">Back to weather</Link>
        </div>
    )
}
