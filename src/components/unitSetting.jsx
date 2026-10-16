const UNIT_LABELS = {
    Celsius: '°C', Fahrenheit: '°F',
    Kmh: 'km/h', Ms: 'm/s', Mph: 'mph',
    Hpa: 'hPa', Inches: 'inHg', Kpa: 'kPa', Mmhg: 'mmHg',
    Kilometers: 'km', Meters: 'm',
}

export default function UnitSettingBoard({ unitArr, modifySettings, settings }) {
    return (
        <div>
            <ul className="flex flex-col gap-5">
                {unitArr.map(unit => (
                    <li key={unit.name}>
                        <p className="font-bold text-gray-400 text-[0.9rem]">{unit.name}</p>
                        <ul className="flex w-full">
                            {unit.units.map(theUnit => (
                                <li key={theUnit} className='border-r-1 border-r-gray-500 px-2 last:border-r-0 w-full'>
                                    <button
                                        type="button"
                                        aria-pressed={settings[unit.name] === theUnit}
                                        onClick={() => modifySettings(unit.name, theUnit)}
                                        className={`text-center ${settings[unit.name] === theUnit ? 'bg-white text-black' : 'text-gray-400'} w-full rounded-lg cursor-pointer`}
                                    >
                                        {UNIT_LABELS[theUnit]}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    )
}
