import umbrella from '../assets/img/umbrella.png'
import { useNavigate } from 'react-router-dom'
// create landing page for the first render when entering the app
function LandingPage(){
    const navigate=useNavigate()
    return (
        <div className="flex flex-col md:flex-row  bg-black w-screen h-screen absolute top-0 left-0 z- p-[2rem]">
        <aside className="flex items-center justify-center bg-[rgb(30,40,55)] rounded-3xl w-1/2">
            <img className="rotate-10 w-15 h-15 md:w-[300px] md:h-[300px]" src={umbrella} alt="umbrella image" />
        </aside>
        <main className="flex flex-col items-center justify-center h-full md:w-1/2">
            <img className="w-15 h-15 mb-5 rotate-10" src={umbrella} alt="umbrella img" />
            <h1 className=" text-[2rem] text-white font-bold">Breeze</h1>
            <p className="text-[rgb(160,160,160)] mb-5">Weather App</p>
            <button onClick={()=>navigate('/weather')} className="bg-blue-600 text-white py-1.5 px-3.5 font-bold rounded-2xl cursor-pointer">Get Started</button>
        </main>
        </div>
    )
}
export {LandingPage}