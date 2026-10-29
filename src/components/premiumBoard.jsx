function PremiumBoard(){
    return (
        <>
        <div>
        <h2>Advanced</h2>
        <hr className="setting-divider" />
        <h3>Get new experience</h3>
        <ul className="promo-list">
            <li>Ad free</li>
            <li>Health activities overview</li>
            <li>Severe weather notifications</li>
        </ul>
        <p className="promo-price">$3.99 <span>/month</span></p>
        </div>
        
        </>
    )
}
function SignUp(){
    return (
        <>
        <div>
        <h2>Never forget your umbrella</h2>
        <hr className="setting-divider" />
        <p>
        Sign up for our daily weather newsletter personalized just for you 
        </p>
        <button className="primary-action">Sign up</button>
        </div>
        </>
    )
}
export {SignUp,PremiumBoard}
