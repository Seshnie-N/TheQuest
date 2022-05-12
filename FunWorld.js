import * as THREE from 'three';
import { DoubleSide } from 'three';

//import './resources'; 

import { OrbitControls } from './examples/jsm/controls/OrbitControls.js';

let camera, controls, scene, renderer;

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

function init() {

    scene = new THREE.Scene();

    const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            './resources/istockphoto-948602070-170667a.jpg',
            './resources/istockphoto-948602070-170667a.jpg',
            './resources/istockphoto-948602070-170667a.jpg',
            './resources/istockphoto-948602070-170667a.jpg',
            './resources/istockphoto-948602070-170667a.jpg',
            './resources/istockphoto-948602070-170667a.jpg',
        ]);
        scene.background = texture;

    scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 400, 200, 0 );

    // controls

    controls = new OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window ); // optional

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 100;
    controls.maxDistance = 500;

    controls.maxPolarAngle = Math.PI / 2;

    // world

    const world = World();
    //world.scale.set(5,5,5);
    scene.add( world );


    // lights

    const dirLight1 = new THREE.DirectionalLight( 0xffffff );
    dirLight1.position.set( 1, 1, 1 );
    scene.add( dirLight1 );

    const dirLight2 = new THREE.DirectionalLight( 0x002288 );
    dirLight2.position.set( - 1, - 1, - 1 );
    scene.add( dirLight2 );

    const ambientLight = new THREE.AmbientLight( 0x222222 );
    scene.add( ambientLight );

    //

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );

    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

    render();

}

function render() {

    renderer.render( scene, camera );

}

function World() {
    const world = new THREE.Group();

    const underFloor = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2000,2000),
        new THREE.MeshBasicMaterial({color: 'green', side: DoubleSide})
    );
    //underFloor.position.set(100,1,210);
    underFloor.rotation.set(Math.PI/2,0,0);
    underFloor.position.set(100,0,210);
    world.add(underFloor);

    const floor = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(200,420),
        new THREE.MeshBasicMaterial({color: '#A5682A', side: DoubleSide})
    );
    floor.position.set(100,1,210);
    floor.rotation.set(Math.PI/2,0,0);
    world.add(floor);

    var filled = [
                    [1,1,1,1,1,1,0,1,1,1],
                    [1,1,1,1,1,1,0,1,1,1],
                    [1,1,0,0,0,0,0,1,1,1],
                    [1,1,0,1,1,1,0,1,0,1],
                    [1,0,0,0,1,1,0,0,0,1],
                    [1,0,0,0,1,1,0,1,0,1],
                    [1,0,0,0,1,1,0,1,0,1],
                    [1,1,1,1,1,1,0,1,0,1],
                    [1,1,1,1,0,0,0,1,0,1],
                    [1,0,0,1,0,1,1,1,0,1],
                    [1,0,0,0,0,1,1,1,0,1],
                    [1,0,0,1,1,1,1,1,0,1],
                    [1,1,1,1,1,1,1,0,0,1],
                    [1,1,1,1,0,0,0,0,0,1],
                    [1,1,1,1,0,1,1,1,1,1],
                    [1,1,1,1,0,1,1,1,1,1],
                    [1,1,1,1,0,1,1,0,0,1],
                    [1,1,0,0,0,0,0,0,0,1],
                    [1,1,0,1,1,1,1,1,1,1],
                    [1,1,0,0,1,1,1,1,1,1],
                    [1,1,1,0,1,1,1,1,1,1],];

    for(let i=0;i<21;i++){
        for(let j=0;j<21;j++){
            if(filled[j][i] == 1){   
                const mesh = floorTile(i*20+10,j*20+10)
                world.add( mesh );
            }
        }
    }

    return world;
}

    function floorTile(x,z){
        const tile = new THREE.Mesh(
            new THREE.BoxBufferGeometry(20,5,20),
            new THREE.MeshLambertMaterial({color: 'green', side: DoubleSide})
        );
        tile.position.set(x,2.5,z);
        return tile;
    }