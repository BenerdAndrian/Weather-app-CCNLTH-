// Modal used to show an error message the user must acknowledge.
function ErrorPage({ message, handleStatus }) {
    return (
        <>
            <div className="bg-black/80 fixed w-screen h-screen top-0 left-0 z-100"></div>
            <div role="alertdialog" aria-labelledby="error-title" className="bg-white text-[0.8rem] md:text-[1rem] fixed z-101 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 py-3 px-5 rounded-2xl max-w-[90vw]">
                <p id="error-title" className="font-bold text-center">The Weather App</p>
                <p className="text-center">{message}</p>
                <button onClick={handleStatus} className="py-1 px-7 bg-blue-600 text-white rounded-full block mx-auto font-bold cursor-pointer mt-2">Ok</button>
            </div>
        </>
    )
}
export { ErrorPage }
