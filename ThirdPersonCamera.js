import * as THREE from 'three';

export class ThirdPersonCamera {
    constructor(params) {
        this.params = params;
        this.camera = params.camera;

        this.currentPosition = new THREE.Vector3();
        this.currentLookat = new THREE.Vector3();
    }

    calcOffset() {
        const offset = new THREE.Vector3(-15, 20, -30);
        offset.applyQuaternion(this.params.target.Rotation);
        offset.add(this.params.target.Position);
        return offset;
    }

    calcLookat() {
        const lookat = new THREE.Vector3(0, 10, 50);
        lookat.applyQuaternion(this.params.target.Rotation);
        lookat.add(this.params.target.Position);
        return lookat;
    }

    Update(timeElapsed) {
        const offset = this.calcOffset();
        const lookat = this.calcLookat();

        const t = 1.0 - Math.pow(0.001, timeElapsed);

        //when you want to apply a simple positional transformation over time
        //lerp can be used to move and object from A to B
        //alpha value determines how instantly the slide happens (1 = instant)
        this.currentPosition.lerp(offset, t);
        this.currentLookat.lerp(lookat, t);

        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookat);
    }
}

//wrapping a function call in parenthesise and ending with parenthesise make the function an IIFE
//IIFE - Immediately Invoked Function Expression
//IIFEs are functions that are executed immediately after being defined
//IIFEs are very useful because they don’t pollute the global object,
//and they are a simple way to isolate variables declarations