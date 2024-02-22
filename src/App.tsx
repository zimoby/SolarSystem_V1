import { useSyncControlsWithStore } from "./hooks/controls";
import { OverlayElements } from "./components/Scene/overlay";
import { ThreeJsCanvas } from "./components/Scene/canvas";
import { ActiveObjectInfo } from "./components/Scene/info";

function App() {
  useSyncControlsWithStore();

  return (
    <>
      <ThreeJsCanvas />
      <OverlayElements />
      <ActiveObjectInfo />
    </>
  );
}

export default App;
