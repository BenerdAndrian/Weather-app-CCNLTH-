export default function ButtonToggle({ category, label, modifySettings, settings }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={settings[category]}
            aria-label={label}
            onClick={() => modifySettings(category, !settings[category])}
            className={` relative z-10 cursor-pointer rounded-2xl px-6 ${settings[category] ? 'bg-blue-600' : 'bg-gray-400 border-1 border-black'}`}
        >
            <div className={`bg-white w-4 h-4 rounded-full absolute top-1 ${settings[category] ? 'right-1' : 'left-1'} transition-all duration-300`}></div>
        </button>
    )
}
