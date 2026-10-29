import { Link, useRouteError } from "react-router-dom";

// Shown by React Router's error boundary (errorElement) when a route throws
// while rendering, and for unknown URLs.
export function RouteError({ notFound = false }) {
    const error = useRouteError();
    if (error) console.error(error);
    return (
        <div role="alert" className="route-error">
            <h1>{notFound ? "Page not found" : "Something went wrong"}</h1>
            <p>
                {notFound ? "This page does not exist." : "An unexpected error happened while showing this page."}
            </p>
            <Link to="/weather" className="primary-action">Back to weather</Link>
        </div>
    )
}
