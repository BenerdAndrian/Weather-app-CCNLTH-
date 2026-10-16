import UnitSettingBoard from "./unitSetting";
import settingIcon from '../assets/img/settings.svg'
import { NotificationBoard, GeneralSettingBoard } from "./generalSetting";
import { SignUp, PremiumBoard } from "./premiumBoard";
import { useSettings } from "../settings/settings";
import { UNIT_OPTIONS } from "../utils/unitConverter";

const unitArr = Object.entries(UNIT_OPTIONS).map(([name, units]) => ({ name, units }));

export default function SettingPage() {
    const { settings, updateSetting } = useSettings();

    return (
        <div className="md:grid md:grid-cols-[2fr_1fr] md:grid-rows-[40px_1fr_1fr] gap-3 pr-3">
            <div className="md:col-start-1 md:col-end-2 md:row-start-1 md:row-end-4">
                <div className="md:row-start-1 md:row-end-2 flex w-full text-white justify-center align-center gap-2 mt-3">
                    <img className="w-6 h-6" src={settingIcon} alt="" />
                    <h1 className="font-bold text-[1.2rem]">Settings</h1>
                </div>
                <div className="overflow-scroll md:row-start-2 md:row-end-3 ml-[1.2rem] mt-[1rem] px-3 pr-4 md:h-[calc(31rem+8px)]">
                    <p className="bold text-white font-bold text-[1.2rem] ml-3 mb-2">Units</p>
                    <div className=" p-5 bg-[rgb(30,40,55)] rounded-3xl mb-[1.88rem]">
                        <UnitSettingBoard modifySettings={updateSetting} settings={settings} unitArr={unitArr} />
                    </div>
                    <p className="bold text-white font-bold text-[1.2rem] ml-3 mb-2">Notifications</p>
                    <div className="p-5 bg-[rgb(30,40,55)] rounded-3xl mb-[1.88rem]">
                        <NotificationBoard modifySettings={updateSetting} settings={settings} />
                    </div>
                    <p className="bold text-white font-bold text-[1.2rem] ml-3 mb-2">Generals</p>
                    <div className="p-5 bg-[rgb(30,40,55)] rounded-3xl mb-[1.88rem]">
                        <GeneralSettingBoard modifySettings={updateSetting} settings={settings} />
                    </div>
                </div>
            </div>
            <div className="md:col-start-2 md:col-end-3 md:row-start-2 md:row-end-4 ml-[1.7rem] pr-4 md:ml-0 md:pr-0 mb-[5rem] md:mb-0">
                <div className="md:row-start-2 md:row-end-3 mb-5">
                    <PremiumBoard />
                </div>
                <div className="md:row-start-3 md:row-end-4">
                    <SignUp />
                </div>
            </div>
        </div>
    )
}
