import UnitSettingBoard from "./unitSetting";
import { NotificationBoard, GeneralSettingBoard } from "./generalSetting";
import { SignUp, PremiumBoard } from "./premiumBoard";
import { useSettings } from "../settings/settings";
import { UNIT_OPTIONS } from "../utils/unitConverter";

const unitArr = Object.entries(UNIT_OPTIONS).map(([name, units]) => ({ name, units }));

export default function SettingPage() {
    const { settings, updateSetting } = useSettings();

    return (
        <div className="settings-page">
            <div className="page-heading"><h1>Settings</h1></div>
            <div className="settings-layout">
                <div className="settings-groups">
                    <section className="settings-group">
                    <h2>Units</h2>
                        <UnitSettingBoard modifySettings={updateSetting} settings={settings} unitArr={unitArr} />
                    </section>
                    <section className="settings-group">
                    <h2>Notifications</h2>
                        <NotificationBoard modifySettings={updateSetting} settings={settings} />
                    </section>
                    <section className="settings-group">
                    <h2>Generals</h2>
                        <GeneralSettingBoard modifySettings={updateSetting} settings={settings} />
                    </section>
                </div>
                <aside className="settings-groups">
                    <section className="promo-panel">
                      <PremiumBoard />
                    </section>
                    <section className="promo-panel">
                    <SignUp />
                    </section>
                </aside>
            </div>
        </div>
    )
}
