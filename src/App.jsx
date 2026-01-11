import { useContext, useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
import Orb from "./components/Orb";
import { Context } from "./context/Context";

const ORB_OPACITY_DEFAULT = 0.15;
const ORB_OPACITY_BRIGHT = 0.35;
const ORB_BRIGHTEN_DELAY = 30;
const ORB_DIM_DELAY = 450;

function App() {
  const { showResult, isResetting } = useContext(Context);
  const [orbOpacity, setOrbOpacity] = useState(ORB_OPACITY_DEFAULT);

  useEffect(() => {
    if (isResetting) {
      const brightenTimer = setTimeout(() => {
        setOrbOpacity(ORB_OPACITY_BRIGHT);
      }, ORB_BRIGHTEN_DELAY);

      const dimTimer = setTimeout(() => {
        setOrbOpacity(ORB_OPACITY_DEFAULT);
      }, ORB_DIM_DELAY);

      return () => {
        clearTimeout(brightenTimer);
        clearTimeout(dimTimer);
      };
    } else if (!showResult) {
      setOrbOpacity(ORB_OPACITY_DEFAULT);
    }
  }, [isResetting, showResult]);

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
            pointerEvents: 'none',
            transition: 'opacity 350ms cubic-bezier(0.4, 0.0, 0.2, 1)'
          }}>
            <Orb hoverIntensity={0} opacity={orbOpacity} />
          </div>
        )}
        <Sidebar />
        <Main />
    </>
  )
}

export default App
