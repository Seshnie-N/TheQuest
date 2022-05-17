import * as THREE from 'three';
import {entity} from "./entity.js";

export const player_input = (() => {

    class ControllerInput extends entity.Component {
        constructor(params) {
            super();
            this.params = params;
            this.Init();
        }

        Init() {
            this.keys_ = {
                forward : false,
                backward: false,
                left: false,
                right: false,
                space: false,
                shift: false,
            };
            document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
            document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
        }

        onKeyDown(event) {
            switch (event.keyCode){
                case 87: // w
                    this.keys_.forward = true;
                    break;
                case 65: // a
                    this.keys_.left = true;
                    break;
                case 83: // s
                    this.keys_.backward = true;
                    break;
                case 68: // d
                    this.keys_.right = true;
                    break;
                case 32: // SPACE
                    this.keys_.space = true;
                    break;
                case 16: // SHIFT
                    this.keys_.shift = true;
                    break;
            }
        }

        onKeyUp(event) {
            switch (event.keyCode){
                case 87: // w
                    this.keys_.forward = false;
                    break;
                case 65: // a
                    this.keys_.left = false;
                    break;
                case 83: // s
                    this.keys_.backward = false;
                    break;
                case 68: // d
                    this.keys_.right = false;
                    break;
                case 32: // SPACE
                    this.keys_.space = false;
                    break;
                case 16: // SHIFT
                    this.keys_.shift = false;
                    break;
            }
        }
    }

    return {
        ControllerInput : ControllerInput,
    };

})();
