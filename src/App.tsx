import { useSyncControlsWithStore } from "./hooks/controls";
import { OverlayElements } from "./components/Scene/overlay";
import { ThreeJsCanvas } from "./components/Scene/canvas";

function App() {
  useSyncControlsWithStore();

  return (
    <>
      <ThreeJsCanvas />
      <OverlayElements />
    </>
  );
}

export default App;
