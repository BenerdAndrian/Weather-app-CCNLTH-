// Inline error panel for a failed query, with a retry button.
export function QueryError({ error, onRetry }) {
    const notFound = error?.code === "CITY_NOT_FOUND";
    return (
        <div role="alert" className="bg-[rgb(30,40,55)] rounded-2xl p-5 text-white mt-3">
            <p className="font-bold">{notFound ? "City not found" : "Could not load weather"}</p>
            <p className="text-gray-400 text-[0.9rem]">{error?.message}</p>
            {!notFound && (
                <button onClick={onRetry} className="bg-blue-600 rounded-full px-4 py-1 mt-3 font-bold cursor-pointer">
                    Try again
                </button>
            )}
        </div>
    )
}

// Small badge shown while cached (stale) data is refreshed in the background.
export function RefreshingBadge({ show }) {
    if (!show) return null;
    return <span className="text-[0.7rem] text-gray-400 ml-2" aria-live="polite">Updating…</span>
}
