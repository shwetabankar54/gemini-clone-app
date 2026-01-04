import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
import Orb from "./components/Orb";

function App() {
  return (
    <>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none'
        }}>
          <Orb hoverIntensity={0} opacity={0.3} />
        </div>
        <Sidebar />
        <Main />
    </>
  )
}

export default App
