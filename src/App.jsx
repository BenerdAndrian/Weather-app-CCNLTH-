import { Outlet } from 'react-router-dom';
import { NavbarSection } from './components/Navbar';

function App() {
  return (
    <div className="grid content-start md:grid-cols-[80px_1fr] bg-black p-3 min-h-screen">
      <div className="md:col-start-1 md:col-end-2">
        <NavbarSection />
      </div>
      <div className="md:col-start-2 md:col-end-3">
        <Outlet />
      </div>
    </div>
  )
}

export default App
