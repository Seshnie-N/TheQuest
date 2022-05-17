//this class defines animations for various states in which the player can exist within the game world
import * as THREE from 'three';

export const player_state = (() => {

    //define abstract class
    class State {
        constructor(parent) {
            this.parent = parent;
        }

        Enter() {}
        Exit() {}
        Update() {}
    }

    class IdleState extends State {
        constructor(parent) {
            super(parent);
        }

        get Name() {
            return 'idle';
        }

        Enter(prevState) {
            const idleAction = this.parent.proxy.Animations['idle'].action;
            if (prevState) {
                const prevAction = this.parent.proxy.Animations[prevState.Name].action;
                idleAction.time = 0.0;
                idleAction.enabled = true;
                idleAction.setEffectiveTimeScale(1.0);
                idleAction.setEffectiveWeight(1.0);
                idleAction.crossFadeFrom(prevAction, 0.25, true);
                idleAction.play();
            } else {
                idleAction.play();
            }
        }

        Exit() {
        }

        Update(_, input) {
            if (input.keys_.forwards || input.keys_.backward) {
                this.parent.SetState('walk');
            } else if (input.keys.space) {
                //this.parent.SetState('attack');
            }
        }
    }

    class WalkingState extends State {
        constructor(parent) {
            super(parent);
        }

        get Name() {
            return 'walk';
        }

        Enter(prevState) {
            const curAction = this.parent.proxy.Animations['walk'].action;
            if (prevState) {
                const prevAction = this.parent.proxy.Animations[prevState.Name].action;

                curAction.enabled = true;

                if (prevState.Name === 'run') {
                    const ratio = curAction.getClip().duration / prevAction.getClip().duration;
                    curAction.time = prevAction.time * ratio;
                } else {
                    curAction.time = 0.0;
                    curAction.setEffectiveTimeScale(1.0);
                    curAction.setEffectiveWeight(1.0);
                }

                curAction.crossFadeFrom(prevAction, 0.1, true);
                curAction.play();
            } else {
                curAction.play();
            }
        }

        Exit() {
        }

        Update(timeElapsed, input) {
            if (input.keys.forward || input.keys.backward) {
                if (input.keys.shift) {
                    this.parent.SetState('run');
                }
                return;
            }

            this.parent.SetState('idle');
        }
    }

    class RunningState {

    }

    return {
        State : State,
        IdleState : IdleState,
        WalkingState : WalkingState,
        RunningState : RunningState,
    };

})();
