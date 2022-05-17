import * as THREE from 'three';
import {FBXLoader} from "./examples/jsm/loaders/FBXLoader.js";
import {entity} from "./entity.js";
import {player_state} from "./player_state.js";

export const player_entity = (() => {

    class PlayerController extends entity.Component {
        constructor(params) {
            super();
            this.init(params);
        }

        init(params) {
            this.params = params;
            this.decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
            this.acceleration = new THREE.Vector3(1, 0.125, 50.0);
            this.speed = new THREE.Vector3(0, 0, 0);
            this.position = new THREE.Vector3();


            this.Animations = {};
            this.stateMachine = new CharacterFSM(
                new PlayerControllerProxy(this.Animations));

            this.LoadModel();
        }

        InitComponent() {
            //this.recordHandler('health.death', (m) => { this.OnDeath(m); });
        }

        LoadModel() {
            const loader = new FBXLoader();
            loader.setPath('./resources/knight/');
            loader.load('Castle Guard 02.fbx', (fbx) => {
                this.target = fbx;
                this.target.scale.setScalar(0.1);
                this.params.scene.add(this.target);

                this.bones = {};

                for (let b of this.target.children[1].skeleton.bones) {
                    this.bones[b.name] = b;
                }

                this.target.traverse(c => {
                    c.castShadow = true;
                    c.receiveShadow = true;
                    if (c.material && c.material.map) {
                        c.material.map.encoding = THREE.sRGBEncoding;
                    }
                });

                this.broadcast({
                    topic: 'load.character',
                    model: this.target,
                    bones: this.bones,
                });

                this.mixer = new THREE.AnimationMixer(this.target);


                const OnLoad = (animName, anim) => {
                    const clip = anim.animations_[0];
                    const action = this.mixer.clipAction(clip);

                    this.Animations[animName] = {
                        clip: clip,
                        action: action,
                    };


                };


                this.manager = new THREE.LoadingManager();
                this.manager.onLoad = () => {
                    this.stateMachine.SetState('idle');
                };

                const loader = new FBXLoader(this.manager);
                loader.setPath('./resources/knight/');
                loader.load('Sword And Shield Idle.fbx', (a) => { OnLoad('idle', a); });
                loader.load('Sword And Shield Walk.fbx', (a) => { OnLoad('walk', a); });
                //loader.load('Sword And Shield Run.fbx', (a) => { OnLoad('run', a); });
                // loader.load('Sword And Shield Slash.fbx', (a) => { _OnLoad('attack', a); });
                // loader.load('Sword And Shield Death.fbx', (a) => { _OnLoad('death', a); });

            });
        }

        Update(timeInSeconds) {
            if (!this.stateMachine.currentState) {
                return;
            }

            const input = this.GetComponent('ControllerInput');
            this.stateMachine.Update(timeInSeconds, input);

            if (this.mixer) {
                this.mixer.update(timeInSeconds);
            }

            HARDCODED
            if (this.stateMachine.currentState.action) {
                this.broadcast({
                    topic: 'player.action',
                    action: this.stateMachine.currentState.Name,
                    time: this.stateMachine.currentState.action.time,
                });
            }

            const currentState = this.stateMachine.currentState;
            if (currentState.Name !== 'walk' &&
                currentState.Name !== 'idle') {
                return;
            }

            const speed = this.speed;
            const frameDecceleration = new THREE.Vector3(
                speed.x * this.decceleration.x,
                speed.y * this.decceleration.y,
                speed.z * this.decceleration.z
            );
            frameDecceleration.multiplyScalar(timeInSeconds);
            frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
                Math.abs(frameDecceleration.z), Math.abs(speed.z));

            speed.add(frameDecceleration);

            const controlObject = this.target;
            const _Q = new THREE.Quaternion();
            const _A = new THREE.Vector3();
            const _R = controlObject.quaternion.clone();

            const acc = this.acceleration.clone();
            if (input.keys.shift) {
                acc.multiplyScalar(2.0);
            }

            if (input.keys.forward) {
                speed.z += acc.z * timeInSeconds;
            }
            if (input.keys.backward) {
                speed.z -= acc.z * timeInSeconds;
            }
            if (input.keys_.left) {
                _A.set(0, 1, 0);
                _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this.acceleration.y);
                _R.multiply(_Q);
            }
            if (input.keys.right) {
                _A.set(0, 1, 0);
                _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this.acceleration.y);
                _R.multiply(_Q);
            }

            controlObject.quaternion.copy(_R);

            const oldPosition = new THREE.Vector3();
            oldPosition.copy(controlObject.position);

            const moveforward = new THREE.Vector3(0, 0, 1);
            moveforward.applyQuaternion(controlObject.quaternion);
            moveforward.normalize();

            const sideways = new THREE.Vector3(1, 0, 0);
            sideways.applyQuaternion(controlObject.quaternion);
            sideways.normalize();

            sideways.multiplyScalar(speed.x * timeInSeconds);
            moveforward.multiplyScalar(speed.z * timeInSeconds);

            const pos = controlObject.position.clone();
            pos.add(moveforward);
            pos.add(sideways);

            // const collisions = this._FindIntersections(pos);
            // if (collisions.length > 0) {
            //     return;
            // }

            controlObject.position.copy(pos);
            this.position.copy(pos);


            this.parent.setPosition(this.position);
            console.log(this.position);
            this.parent.setQuaternion(this.target.quaternion);
        }
    }

    class PlayerControllerProxy {
        constructor(animations) {
            this.Animations = animations;
        }

        get animations_() {
            return this.Animations;
        }
    };

    //provides methods to construct finite state machine with animations linked to character movement
    class FiniteStateMachine {
        constructor() {
            this.states = {};
            this.currState = null;
        }

        AddState(name, type) {
            this.states[name] = type;
        }

        SetState(name) {
            const prevState = this.currState;

            if (prevState) {
                if (prevState.Name === name) {
                    return;
                }
                prevState.Exit();
            }

            const state = new this.states[name](this);

            this.currentState = state;
            state.Enter(prevState);
        }

        Update(timeElapsed, input) {
            if (this.currState) {
                this.currState.Update(timeElapsed, input);
            }
        }
    }

    //initialise FSM
    class CharacterFSM extends FiniteStateMachine {
        constructor(proxy) {
            super();
            this.proxy = proxy;
            this.init();
        }

        init() {
            this.AddState('idle', player_state.IdleState);
            this.AddState('walk', player_state.WalkingState);
            //this.AddState('run', player_state.RunningState);
        }
    }

    return {
        PlayerController: PlayerController,
        PlayerProxy: PlayerControllerProxy,
    };

})();
