// Modal used to show an error message the user must acknowledge.
function ErrorPage({ message, handleStatus }) {
    return (
        <>
            <div className="error-backdrop"></div>
            <div role="alertdialog" aria-labelledby="error-title" className="error-dialog">
                <h2 id="error-title">The Weather App</h2>
                <p>{message}</p>
                <button onClick={handleStatus} className="primary-action">Ok</button>
            </div>
        </>
    )
}
export { ErrorPage }
