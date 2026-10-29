import { Link } from "react-router-dom"
function AirInfoBoard({ categories = [], num }) {
  return (
    <section className="surface">
      <div className="surface-heading">
        <h2>Air conditions</h2>
        {/* relative link: /weather/:city -> /weather/:city/air-conditions */}
        <Link to="air-conditions" relative="path" className="primary-action">See More<span className="sr-only"> air conditions</span></Link>
      </div>
      <ul className="condition-grid">
        {/* looping through the array slice with the desired number limit of cards */}
        {categories.slice(0, num).map((category) => (
          <li key={category.name}>
            <div className="condition-item">
              <img src={category.image} alt="" />
              <p>
                <span>{category.name}</span>
                <span className="text-white">{category.info}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
function AirInfoCard({ categories = [], num }) {
  return (
    <div>
      <ul className="condition-grid">
        {categories.slice(0, num).map((category) => (
          <li key={category.name} className="surface">
            <div className="condition-item">
              <img src={category.image} alt="" />
              <p>
                <span>{category.name}</span>
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
