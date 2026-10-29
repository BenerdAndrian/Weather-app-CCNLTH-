import ButtonToggle from "./ButtonToggle"
function NotificationBoard({modifySettings,settings}){
    return(
        <>
        <div className="setting-row">
            <div className="setting-copy">
             <strong>Notifications</strong>
             <span>Be aware of weather</span>
            </div>
             <ButtonToggle category={'notification'} label="Notifications" modifySettings={modifySettings} settings={settings}/>
        </div>
        </>
    )
}
function GeneralSettingBoard({modifySettings,settings}){
    return(
        <>
        <div>
            <div className="setting-row">
                <div className="setting-copy"><strong>12-hour time</strong></div>
                <ButtonToggle category={'12FormatTimer'} label="12-hour time" modifySettings={modifySettings} settings={settings}/>
            </div>
            <hr className="setting-divider" />
            <div className="setting-row">
                <div className="setting-copy">
                    <strong>Location</strong>
                    <span>Get weather by location</span>
                </div>
                    <ButtonToggle category={'getByGPS'} label="Get weather by location" modifySettings={modifySettings} settings={settings}/>
            </div>
        </div>
        </>
    )
}
export {NotificationBoard,GeneralSettingBoard}
