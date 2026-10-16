import locationArrow from '../assets/img/locationArrow.svg'
import closeIcon from '../assets/img/closeIconn.svg'
function CityCard({ icon, address, currTime, temp, deleteCity, onSelect, mode, pending = false, selected = false }) {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(address)}`;
    return (
        <div className={`flex gap-3 group ${pending ? 'opacity-50' : ''}`}>
            {/* Primary Element */}
            <div className={`flex justify-between bg-[rgb(30,40,55)] p-5 px-8 rounded-3xl mb-5 border ${selected ? 'border-blue-500' : 'border-transparent'} ${mode === 'trans' ? 'hover:border-blue-500 transition-[width] duration-700 ease-in-out' : ''} w-full`}>
                <div className="flex items-center">
                    <img className="hidden md:block md:w-20 md:h-20 mr-8" src={`/${icon}.png`} alt="" />
                    <p className="flex flex-col gap-3">
                        <span className="font-bold text-white text-[1.2rem] flex items-center">
                            <button type="button" onClick={onSelect} disabled={pending} className="cursor-pointer text-left">
                                {address.toUpperCase()}
                            </button>
                            <a href={searchUrl} target="_blank" rel="noopener noreferrer" aria-label={`Search ${address} on Google`}>
                                <img className="w-4 h-4 ml-5 hover:w-6 hover:h-6" src={locationArrow} alt="" />
                            </a>
                        </span>
                        <span className="text-gray-400 text-[0.7rem] font-bold">{pending ? 'Saving…' : currTime}</span>
                    </p>
                </div>
                <p className="text-white font-bold text-[1.5rem]">{temp}</p>
            </div>

            {/* Secondary Element */}
            {mode === 'trans' && !pending && (
                <button type="button" onClick={deleteCity} aria-label={`Remove ${address}`} className="bg-orange-600 cursor-pointer flex items-center justify-center rounded-2xl h-0 w-0 opacity-0 transition-[width,opacity] duration-700 ease-in-out group-hover:w-40 group-hover:h-30 group-hover:opacity-75 focus:w-40 focus:h-30 focus:opacity-75">
                    <img className="w-6 h-6 hidden group-hover:block group-focus-within:block" src={closeIcon} alt="" />
                </button>
            )}
        </div>
    )
}

export { CityCard }
