import { Outlet } from 'react-router-dom';
import { NavbarSection } from './components/Navbar';

function App() {
  return (
    <div className="app-shell">
      <NavbarSection />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}

export default App
