import * as THREE from 'three';
import {skybox} from "./skybox.js";
import * as CANNON from 'cannon-es';
import * as CHARACTER from "./Character.js";
import  * as CAMERA from "./ThirdPersonCamera.js";
import { GLTFLoader } from './examples/jsm/loaders/GLTFLoader.js';
import { Reflector } from './examples/jsm/objects/Reflector.js';
import { OrbitControls} from './examples/jsm/controls/OrbitControls.js';
import CannonDebugger from 'cannon-es-debugger';
import gsap from './node_modules/gsap/index.js';

let waterCamera, cubeMaterials, ground, tree_loader, grass_loader,shrub_loader, cannonDebugger, key, door,  collectedKeys, door_loader, doormixer, opendoor,controls;

class level_one {
    constructor() {
        //initialise all components of the game/scene
        this.init();
    }

    //create level
    init(){
        //declare variables
        collectedKeys = 0;
        opendoor = false;

        //Mouse event listeners.
        document.addEventListener("click", (e)=> this._onClick(e), false);
       // document.addEventListener("mousemove", (e)=> this._onMouseMove(e), false);
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        this.configThree();
        this.configPhysics();
        this.addMapCamera();
        this.generateWorld();        
        this.addSkybox();
        this._LoadAnimatedModels();

        cannonDebugger = new CannonDebugger(this.scene, this.world);

        this.previousRAF = null;

        // // controls

        // controls = new OrbitControls( this.camera, this.renderer.domElement );
        // controls.listenToKeyEvents( window ); // optional

        // //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

        // controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        // controls.dampingFactor = 0.05;

        // controls.screenSpacePanning = false;

        // controls.minDistance = 100;
        // controls.maxDistance = 1000;

        // controls.maxPolarAngle = Math.PI / 2;

        this.animate();

    }

    configThree() {
        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1500.0;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(25,7,25);

        //create scene
        this.scene = new THREE.Scene();

        //configure light source

        //directional light
        let light = new THREE.DirectionalLight(0xFBFAF5, 1.0);
        light.position.set(100,300,400);
        light.target.position.set(500,20,100);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 700.0;
        light.shadow.camera.left =350;
        light.shadow.camera.right = -350;
        light.shadow.camera.top = 350;
        light.shadow.camera.bottom = -350;
        this.scene.add(light);
        this.scene.add(light.target);

        //second directional light
        const light2 = new THREE.DirectionalLight( 0xffffff );
        light2.position.set(400,300,400);
        light2.target.position.set(200,20,0);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 700.0;
        light.shadow.camera.left =350;
        light.shadow.camera.right = -350;
        light.shadow.camera.top = 350;
        light.shadow.camera.bottom = -350;
        this.scene.add( light2 );
        this.scene.add(light2.target);

        //add hemisphere light to scene.
        const hemi_light = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 0.8);
        this.scene.add(hemi_light);

        //ambient light
        light = new THREE.AmbientLight(0xFBFAF5, 1.0);
        this.scene.add(light);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.OnWindowResize();
        }, false);
    }

    configPhysics() {
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -200, 0)
        })
        this.timeStep = 1/60;
    }

    addMapCamera(){
        this.mapWidth =320;
        this.mapHeight = 320;
        this.mapCamera = new THREE.OrthographicCamera(
            this.mapWidth ,		// Left
            -this.mapWidth ,		// Right
            -this.mapHeight ,		// Top
            this.mapHeight ,	// Bottom
            1,         // Near
            1000);

        this.mapCamera.position.set(285,300,285);
        this.mapCamera.lookAt(new THREE.Vector3(285, 1, 285));

    }

    generateWorld() {

        //plane in physics world
        this.planeBody = new CANNON.Body({
            shape: new CANNON.Plane(),
            type: CANNON.Body.STATIC
        })
        this.world.addBody(this.planeBody);
        this.planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

        //world builder code
        const Level = new THREE.Group();

        this.InitaliseTexture();
        
        var filled = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,7,5,3,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,4,0,5,0,0,1,1,1,1,1,1,1,1,0,0,0,0,1],
            [1,1,0,1,1,1,4,1,1,1,1,1,1,0,0,0,2,2,0,1],
            [1,2,4,0,1,1,5,0,5,1,1,1,1,0,1,0,2,2,0,1],
            [1,0,5,5,1,1,0,1,0,1,1,1,1,0,1,0,0,0,0,1],
            [1,0,4,0,1,1,4,0,0,4,0,0,0,0,1,1,0,1,1,1],
            [1,2,1,1,1,1,4,1,0,1,1,1,1,1,1,1,0,1,1,1],
            [1,1,1,1,0,4,0,1,0,1,1,1,1,1,1,1,0,1,1,1],
            [1,0,0,1,0,1,1,1,0,1,1,0,0,0,1,1,0,1,1,1],
            [1,0,0,0,0,1,1,1,0,1,1,0,0,0,1,1,0,0,0,1],
            [1,0,0,1,1,1,1,1,0,1,1,0,0,0,1,1,1,1,0,1],
            [1,1,1,1,1,1,1,0,0,1,1,1,0,1,1,1,1,1,0,1],
            [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1],
            [1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1],
            [1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1],
            [1,1,1,1,0,1,1,0,0,1,1,1,1,1,0,1,1,1,1,1],
            [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,1,1],
            [1,1,0,1,1,1,1,0,0,1,1,1,1,1,1,0,2,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]];

            for(let i=0;i<20;i++){
                for(let j=0;j<20;j++){
                    if(filled[j][i] !== 1){
                        const mesh = this.floorTile(i*30,j*30);
                        Level.add( mesh );
                    }
                    if(filled[j][i] === 1){
                        const mesh = this.hedgeWall(i*30,j*30);
                        Level.add( mesh );
                    }
                    if (filled[j][i] === 2){
                        const water = this.Water(i*30,j*30);
                        Level.add(water);
                    }
                    if (filled[j][i] === 3 ){
                        const key = this.Key(i*30,j*30);
                        Level.add(key);
                    }
                    if (filled[j][i] === 4){
                        const r = Math.floor(Math.random() * 30)+1
                        const s = Math.floor(Math.random() * 30)+1
                        const spineGrass = this.SpineGrass(i*30+r-15,j*30+s-15);   
                        Level.add( spineGrass );
                    }
                    if (filled[j][i] === 5){
                        const r = Math.floor(Math.random() * 30)+1
                        const s = Math.floor(Math.random() * 30)+1
                        const shrub = this.Shrub(i*30+r-15,j*30+s-15);   
                        Level.add( shrub );
                    }
                    if (filled[j][i] === 7){
                        const door = this.door(i*30,j*30);
                        Level.add( door );
                    }
                }
            }

            this.scene.add( Level );
    }

    addSkybox() {
        const params = {
            scene : this.scene,
            type: 'cloudy',
        }
        this.Skybox = new skybox(params);
        this.sb = this.Skybox.makeSkybox();
    }

    _LoadAnimatedModels(){

        //set character location in scene
        this.startPos = new CANNON.Vec3(40,100,10);

        //Params to be passed to the character class.
        const CharParams = {
            renderer: this.renderer,
            camera: this.camera,
            scene: this.scene,
            world: this.world,
            startPos : this.startPos,
        }
        this.Character = new CHARACTER.Character(CharParams)

        //Setup third person camera class.
        if (this.Character) {
            const CamParams = {
                camera: this.camera,
                target: this.Character
            }
            this.CAM = new CAMERA.ThirdPersonCamera(CamParams);
        }
    }

    //Use Raycasting to see if mouse is in contact with a key. If so, collect key, updated number of collected keys and update game UI.
    _onClick(event){
        this.mouse = {
            x: (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1,
            y: -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1
        }
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects_key = this.raycaster.intersectObjects(key.children, true);

        if (intersects_key.length > 0){
            let target = intersects_key[0];
            target.object.position.y -= 50;
            collectedKeys += 1;
            console.log( collectedKeys);
        }

        let intersects_door = this.raycaster.intersectObjects(door.children, true);

        if (intersects_door.length > 0){
            //check if all keys collected
            if (collectedKeys >= key.children.length){
                opendoor = true;
                console.log("you win");
            }else{
                console.log("you have not found all the keys");
            }
        }

    }

    //continuous rendering to create animation
    animate() {
        requestAnimationFrame((t) => {
            if (this.previousRAF === null){
                this.previousRAF = t;
            }
            //move forward physics world
            this.world.step(this.timeStep);

            this.animate();

            let w = window.innerWidth, h = window.innerHeight;

            // full display
            this.renderer.setViewport(0, 0, w, h);
            this.renderer.setScissor(0, 0, w, h);
            this.renderer.setScissorTest(true);
            this.renderer.render(this.scene, this.camera);

            // minimap (overhead orthogonal camera)
            if (this.Character && this.mapCamera) {
                this.renderer.setViewport(50, 50, this.mapWidth, this.mapHeight);
                this.renderer.setScissor(50, 50, this.mapWidth, this.mapHeight);
                this.renderer.setScissorTest(true);
                this.renderer.render(this.scene, this.mapCamera);
            }

            //cannonDebugger.update();

            //this.renderer.render(this.scene, this.camera);
            this.step(t - this.previousRAF);
            this.previousRAF = t;
        });
    }

    //updates all objects in other classes
    step(timeElapsed){
        //update to enable animations
        const timeElapsedS = timeElapsed * 0.001;

        //animate door to open
        if (opendoor) {
            if (doormixer) doormixer.update(timeElapsedS);
            setTimeout(function()
            {
                opendoor = false;
            },1300);
        }

        //update rotation of skybox for dynamic skybox
        this.sb.rotation.y += timeElapsedS*0.01;

        //update character
        if (this.Character) {
            this.Character.Update(timeElapsedS);

            //Update the third person camera.
            this.CAM.Update(timeElapsedS)

            //If Game is over
            if (this.Character.getStop === true) {
                this.Pause = true;
            }
        }
    }

    //resize renderer canvas when window is resized
    OnWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.mapCamera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    floorTile(x,z){
        const floor = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(30,30),
            ground
        );
        floor.rotation.set(Math.PI/2,0,0);
        floor.position.set(x,0,z);
        floor.receiveShadow = true;
        return floor;
    }

    hedgeWall(x,z){
        const wall = new THREE.Mesh(
            new THREE.BoxBufferGeometry(30,30,30),
            cubeMaterials
        );
        wall.castShadow = true;

        this.wallBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(15,15,15)),
            type: CANNON.Body.STATIC,
            position: new CANNON.Vec3(x,15,z),
        });
        this.world.addBody(this.wallBody);
        wall.receiveShadow = true;
        wall.position.copy(this.wallBody.position);
        wall.quaternion.copy(this.wallBody.quaternion);
    
        return wall;
    }

    door(x,z){
        door = new THREE.Group;

        const doorBack = new THREE.Mesh(
            new THREE.PlaneGeometry(10,40.7),
            new THREE.MeshBasicMaterial({color: 0x000000})
        );
        doorBack.position.set(x, 0, z+14.5);
        doorBack.rotation.y = Math.PI;
        this.scene.add(doorBack);

        door_loader = new GLTFLoader();
        door_loader.load('./resources/models/door/scene.gltf',function (gltf) {
            gltf.scene.scale.set(0.025,0.025,0.025);
            gltf.scene.position.set(x,0,z+14);

            doormixer = new THREE.AnimationMixer(gltf.scene);
            gltf.animations.forEach((clip) => {
                doormixer.clipAction(clip).play();
            });

            let model = gltf.scene;
            
            door.add(model);
        },(xhr) => xhr, ( err ) => console.error( err ));

        //add a light to the door
        const door_light = new THREE.PointLight( 0xFFD700, 3, 20 );
        door_light.position.set( x,21,z+12 );
        door_light.add(new THREE.Mesh( new THREE.SphereGeometry( 0.5, 16, 8 ), new THREE.MeshBasicMaterial( { color: 0xFFD700 } ) ));
        this.scene.add( door_light );

        return door;
    }

    Key(x,z){
        key = new THREE.Group;
        let model;
        tree_loader = new GLTFLoader();
        tree_loader.load('./resources/models/key/scene.gltf',function (gltf) {
            gltf.scene.scale.set(1,1,1);
            gltf.scene.position.set(x,3,z);

            gltf.scene.traverse( function( node ) {

                if ( node.isMesh ) { node.castShadow = true; }
        
            } );

            model = gltf.scene;
            
            gsap.to(gltf.scene.position, {y:'+=5',
            duration:2, //The speed of the key 
            ease:'none',
            repeat:-1, // Reversing the action 
            yoyo:true // The yoyo effect
           })

           gsap.to(gltf.scene.rotation, {y:'+=10',
            duration:4, //The speed of the key 
            ease:'none',
            repeat:-1, // Reversing the action 
            yoyo:true // The yoyo effect
       })


            key.add(model);
        },(xhr) => xhr, ( err ) => console.error( err ));

        return key;
    }

    Water(x,z) {
        let water = new THREE.Group;
    
        let geometry;
    
        geometry = new THREE.PlaneGeometry(30,30);
        waterCamera = new Reflector( geometry, {
            clipBias: 0.003,
            textureWidth: window.innerWidth * window.devicePixelRatio,
            textureHeight: window.innerHeight * window.devicePixelRatio,
            color: 0x777777,
        });
    
        waterCamera.position.set(x-14,15,z-14);
        waterCamera.rotateZ( -Math.PI / 2 );
        water.add( waterCamera );
    
        return water;
    }

    SpineGrass(x,z){
        const grass = new THREE.Group;
    
        grass_loader = new GLTFLoader();
        grass_loader.load('./resources/models/spine_grass/scene.gltf',function (gltf) {
            gltf.scene.scale.set(2,2,2); 
            gltf.scene.position.set(x,0,z); 
            grass.add(gltf.scene);  
        },(xhr) => xhr, ( err ) => console.error( err ));
    
        return grass;
    }

    Shrub(x,z){
        const shrub = new THREE.Group;
    
        shrub_loader = new GLTFLoader();
        shrub_loader.load('./resources/models/low_poly_shrub/scene.gltf',function (gltf) {
            gltf.scene.scale.set(25,3,25); 
            gltf.scene.position.set(x,0,z); 
            shrub.add(gltf.scene);  
        },(xhr) => xhr, ( err ) => console.error( err ));
    
        return shrub;
    }

    InitaliseTexture() {
        const loader = new THREE.TextureLoader();
        const shine = 0;
        cubeMaterials = [
                new THREE.MeshLambertMaterial({ map: loader.load('./resources/pictures/hedge.jpg')}), //right side
                new THREE.MeshLambertMaterial({ map: loader.load('./resources/pictures/hedge.jpg')}), //left side
                new THREE.MeshBasicMaterial({ map: loader.load('./resources/pictures/Hedge_full_perms_texture_seamless.jpg')}), //top side
                new THREE.MeshLambertMaterial({color: 'green', side: THREE.DoubleSide}), //bottom side
                new THREE.MeshLambertMaterial({ map: loader.load('./resources/pictures/hedge.jpg')}), //front side
                new THREE.MeshLambertMaterial({ map: loader.load('./resources/pictures/hedge.jpg')}), //back side
            ];
        const loaderGround = new THREE.TextureLoader();
        ground = new THREE.MeshLambertMaterial({ map: loaderGround.load('./resources/pictures/ulrick-wery-tileableset2-soil.jpg'), side: THREE.DoubleSide, alphaTest:0.1,  shadowSide: true});
    }
}

let APP_ = null;

window.addEventListener('DOMContentLoaded', async () => {
    APP_ = new level_one();
});