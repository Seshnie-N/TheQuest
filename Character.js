import * as THREE from 'three';
import {FBXLoader} from "./examples/jsm/loaders/FBXLoader.js";
import * as CANNON from './resources/modules/cannon-es/dist/cannon-es.js';

/*
* FBX Model and animations downloaded from: Mixamo.com
* Based on a tutorial by SimonDev found on Youtube.*/

export class Character {
    constructor(params) {
        this.init(params);
    }

    init(params){
        this.scene = params.scene;
        this.world = params.world;
        this.renderer = params.renderer;
        this.camera = params.camera;
        this.startPos = params.startPos;

        this.meshes2 = params.meshes2;
        this.bodies2 = params.bodies2;

        //used for bodies and meshes that need to be synced together
        this.meshes = params.meshes;
        this.bodies = params.bodies;
        this.canvas = params.canvas;
        this.mapCamera = params.mapCamera;

        //used for bodies and meshes that need to be removed.
        this.rBodies = params.rBodies;
        this.rMeshes = params.rMeshes;

        this.Stop=false;

        //used to store animations that are loaded.
        this.allAnimations = {};

        //Initialise
        let proxy = new ControllerProxy(this.allAnimations);
        this.stateMachine = new CharacterFSM(proxy);
        this.position = new THREE.Vector3();
        // this.mouse = new THREE.Vector2();
        // this.raycaster = new THREE.Raycaster();

        // //Mouse event listeners.
        // document.addEventListener("click", (e)=> this._onClick(e), false)
        // document.addEventListener("mousemove", (e)=> this._onMouseMove(e), false)

        //Load Model.
        this._LoadModel();
        this.input = new CharacterController();
    }

    // _onMouseMove(event){
    //     this.mouse = {
    //         x: (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1,
    //         y: -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1
    //     }
    //     // this.raycaster.setFromCamera(this.mouse, this.camera);
    //     // let intersects = this.raycaster.intersectObjects(this.scene.children, true);
    //     //
    //     // for (let i = 0; i < intersects.length; i++) {
    //     //     console.log(intersects[i]);
    //     // }
    //
    // }

    // //Use Raycasting to see if mouse is in contact with a key. If so, collect key, updated number of collected keys and update game UI.
    // _onClick(event){
    //     this.mouse = {
    //         x: (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1,
    //         y: -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1
    //     }
    //     this.raycaster.setFromCamera(this.mouse, this.camera);
    //     let intersects = this.raycaster.intersectObjects(this.meshes2, true);
    //
    //     for (let i = 0; i < intersects.length; i++) {
    //         //console.log(intersects[i]);
    //
    //
    //     }
    // }

    //getter functions
    get Position() {
        return this.position;
    }

    get Rotation() {
        if (!this.Character) {
            return new THREE.Quaternion();
        }
        return this.Character.quaternion;
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
        loader.setPath('./resources/models/knight/');
        loader.load('Paladin.fbx', (fbx) => {
            fbx.scale.setScalar(0.1);
            fbx.traverse(c => {
                //come here to add sword later
                if (c.type === "Bone") {
                    if (c.name === "RightHand") {
                        this.RightHand = c;
                    }
                }
                c.castShadow = true;
            });
            this.Character = fbx;
            //this.Character.add(this.mapCamera);

            //Add Physics
            let box = new THREE.Box3().setFromObject(fbx);
            const size = new THREE.Vector3();
            box.getSize(size)
            const height = size.y
            const depth = size.z

            const heavyMaterial = new CANNON.Material('heavy');

            //Cylindrical Shape
            const characterShape = new CANNON.Cylinder(depth , depth, height, 8)
            this.CharacterBody = new CANNON.Body({
                mass: 100,

                material: heavyMaterial
            });
            this.CharacterBody.addShape(characterShape, new CANNON.Vec3(0, height / 2, ));
            this.CharacterBody.angularDamping = 1;
            this.CharacterBody.linearDamping = 0.99;

            //Add it to the scene and world.
            this.world.addBody(this.CharacterBody);
            this.scene.add(this.Character);

            //Animations
            this.mixer = new THREE.AnimationMixer(this.Character);
            this.manager = new THREE.LoadingManager();

            //After all animations are done loading set the state to the idle state.
            this.manager.onLoad = () => {
                this.stateMachine.SetState('idle');
            };

            //function to store the animations.
            const _OnLoad = (animName, anim) => {
                let clip = anim.animations[0];
                if(animName === "throw"){
                    clip = THREE.AnimationUtils.subclip(clip,clip.name, 55,200)
                }
                const action = this.mixer.clipAction(clip);

                this.allAnimations[animName] = {
                    clip: clip,
                    action: action,
                };
            };

            //TODO: add side strafe and slash
            //Load all animations files.
            const loader = new FBXLoader(this.manager);
            loader.setPath("./resources/models/knight/");
            loader.load('Sword And Shield Walk.fbx', (a) => {
                _OnLoad('walk', a);
            });
            // loader.load('Run.fbx', (a) => {
            //     _OnLoad('run', a);
            // });
            loader.load('Sword And Shield Idle.fbx', (a) => {
                _OnLoad('idle', a);
            });
            // loader.load('Jump.fbx', (a) => {
            //     _OnLoad('jump', a);
            // });
            // loader.load('RunJump.fbx', (a) => {
            //     _OnLoad('run_jump', a);
            // });
            // loader.load('Throw.fbx', (a) => {
            //     _OnLoad('throw', a);
            // });

        });

    }

    //Update function - movement
    Update(timeInSeconds) {
        if (!this.Character || !this.CharacterBody || !this.stateMachine._currentState || !this.input) {
            return
        }

        // //update from mouse inputs
        // this.meshes2[0].position.copy(this.bodies2[0].position);
        // this.meshes2[0].quaternion.copy(this.bodies2[0].quaternion);

        //Update FSM based on key press.
        this.stateMachine.Update(timeInSeconds, this.input);

        //Rotation Angle of the Model.
        let angle = -this.Character.rotation.y + Math.PI * 0.5;

        //initialise
        const _Q = new THREE.Quaternion();

        //Speed of movement.
        let speed = 1;
        let rSpeed = speed / 2;

        //Used to see if the model is standing on another object.
        // if (this.CharacterBody.position.y < 1) {
        //     jumpInitialHeight = this.CharacterBody.position.y
        // }

        // if (this.input.CharacterMovement.throw) {
        //     this.input.CharacterMotions.throw = false;
        // }


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
    constructor() {
        this.init();
    }

    init() {
        this.CharacterMotions = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            run: false,
        };

        document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
    }

    _onKeyDown(event) {
        switch (event.code) {
            case "KeyW": //
                this.CharacterMotions.forward = true;
                break;
            case "KeyA": // a
                this.CharacterMotions.left = true;
                break;
            case "KeyS": // s
                this.CharacterMotions.backward = true;
                break;
            case "KeyD": // d
                this.CharacterMotions.right = true;
                break;
            case "ShiftLeft": // SHIFT
                this.CharacterMotions.run = true;
                break;
            case 38: // up
            case 37: // left
            case 40: // down
            case 39: // right
                break;
        }
    }

    _onKeyUp(event) {
        switch(event.code) {
            case "KeyW": // w
                this.CharacterMotions.forward = false;
                break;
            case "KeyA": // a
                this.CharacterMotions.left = false;
                break;
            case "KeyS": // s
                this.CharacterMotions.backward = false;
                break;
            case "KeyD": // d
                this.CharacterMotions.right = false;
                break;
            case "ShiftLeft": // SHIFT
                this.CharacterMotions.run = false;
                break;
            case 38: // up
            case 37: // left
            case 40: // down
            case 39: // right
                break;
        }
    }

}

//finite state machine. This is the parent class that will be used for inheritance
class FiniteStateMachine {
    constructor() {
        this._states = {};
        this._currentState = null;
    }

    AddState(name, type) {
        this._states[name] = type;
    }

    SetState(name) {
        const prevState = this._currentState;

        if (prevState) {
            if (prevState.Name === name) {
                return;
            }
            prevState.Exit();
        }

        const state = new this._states[name](this);

        this._currentState = state;
        state.Enter(prevState);
    }

    Update(timeElapsed, input) {
        if (this._currentState) {
            this._currentState.Update(timeElapsed, input);
        }
    }
}

//inheritance child from above. Used to initial states by adding it to the FSM
class CharacterFSM extends FiniteStateMachine {
    constructor(proxy) {
        super();
        this._proxy = proxy;
        this._Init();
    }

    //Add states
    _Init() {
        this.AddState('idle', IdleState);
        this.AddState('walk', WalkState);
        // this.AddState('run', RunState);
        // this.AddState('jump', JumpState);
        // this.AddState('run_jump', RunningJumpState);
        // this.AddState('walk_jump', WalkingJumpState);
        // this.AddState('throw', ThrowState);
    }
}

//Another parent class that will be inherited from.
class State {
    constructor(parent) {
        this._parent = parent;
    }

    Enter() {
    }

    Exit() {
    }

    Update() {
    }
}

//States that inherit from State Class.
//Most of these classes will work in the same manner.See RunState for comments.
// class RunState extends State {
//     constructor(parent) {
//         super(parent);
//     }
//
//     //return name
//     get Name() {
//         return 'run';
//     }
//     // what happens when state is entered
//     Enter(prevState) {
//         //get the animation for the state
//         const curAction = this._parent._proxy._animations['run'].action;
//
//         //if it came from a previous state, smoothly transition to the current stare.
//         if (prevState) {
//             //get previous animation
//             const prevAction = this._parent._proxy._animations[prevState.Name].action;
//             //enable current animation
//             curAction.enabled = true;
//             //adjust animation based on ratios. Changes according to prevState
//             if (prevState.Name === 'walk') {
//                 const ratio = curAction.getClip().duration / prevAction.getClip().duration;
//                 curAction.time = prevAction.time * ratio;
//             } else if (prevState.Name === 'run_jump') {
//                 const ratio = curAction.getClip().duration / prevAction.getClip().duration + 2;
//                 curAction.time = prevAction.time * ratio;
//             } else {
//                 curAction.time = 0.0;
//                 curAction.setEffectiveTimeScale(1.0);
//                 curAction.setEffectiveWeight(1.0);
//             }
//             //Actually transition
//             curAction.crossFadeFrom(prevAction, 0.5, true);
//             curAction.play();
//         } else {
//             //if first state. play the animation
//             curAction.play();
//         }
//     }
//
//     Exit() {
//     }
//
//     //check what was the button pressed while in this state and transition to the that state.
//     Update(timeElapsed, input) {
//         if (input.CharacterMotions.forward || input.CharacterMotions.backward) {
//             if (!input.CharacterMotions.run) {
//                 this._parent.SetState('walk');
//             }
//
//             if (input.CharacterMotions.jump) {
//                 this._parent.SetState('run_jump');
//             }
//
//             return;
//         }
//
//
//         this._parent.SetState('idle');
//     }
// }

class IdleState extends State {
    constructor(parent) {
        super(parent);
    }

    get Name() {
        return 'idle';
    }

    Enter(prevState) {
        const idleAction = this._parent._proxy._animations['idle'].action;
        if (prevState) {
            const prevAction = this._parent._proxy._animations[prevState.Name].action;
            idleAction.time = 0.0;
            idleAction.enabled = true;
            idleAction.setEffectiveTimeScale(1.0);
            idleAction.setEffectiveWeight(1.0);
            idleAction.crossFadeFrom(prevAction, 0.5, true);
            idleAction.play();
        } else {
            idleAction.play();
        }
    }

    Exit() {
    }

    Update(_, input) {
        if (input.CharacterMotions.forward || input.CharacterMotions.backward) {
            this._parent.SetState('walk');
         } //else if (input.CharacterMotions.jump) {
        //     this._parent.SetState('jump');
        // } else if(input.CharacterMotions.throw){
        //     this._parent.SetState('throw');
        // }
    }
}

class WalkState extends State {
    constructor(parent) {
        super(parent);
    }

    get Name() {
        return 'walk';
    }

    Enter(prevState) {
        const curAction = this._parent._proxy._animations['walk'].action;
        if (prevState) {
            const prevAction = this._parent._proxy._animations[prevState.Name].action;

            curAction.enabled = true;

            if (prevState.Name === 'run') {
                const ratio = curAction.getClip().duration / prevAction.getClip().duration;
                curAction.time = prevAction.time * ratio;
            } else {
                curAction.time = 0.0;

                curAction.setEffectiveTimeScale(1.0);
                curAction.setEffectiveWeight(1.0);
            }

            curAction.crossFadeFrom(prevAction, 0.5, true);
            curAction.play();
        } else {
            curAction.play();
        }
    }

    Exit() {
    }

    Update(timeElapsed, input) {
        if (input.CharacterMotions.forward || input.CharacterMotions.backward) {
            if (input.CharacterMotions.run) {
                this._parent.SetState('run');
            }

            if (input.CharacterMotions.jump) {
                this._parent.SetState('walk_jump');

            }

            return;
        }


        this._parent.SetState('idle');
    }
}


