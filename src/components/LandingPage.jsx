import umbrella from '../assets/img/umbrella.png'
import { useNavigate } from 'react-router-dom'
// create landing page for the first render when entering the app
function LandingPage(){
    const navigate=useNavigate()
    return (
        <div className="landing-page">
        <aside className="landing-mark">
            <img src={umbrella} alt="" />
        </aside>
        <main className="landing-copy">
            <div className="landing-brand">
              <img src={umbrella} alt="" />
              <h1>Breeze</h1>
            </div>
            <p>Weather App</p>
            <button onClick={()=>navigate('/weather')} className="primary-action">Get Started</button>
        </main>
        </div>
    )
}
export {LandingPage}
