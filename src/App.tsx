import { OverlayElements } from "./components/Scene/overlay";
import { ThreeJsCanvas } from "./components/Scene/canvas";
import { ActiveObjectInfo } from "./components/Scene/info";
import { SolarSystemControls } from "./components/Scene/sliders";
import { CelestialToggle } from "./components/Scene/solarToogle";

function App() {
  return (
    <>
      <ThreeJsCanvas />
      <OverlayElements />
      <ActiveObjectInfo />
      <SolarSystemControls />
      <CelestialToggle />
    </>
  );
}

export default App;
