import * as THREE from 'three';
import {skybox} from "./skybox.js";
import * as CANNON from 'cannon-es';
import * as CHARACTER from "./Character.js";
import  * as CAMERA from "./ThirdPersonCamera.js";
import { GLTFLoader } from './examples/jsm/loaders/GLTFLoader.js';
import { Reflector } from './examples/jsm/objects/Reflector.js';
import CannonDebugger from 'cannon-es-debugger';


let waterCamera, cubeMaterials, ground, tree_loader, grass_loader,shrub_loader, cannonDebugger ;

class level_one {
    constructor() {
        //initialise all components of the game/scene
        this.init();
    }

    //create level
    init(){
        //declare variables
        this._mixers = [];

        //Hedge walls
        this.meshes2 = [];

        //Mouse event listeners.
        document.addEventListener("click", (e)=> this._onClick(e), false);
        document.addEventListener("mousemove", (e)=> this._onMouseMove(e), false);
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        this.configThree();
        this.configPhysics();
        this.generateWorld();        
        this.addSkybox();
        this._LoadAnimatedModels();

        cannonDebugger = new CannonDebugger(this.scene, this.world);

        //temp ground
        this.planeBody = new CANNON.Body({
            shape: new CANNON.Plane(),
            type: CANNON.Body.STATIC
        })
        this.world.addBody(this.planeBody);
        this.planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

        this.previousRAF = null;

        this.animate();

    }

    configThree() {
        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1000.0;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(25,7,25);

        //create scene
        this.scene = new THREE.Scene();

        //configure light source
        let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light.position.set(20, 100, 10);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.left = 100;
        light.shadow.camera.right = -100;
        light.shadow.camera.top = 100;
        light.shadow.camera.bottom = -100;
        this.scene.add(light);

        light = new THREE.AmbientLight(0xFFFFFF, 5.0);
        this.scene.add(light);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap;
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

    generateWorld() {
        //all of roberts world builder stuff
        const Level = new THREE.Group();

        this.InitaliseTexture();

        var filled = [
            [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [0,3,5,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,5,0,0,1,1,1,1,1,1,1,1,0,0,0,3,1],
            [1,0,0,0,1,1,4,1,1,1,1,1,1,0,0,0,2,2,0,1],
            [1,0,0,0,1,1,5,0,5,1,1,1,1,0,1,0,2,2,0,1],
            [1,0,2,0,1,1,0,1,0,1,1,1,1,0,1,0,0,0,0,1],
            [1,0,3,0,1,1,4,0,0,4,0,0,0,0,1,1,0,1,1,1],
            [1,1,1,1,1,1,4,1,0,1,1,1,1,1,1,1,0,1,1,1],
            [1,1,1,1,0,4,0,1,0,1,1,1,1,1,1,1,0,1,1,1],
            [1,3,0,1,0,1,1,1,0,1,1,0,3,0,1,1,0,1,1,1],
            [1,0,0,0,0,1,1,1,0,1,1,0,0,0,1,1,0,0,0,1],
            [1,0,0,1,1,1,1,1,0,1,1,0,0,0,1,1,1,1,0,1],
            [1,1,1,1,1,1,1,0,0,1,1,1,0,1,1,1,1,1,0,1],
            [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1],
            [1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1],
            [1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1],
            [1,1,1,1,0,1,1,0,0,1,1,1,1,1,0,1,1,1,1,1],
            [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,1,1],
            [1,1,0,1,1,1,1,0,0,1,1,1,1,1,1,0,2,1,1,1],
            [1,1,0,0,1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],];

            for(let i=0;i<20;i++){
                for(let j=0;j<21;j++){
                    if(filled[j][i] != 1){
                        const mesh = this.floorTile(i*30,j*30);
                        Level.add( mesh );
                    }
                    if(filled[j][i] == 1){   
                        const mesh = this.hedgeWall(i*30,j*30);
                        Level.add( mesh );
                    }
                    if (filled[j][i] == 2){
                        const water = this.Water(i*30,j*30);
                        Level.add(water);
                    }
                    if (filled[j][i] == 3 ){
                        const key = this.Key(i*30,j*30);
                        Level.add(key);
                    }
                    if (filled[j][i] == 4){
                        const r = Math.floor(Math.random() * 30)+1
                        const s = Math.floor(Math.random() * 30)+1
                        const spineGrass = this.SpineGrass(i*30+r-15,j*30+s-15);   
                        Level.add( spineGrass );
                    }
                    if (filled[j][i] == 5){
                        const r = Math.floor(Math.random() * 30)+1
                        const s = Math.floor(Math.random() * 30)+1
                        const shrub = this.Shrub(i*30+r-15,j*30+s-15);   
                        Level.add( shrub );
                    }
                }
            }

            //Level.scale.set(3,3,3);

            this.scene.add( Level )
    }

    addSkybox() {
        const params = {
            scene : this.scene,
            type: 'night',
        }
        this.Skybox = new skybox(params);
        this.sb = this.Skybox.makeSkybox();
    }

    _LoadAnimatedModels(){
        //Params to be passed to the character class.
        const CharParams = {
            renderer: this.renderer,
            camera: this.camera,
            scene: this.scene,
            world: this.world,
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

    //affect objects when hovering over
    _onMouseMove(event){
        this.mouse = {
            x: (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1,
            y: -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1
        }
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = this.raycaster.intersectObjects(this.scene.children, true);

        for (let i = 0; i < intersects.length; i++) {
            console.log();

        }

    }

    //Use Raycasting to see if mouse is in contact with a key. If so, collect key, updated number of collected keys and update game UI.
    _onClick(event){
        let intersects = this.raycaster.intersectObjects(this.scene.children, true);

        for (let i = 0; i < intersects.length; i++) {
            console.log(intersects[i]);

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

            cannonDebugger.update();

            this.animate(); 
            this.renderer.render(this.scene, this.camera);
            this.step(t - this.previousRAF);
            this.previousRAF = t;
        });
    }

    //updates all objects in other classes
    step(timeElapsed){
        //update to enable animations
        const timeElapsedS = timeElapsed * 0.001;
        if (this._mixers) {
            this._mixers.map(m => m.update(timeElapsedS));
        }

        //update rotation of skybox for dynamic skybox
        this.sb.rotation.y += timeElapsedS*0.1;

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
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    floorTile(x,z){
        const floor = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(30,30),
            ground
        );
        floor.rotation.set(-Math.PI/2,0,0);
        floor.position.set(x,0,z);
        return floor;
    }

    hedgeWall(x,z){
        const wall = new THREE.Mesh(
            new THREE.BoxBufferGeometry(30,30,30),
            cubeMaterials
        );
        wall.castShadow = true;
        //wall.position.set(x,5,z);

        this.wallBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(15,15,15)),
            type: CANNON.Body.STATIC,
            position: new CANNON.Vec3(x,15,z),
        });
        //this.wallBody.position.set(x,5,z);
        this.world.addBody(this.wallBody);
        this.meshes2.push(this.wallBody);

        wall.position.copy(this.wallBody.position);
        wall.quaternion.copy(this.wallBody.quaternion);
    
        return wall;
    }

    Key(x,z){
        const key = new THREE.Group;
    
        tree_loader = new GLTFLoader();
        tree_loader.load('./resources/models/oldKey/scene.gltf',function (gltf) {
            gltf.scene.scale.set(0.01,0.01,0.01); 
            gltf.scene.position.set(x,5,z); 
            gltf.scene.rotation.set(Math.PI,Math.PI/6,0, 'ZYX' );
            key.add(gltf.scene);  
        },(xhr) => xhr, ( err ) => console.error( err ));
    
        const tile = this.floorTile(x,z);
        tile.position.y = 30;
        key.add(tile);
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
        waterCamera.rotateX( -Math.PI );
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
        cubeMaterials = [
                new THREE.MeshBasicMaterial({ map: loader.load('./resources/img/Hedge_full_perms_texture_seamless.jpg')}), //right side
                new THREE.MeshBasicMaterial({ map: loader.load('./resources/img/Hedge_full_perms_texture_seamless.jpg')}), //left side
                new THREE.MeshBasicMaterial({ map: loader.load('./resources/img//Hedge_full_perms_texture_seamless.jpg')}), //top side
                new THREE.MeshBasicMaterial({color: 'green', side: THREE.DoubleSide}), //bottom side
                new THREE.MeshBasicMaterial({ map: loader.load('./resources/img/Hedge_full_perms_texture_seamless.jpg')}), //front side
                new THREE.MeshBasicMaterial({ map: loader.load('./resources/img/Hedge_full_perms_texture_seamless.jpg')}), //back side
            ];
        const loaderGround = new THREE.TextureLoader();
        ground = new THREE.MeshBasicMaterial({ map: loaderGround.load('./resources/img/ulrick-wery-tileableset2-soil.jpg')});
    }
}

let APP_ = null;

window.addEventListener('DOMContentLoaded', async () => {
    APP_ = new level_one();
});