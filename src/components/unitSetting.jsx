const UNIT_LABELS = {
    Celsius: '°C', Fahrenheit: '°F',
    Kmh: 'km/h', Ms: 'm/s', Mph: 'mph',
    Hpa: 'hPa', Inches: 'inHg', Kpa: 'kPa', Mmhg: 'mmHg',
    Kilometers: 'km', Meters: 'm',
}

export default function UnitSettingBoard({ unitArr, modifySettings, settings }) {
    return (
        <div>
            <ul className="unit-list">
                {unitArr.map(unit => (
                    <li key={unit.name}>
                        <p className="settings-group-title">{unit.name}</p>
                        <ul className="unit-choice-list">
                            {unit.units.map(theUnit => (
                                <li key={theUnit}>
                                    <button
                                        type="button"
                                        aria-pressed={settings[unit.name] === theUnit}
                                        onClick={() => modifySettings(unit.name, theUnit)}
                                        className="unit-choice"
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
