import { Link } from "react-router-dom"
function AirInfoBoard({ categories = [], num }) {
  return (
    <div className="bg-[rgb(30,40,55)] rounded-2xl p-5 pr-[2rem] mt-3">
      <div className="flex justify-between">
        <h2 className="text-[lightgray] font-bold ml-[1rem] text-[0.7rem]">AIR CONDITIONS</h2>
        {/* relative link: /weather/:city -> /weather/:city/air-conditions */}
        <Link to="air-conditions" relative="path" className="bg-blue-600 text-white font-bold rounded-full text-[0.8rem] py-1 px-2">See More<span className="sr-only"> air conditions</span></Link>
      </div>
      <ul className="grid grid-cols-2 py-1 pl-[2rem] gap-5 pt-5">
        {/* looping through the array slice with the desired number limit of cards */}
        {categories.slice(0, num).map((category) => (
          <li key={category.name}>
            <div className="flex text-[0.97rem] font-bold">
              <img className="w-5 h-5 mr-2" src={category.image} alt="" />
              <p className="flex flex-col">
                <span className="font-bold text-[lightgray]">{category.name}</span>
                <span className="text-white">{category.info}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
function AirInfoCard({ categories = [], num }) {
  return (
    <div>
      <ul className="flex gap-x-3 gap-y-3 flex-wrap">
        {categories.slice(0, num).map((category) => (
          <li key={category.name} className="bg-[rgb(30,40,55)] basis-[calc(50%-0.5rem)] p-5 rounded-2xl">
            <div className="flex text-[0.97rem] font-bold">
              <img className="w-5 h-5 mr-4" src={category.image} alt="" />
              <p className="flex flex-col">
                <span className="font-bold text-[lightgray]">{category.name}</span>
                <span className="text-white">{category.info}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
export { AirInfoBoard, AirInfoCard }
