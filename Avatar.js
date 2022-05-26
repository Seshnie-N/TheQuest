import * as THREE from 'three';
import {FBXLoader} from "./examples/jsm/loaders/FBXLoader";

/*
* The Character uses a FBX model with animations.
* Model downloaded from: Mixamo.com
* Based on a tutorial by SimonDev found on Youtube.*/

export class Avatar {
    constructor(params) {
        init(params);
    }

    init(params){
        this.scene = params.scene;
        this.world = params.world;
        this.renderer = params.renderer;
        this.camera = params.camera;
        this.startPos = params.startPos;

        //used for bodies and meshes that need to be synced together
        this.meshes = params.meshes;
        this.bodies = params.bodies;
        this.canvas = params.canvas;
        this.mapCamera = params.mapCamera;

        //used for bodies and meshes that need to be removed.
        this.rBodies = params.rBodies;
        this.rMeshes = params.rMeshes;

        //List of all Pokemon Available to be caught.
        //Dictionary of three arrays: names, bodies and meshes.
        // this.pokemon = params.pokemon;
        // this.taskList = params.taskList;
        // this.pokeballs = params.pokeballs;

        this.Stop=false;
        //Array of names of the caught pokemon.
        this.caught = []
        this.seen = []

        this.WorkStation = params.WorkStation

        //used to store animations that are loaded.
        this.allAnimations = {};

        // this.pokedex = new Pokedex()

        //Initialise
        let proxy = new ControllerProxy(this.allAnimations)
        this.stateMachine = new CharacterFSM(proxy)
        this.position = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();

        //Mouse event listeners.
        document.addEventListener("dblclick", (e)=> this._onDoubleClick(e), false)
        document.addEventListener("mousemove", (e)=> this._onMouseMove(e), false)

        //Load Model.
        this._LoadModel();
        this.input = new CharacterController(params, this.CharacterBody);
    }

    //getter functions
    get Position() {
        return this.position;
    }

    get Rotation() {
        if (!this.Avatar) {
            return new THREE.Quaternion();
        }
        return this.Avatar.quaternion;
    }

    get getStop(){
        return this.Stop;
    }
    setStop(){
        this.Stop =false;
    }

    //load model
    _LoadModel() {
        this.manager = new THREE.LoadingManager();
        this.manager.onLoad = () => {
            // const loadingScreen = document.getElementById( 'loading-screen' );
            // loadingScreen.classList.add( 'fade-out' );
            //
            // // optional: remove loader from DOM via event listener
            // loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
            // console.log(this.taskList)
        };

        function onTransitionEnd( event ) {
            const element = event.target;
            element.remove();
        }


        const loader = new FBXLoader();
        loader.setPath('./resources/models/');
        loader.load('Paladin.fbx', (fbx) => {
            fbx.scale.setScalar(0.2);
            fbx.traverse(c => {
                //come here to add sword later
                if (c.type === "Bone") {
                    if (c.name === "RightHand") {
                        this.RightHand = c;
                    }
                }
                c.castShadow = true;
            });

            const params = {
                target: fbx,
                camera: this.camera,
            }

            // const anim = new FBXLoader();
            // anim.setPath('./resources/models/');
            // anim.load('Sword And Shield Idle.fbx', (anim) => {
            //     const m = new THREE.AnimationMixer(fbx);
            //     this._mixers.push(m);
            //     const idle = m.clipAction(anim.animations[0]);
            //     idle.play();
            // });
            this.Avatar.add(fbx);
        });
    }

    //attach animations according to state


    //detect mesh intersections


    //Update function - movement
    Update(timeInSeconds) {
        if (!this.Character || !this.CharacterBody || !this.stateMachine._currentState || !this.input) {
            return
        }

        //Update FSM based on key press.
        this.stateMachine.Update(timeInSeconds, this.input);

        //Rotation Angle of the Model.
        let angle = -this.Character.rotation.y + Math.PI * 0.5;

        //initialise
        let jumpInitialHeight = null;
        const _Q = new THREE.Quaternion();

        //Speed of movement.
        let speed = 2;
        let rSpeed = speed / 3;

        //Used to see if the model is standing on another object.
        if (this.CharacterBody.position.y < 1) {
            jumpInitialHeight = this.CharacterBody.position.y
        }

        if (this.input.CharacterMotions.throw) {
            this.input.CharacterMotions.throw = false;
        }


        //Increase Speed if the run key is pressed.
        if (this.input.CharacterMotions.run) {
            speed *= 4;
            rSpeed *= 2;
        }

        //Move forward in relation to current direction
        if (this.input.CharacterMotions.forward) {
            this.CharacterBody.position.x += Math.cos(angle) * speed;
            this.CharacterBody.position.z += Math.sin(angle) * speed;
        }

        //Move backward in relation to current direction
        if (this.input.CharacterMotions.backward) {
            this.CharacterBody.position.x -= Math.cos(angle) * speed;
            this.CharacterBody.position.z -= Math.sin(angle) * speed;
        }


        //Left
        //Rotate the CharacterBody left at a fixed speed.
        if (this.input.CharacterMotions.left) {
            this.Character.rotation.y += rSpeed * timeInSeconds * 2;
            _Q.copy(this.Character.quaternion);
        }

        //Right
        //Rotate the CharacterBody right at a fixed speed.
        if (this.input.CharacterMotions.right) {
            this.Character.rotation.y -= rSpeed * timeInSeconds * 2;
            _Q.copy(this.Character.quaternion);
        }

        //Sync the CharacterBody with the Character Model.
        this.CharacterBody.quaternion.copy(_Q);
        this.Character.position.copy(this.CharacterBody.position);

        this.position.copy(this.CharacterBody.position);


        //Update Animations.
        if (this.mixer) {
            this.mixer.update(timeInSeconds);
        }
    }
}

//allows animations to be passed between classes
class ControllerProxy {
    constructor(animations) {
        this._animations = animations
    }

    get animations() {
        return this._animations;
    }

}

class CharacterController {
    constructor(params) {
        this.init(params);
    }

    init(params) {
        this._params = params;
        this._move = {
            forward: false,
            backward: false,
            left: false,
            right: false,
        };
        this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
        this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
        this._velocity = new THREE.Vector3(0, 0, 0);

        document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
    }

    _onKeyDown(event) {
        switch (event.keyCode) {
            case 87: // w
                this._move.forward = true;
                break;
            case 65: // a
                this._move.left = true;
                break;
            case 83: // s
                this._move.backward = true;
                break;
            case 68: // d
                this._move.right = true;
                break;
            case 38: // up
            case 37: // left
            case 40: // down
            case 39: // right
                break;
        }
    }

    _onKeyUp(event) {
        switch(event.keyCode) {
            case 87: // w
                this._move.forward = false;
                break;
            case 65: // a
                this._move.left = false;
                break;
            case 83: // s
                this._move.backward = false;
                break;
            case 68: // d
                this._move.right = false;
                break;
            case 38: // up
            case 37: // left
            case 40: // down
            case 39: // right
                break;
        }
    }



}