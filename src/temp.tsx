
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