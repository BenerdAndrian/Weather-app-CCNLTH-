import locationArrow from '../assets/img/locationArrow.svg'
import closeIcon from '../assets/img/closeIconn.svg'

function CityCard({ icon, address, currTime, temp, deleteCity, onSelect, mode, pending = false, selected = false }) {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(address)}`;
    return (
        <div className={`city-row ${pending ? 'is-pending' : ''}`}>
            <div className={`city-card ${selected ? 'is-selected' : ''}`}>
                <button type="button" onClick={onSelect} disabled={pending} className="city-select">
                    <img src={`/${icon}.png`} alt="" />
                    <span className="city-info">
                        <strong>{address}</strong>
                        <small>{pending ? 'Saving…' : currTime}</small>
                    </span>
                </button>
                <div className="city-actions">
                    <span className="city-temp">{temp}</span>
                    <a className="icon-action" href={searchUrl} target="_blank" rel="noopener noreferrer" aria-label={`Search ${address} on Google`}>
                        <img src={locationArrow} alt="" />
                    </a>
                </div>
            </div>
            {mode === 'trans' && !pending && (
                <button type="button" onClick={deleteCity} aria-label={`Remove ${address}`} className="icon-action">
                    <img src={closeIcon} alt="" />
                </button>
            )}
        </div>
    )
}

export { CityCard }
