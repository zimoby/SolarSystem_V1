
{/* <PlanetConnections planetPositions={Object.values(planetPositions)} /> */}

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






const lineMaterial = (color, opacity) => {
  return new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity });
};

export const DynamicLine = ({ start, end, axisColor = false }) => {
  const { lineUnderOrbit, lineBelowOrbit, directLine } = useSystemColorsStore.getState().hudColors;
  const lineRef = useRef();
  const positionsRef = useRef();

  useEffect(() => {
    const positions = new Float32Array(6);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    lineRef.current.geometry = geometry;

    // const material = new THREE.LineBasicMaterial({ color: 'white' });
    // lineRef.current.material = new THREE.LineBasicMaterial({ color: directLine.color, transparent: true, opacity: directLine.opacity});
    // lineRef.current.material = lineMaterial(directLine.color, directLine.opacity);
    lineRef.current.material = lineMaterial(directLine.color, directLine.opacity);

    positionsRef.current = positions;
  }, []);

  useFrame(() => {
    if (positionsRef.current) {
      positionsRef.current.set([start.x, start.y, start.z, end.x, end.y, end.z]);
      lineRef.current.geometry.attributes.position.needsUpdate = true;

      if (axisColor) {
        const materialColor = end.y > start.y ? lineUnderOrbit.color : lineBelowOrbit.color;
        lineRef.current.material.color.set(materialColor);
      }
    }
  });

  return <line ref={lineRef} />;
};