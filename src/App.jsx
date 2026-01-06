import { useContext } from "react";
import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
import Orb from "./components/Orb";
import { Context } from "./context/Context";

function App() {
  const { showResult } = useContext(Context);

  return (
    <>
        {!showResult && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: '56px',
            width: 'calc(100vw - 56px)',
            height: '100vh',
            zIndex: 0,
            pointerEvents: 'none'
          }}>
            <Orb hoverIntensity={0} opacity={0.15} />
          </div>
        )}
        <Sidebar />
        <Main />
    </>
  )
}

export default App
