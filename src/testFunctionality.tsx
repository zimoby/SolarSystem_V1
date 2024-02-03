// const ZoomInvariantHtml = ({ children, position }) => {
//   const ref = useRef();
//   const { camera } = useThree();

//   useFrame(() => {
//     if (ref.current && camera.zoom) {
//       // Calculate scale here based on camera zoom
//       // This is a basic example; you might need a more complex calculation depending on your camera setup
//       const scale = 1 / camera.zoom;
//       ref.current.scale.set(scale, scale, scale);
//     }
//   });

//   return (
//     <Html ref={ref} position={position} transform occlude>
//       <div
//         className="w-fit h-auto px-1 text-left text-xs text-red-50 bg-black rounded-sm select-none"
//         style={{ transform: "translate(50%, 75%)" }}
//       >
//         {children}
//       </div>
//     </Html>
//   );
// };



function PlanetConnections({ planetPositions }) {
    // Assuming 'planetPositions' is an array of [x, y, z] positions of the planets
    // Example: [[0, 0, 0], [5, 5, 0], [10, 0, 0]]
  
    // Prepare points for lines connecting each planet in order
    const points = planetPositions.reduce((acc, pos, index, arr) => {
      if (index < arr.length - 1) {
        // Connect current planet to the next
        acc.push(pos, arr[index + 1]);
      }
      return acc;
    }, []);
  
    return (
      <Line points={points} color="white" lineWidth={1} />
    );
  }