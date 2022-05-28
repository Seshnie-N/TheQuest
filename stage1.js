import * as THREE from 'three';
import { OrbitControls } from './examples/jsm/controls/OrbitControls.js';
import {skybox} from "./skybox.js";
import * as CANNON from './resources/modules/cannon-es/dist/cannon-es.js';
import * as CHARACTER from "./Character.js";
import * as CAMERA from "./ThirdPersonCamera.js";

class stage1{
    constructor(){
        this.init();
    }

    init(){
        this._mixers = [];

        //adding models to scene
        this._ConfigStage()
        this._ConfigPhysics();

        //add skybox
        const params = {
            scene : this.scene,
        }
        this.Skybox = new skybox(params);
        this.sb = this.Skybox.makeSkybox();

        this.addGround();

        //load in character here
        this._LoadAnimatedModel();

        this.previousRAF = null;
        this.animate();
    }

    _ConfigStage() {
        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1000.0;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(25,30,25);


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

        //initialise and config orbit controls
        // const controls = new OrbitControls(this.camera, this.renderer.domElement);
        // controls.target.set(0,20,0);
        // controls.update();
        //
        // controls.maxPolarAngle = Math.PI / 2;
    }

    _ConfigPhysics() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -200, 0);
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.broadphase.useBoundingBoxes = true;
        this.world.solver.iterations = 10;
        this.world.defaultContactMaterial.contactEquationStiffness = 1e9;
        this.world.defaultContactMaterial.contactEquationRegularizationTime = 4;
    }

    addGround() {
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 10, 10),
            new THREE.MeshStandardMaterial({
                color: 0x202020,
            }));
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        this.scene.add(plane);
    }

    OnWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    //continuous rendering to create animation
    animate() {
        requestAnimationFrame((t) => {
            if (this.previousRAF === null){
                this.previousRAF = t;
            }
            this.animate();

            this.renderer.render(this.scene, this.camera);
            this.step(t - this.previousRAF);
            this.previousRAF = t;
        });
    }

    step(timeElapsed){
        //update to enable animations
        const timeElapsedS = timeElapsed * 0.001;
        if (this._mixers) {
            this._mixers.map(m => m.update(timeElapsedS));
        }

        //update rotation of skybox for dynamic skybox
        this.sb.rotation.y += timeElapsedS*0.1;

        //Updates
        if (this.Character) {
            this.Character.Update(timeElapsedS);

            //If Game is over
            if (this.Character.getStop === true) {
                this.Pause = true;
            }
        }

        //Update the third person camera.
        if (this.Character) {
            this.CAM.Update(timeElapsedS)
        }

    }

    _LoadAnimatedModel() {
        //Params to be passed to the character class.
        const CharParams = {
            renderer: this.renderer,
            camera: this.camera,
            scene: this.scene,
            world: this.world,
            meshes: this.meshes,
            bodies: this.bodies,
            startPos: this.StartPos,
            rBodies: this.removeBodies,
            rMeshes: this.removeMeshes,
            canvas: this.canvas,
            mapCamera: this.mapCamera,
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
}

let APP_ = null;

window.addEventListener('DOMContentLoaded', async () => {
    APP_ = new stage1();
});