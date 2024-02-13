

import { useRef, useMemo, useEffect, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, LineBasicMaterial, LineSegments, Vector3 } from 'three'
// import { min } from 'lodash'

export const NeuralNetwork2 = forwardRef((props, ref) => {
    // ref is array of particles position ref

    // console.log('ref', ref.current[0]);

    const linesGeometryRef = useRef()

    let numConnected = 0

    const positions = useMemo(() => {
        const particlePositions = new Float32Array(ref.current.length * 3)
        // for (let i = 0; i < ref.current.length; i++) {
        //     // console.log('particlePositions', ref.current);
        //     particlePositions[i * 3] = ref.current[i].x
        //     particlePositions[i * 3 + 1] = ref.current[i].y
        //     particlePositions[i * 3 + 2] = ref.current[i].z
        // }
        return particlePositions;
    }, [ref]);

    // useEffect(() => {
    //     if (!ref.current) { return; }
    //     const points = ref.current.map(pos => new Vector3(pos.x, pos.y, pos.z));

    //     const tempGeometry = new BufferGeometry();
    //     // const positionsTemp = [];

    //     for (let i = 0; i < ref.current.length; i++) {
    //         for (let j = i + 1; j < ref.current.length; j++) {
    //             const distance = points[i].distanceTo(points[j]);

    //             if (distance < 2) {
    //                 // positionsTemp.push(points[i].x, points[i].y, points[i].z);
    //                 // positionsTemp.push(points[j].x, points[j].y, points[j].z);

    //                 positions[i * 3] = points[i].x;
    //                 positions[i * 3 + 1] = points[i].y;
    //                 positions[i * 3 + 2] = points[i].z;
    //                 positions[j * 3] = points[j].x;
    //                 positions[j * 3 + 1] = points[j].y;
    //                 positions[j * 3 + 2] = points[j].z;

    //                 numConnected++
    //             }
    //         }
    //     }

    // }, []);
    

    useFrame((_, delta) => {
        // setupGeometries();

        if (!ref.current) { return; }

        
        // console.log('ref', ref.current);
        
        numConnected = 0
        const maxConnections = 20;
        const minDistance = 1;
        const lineMaterial = new LineBasicMaterial({ color: 0xffffff });
        const points = ref.current.map(pos => new Vector3(pos.x, pos.y, pos.z));
        
        // const points2 = ref.current.map((particleRef, index) => {
        //     // console.log('pos', particleRef.x);
            
        //     return new Vector3(particleRef.x, particleRef.y, particleRef.z)
        // });
        // const geometry = new BufferGeometry().setFromPoints(points);

        // ref.current.forEach((particleRef, index) => {
        //     const { position } = particleRef.current;
        //     // Now you have the most current position for each particle
            // console.log(`Particle ${index}:`, particleRef.position);
        // });

        // console.log('points', points);
    
        // Creating a temporary geometry to store connections
        const tempGeometry = new BufferGeometry();
        // const positionsTemp = [];
        // const colors = [];
        // const color = new Color();
        // ref.current.position
    
        // Calculate connections based on distance
        for (let i = 0; i < ref.current.length; i++) {
            for (let j = i + 1; j < ref.current.length; j++) {
                const distance = points[i].distanceTo(points[j]);

                // console.log('distance', distance);
    
                // if (distance < minDistance) {
                    // console.log('distance', distance, minDistance);

                    // positionsTemp.push(points[i].x, points[i].y, points[i].z);
                    // positionsTemp.push(points[j].x, points[j].y, points[j].z);

                    positions[i * 3] = points[i].x;
                    positions[i * 3 + 1] = points[i].y;
                    positions[i * 3 + 2] = points[i].z;
                    positions[j * 3] = points[j].x;
                    positions[j * 3 + 1] = points[j].y;
                    positions[j * 3 + 2] = points[j].z;


                    numConnected++

    
                    // Calculate color based on distance, for example
                    // const alpha = 1 - distance / minDistance;
                    // color.setHSL(1.0, 0.5, alpha);
                    // colors.push(color.r, color.g, color.b);
                    // colors.push(color.r, color.g, color.b);
                // }
            }
        }

        // positions = new Float32Array(positions);

        tempGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
        // tempGeometry.computeBoundingSphere();
        // const lineSegments = new LineSegments(tempGeometry, lineMaterial);

        // console.log('lineSegments', lineSegments);

        // linesGeometryRef.current = lineSegments;
        linesGeometryRef.current.setDrawRange(0, numConnected * 2)
        linesGeometryRef.current.attributes.position.needsUpdate = true


        // linesGeometryRef.current.geometry.setDrawRange(0, 2);

        // ref.current.attributes.position.needsUpdate = true
        // linesGeometryRef.current.geometry.setDrawRange(0, 2);
    


    }, []);


    
    const setupGeometries = () => {

    };

    const updateAnimation = (delta) => {
        // This function is supposed to update the particles' positions
        // and potentially recalculate the connections based on those positions.
        // Since `ref` is expected to be an array of position vectors (or similar structure),
        // we directly update the positions of particles here.

        if (ref.current && linesGeometryRef.current) {
            // Assuming ref.current is an array of { x, y, z } objects or similar
            const positions = ref.current.flatMap(({ x, y, z }) => [x, y, z]);
            const positionsAttribute = new Float32BufferAttribute(positions, 3);
            linesGeometryRef.current.setAttribute('position', positionsAttribute);

            // Here you might also recalculate connections based on new positions
            // and update the lines geometry accordingly.
        }
    }

    // useFrame((_, delta) => updateAnimation(delta));



    return (
        <group rotation={[Math.PI / 2, 0,0]}>
            {/* <points>
                
            </points> */}
            {/* <points>
                <bufferGeometry>
                    <bufferAttribute
                        attachObject={['attributes', 'position']}
                        count={ref.current.length}
                        array={positions}
                        itemSize={30}
                    />
                </bufferGeometry>
                <pointsMaterial
                    color={'white'}
                    size={30}
                    // blending={AdditiveBlending}
                    transparent={true}
                    sizeAttenuation={false}
                />
            </points> */}
            {/* <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={positions.length / 3}
                        array={positions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    color={'white'}
                    size={3}
                    // blending={AdditiveBlending}
                    transparent={true}
                    sizeAttenuation={false}
                />
            </points> */}
            <lineSegments>
                <bufferGeometry ref={linesGeometryRef}>
                    <bufferAttribute
                        attach="attributes-position"
                        count={positions.length / 3}
                        array={positions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial color={'#FFFFFF'} />
            </lineSegments>
        </group>
    );
})