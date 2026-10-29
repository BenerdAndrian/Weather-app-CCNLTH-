// Inline error panel for a failed query, with a retry button.
export function QueryError({ error, onRetry }) {
    const notFound = error?.code === "CITY_NOT_FOUND";
    return (
        <div role="alert" className="query-error">
            <p className="font-bold">{notFound ? "City not found" : "Could not load weather"}</p>
            <p className="text-gray-400 text-[0.9rem]">{error?.message}</p>
            {!notFound && (
                <button onClick={onRetry} className="primary-action">
                    Try again
                </button>
            )}
        </div>
    )
}

// Small badge shown while cached (stale) data is refreshed in the background.
export function RefreshingBadge({ show }) {
    if (!show) return null;
    return <span className="refreshing-badge" aria-live="polite">Updating…</span>
}
