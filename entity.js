import * as THREE from 'three';
//Entity component system design pattern
//entity = array of components

export const entity = (() => {

    class Entity {
        constructor() {
            this.name = null;
            this.components = {};
            this.position = new THREE.Vector3();
            this.rotation = new THREE.Quaternion(); //quaternion returns rotation (x,y,z,w)
            this.handlers = {};
            this.parent = null;
        }

        //take in a name of the handler and the associated event handler
        recordHandler(n, h) {
            if (!(n in this.handlers)){
                //if handler does not exist, add it to the array
                this.handlers[n] = [];
            }
            this.handlers[n].push(h);
        }

        setParent(p){
            this.parent = p;
        }

        setName(n) {
            this.name = n;
        }

        get Name() {
            return this.name;
        }

        getName(n) {
            this.name = n;
        }

        setActive(b) {
            this.parent.setActive(this, b);
        }

        addComponent(c) {
            c.setParent(this);
            this.components[c.constructor.name] = c;
            c.InitialiseComponent();
        }

        findEntity(n) {
            return this.parent.get(n);
        }

        broadcast(msg) {
            if (!(msg.topic in this.handlers)) {
                return;
            }

            for (let curHandler of this.handlers[msg.topic]) {
                curHandler(msg);
            }
        }

        setPosition(p) {
            this.position.copy(p);
            this.broadcast({
                topic: 'update.position',
                value: this.position,
            });
        }

        setQuaternion(r) {
            this.rotation.copy(r);
            this.broadcast({
                topic: 'update.rotation',
                value: this.rotation,
            });
        }

        update(timeElapsed) {
            for (let k in this.components) {
                this.components[k].update((timeElapsed));
            }
        }

    }

    class Component {
        constructor() {
            this.parent = null;
        }

        setParent(p) {
            this.parent = p;
        }

        InitialiseComponent() {}

        GetComponent(n) {
            return this.parent.GetComponent(n);
        }

        findEntity(n) {
            return this.parent.findEntity(n);
        }

        broadcast(m) {
            this.parent.broadcast(m);
        }

        update(_) {}

        recordHandler(n, h) {
            this.parent.recordHandler(n, h);
        }
    }

    return {
        Entity: Entity,
        Component: Component,
    };

})();
