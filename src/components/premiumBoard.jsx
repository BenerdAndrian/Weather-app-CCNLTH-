function PremiumBoard(){
    return (
        <>
        <div className="py-4 px-[2rem] rounded-2xl bg-[rgb(30,40,55)]">
        <p className="font-bold text-white text-[1.7rem] ">
            Advanced
        </p>
        <hr className="border-gray-700 border-1 my-3" />
        <p className="font-bold text-white text-[1.2rem]">Get new experience</p>
        <ul className="list-disc text-gray-300 my-3 ml-3">
            <li>Ad free</li>
            <li>Health activities overview</li>
            <li>Severe weather notifications</li>
        </ul>
        <div className="p-3 rounded-2xl bg-[rgb(48,57,75)] text-center">
            <p><span className="text-white text-[2rem] font-bold">$3.99</span> <span className="text-gray-300 text-[1rem]">/month</span></p>
        </div>
        </div>
        
        </>
    )
}
function SignUp(){
    return (
        <>
        <div className="py-4 px-[2rem] rounded-2xl bg-[rgb(30,40,55)]">
        <p className="font-bold text-white text-[1.22rem]">Never forget your umbrella</p>
        <hr className="border-gray-700 my-3" />
        <p className="text-gray-300">
        Sign up for our daily weather newsletter personalized just for you 
        </p>
        <button className="font-bold cursor-pointer text-white text-center bg-blue-600 p-2 rounded-2xl w-full mt-3">Sign up</button>
        </div>
        </>
    )
}
export {SignUp,PremiumBoard}