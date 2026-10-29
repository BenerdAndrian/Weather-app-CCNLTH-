export default function ButtonToggle({ category, label, modifySettings, settings }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={settings[category]}
            aria-label={label}
            onClick={() => modifySettings(category, !settings[category])}
            className="switch-control"
        >
            <span className="switch-thumb" aria-hidden="true"></span>
        </button>
    )
}
