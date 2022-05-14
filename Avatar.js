

class CharacterController {
    constructor() {
        this.Init();
    }

    Init() {
        this.move = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            run: false,
            hit: false,
        };
        document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
    }


    _onKeyDown(event) {
        switch (event.code) {
            case "ArrowUp": // forward
                this.move.forward = true;
                break;
            case "KeyA": // a
                this.move.left = true;
                break;
            case "KeyS": // s
                this.move.backward = true;
                break;
            case "KeyD": // d
                this.move.right = true;
                break;
            case "Space": // SPACE
                this.move.hit = true;
                break;
        }
    }

    _onKeyUp(event) {
        switch (event.code) {
            case "ArrowUp": // forward
                this.move.forward = false;
                break;
            case "KeyA": // a
                this.move.left = false;
                break;
            case "KeyS": // s
                this.move.backward = false;
                break;
            case "KeyD": // d
                this.move.right = false;
                break;
            case "Space": // SPACE
                this.move.hit = false;
                break;
        }
    }

}
