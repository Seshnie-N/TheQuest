import * as THREE from 'three';

export class skybox {
    constructor(params) {
        this.init(params);
    }

    init(params){
        this.scene = params.scene;
        this.type = params.type;
    }

    function
    makeSkybox() {

        let urls = [];
        if (this.type === 'night1'){
             urls = [
                './resources/images/nightsky/negZ.png',
                './resources/images/nightsky/posZ.png',
                './resources/images/nightsky/posY.png',
                './resources/images/nightsky/negY.png',
                './resources/images/nightsky/posX.png',
                './resources/images/nightsky/negX.png',
            ];
        }
        if (this.type === 'day') {
            urls = [
                './resources/pictures/sky/px.png', //px
                './resources/pictures/sky/nx.png', //nx
                './resources/pictures/sky/py.png', //py
                './resources/pictures/sky/ny.png', //ny
                './resources/pictures/sky/pz.png', //pz
                './resources/pictures/sky/nz.png', //nz
            ];
        }

        if (this.type === 'galaxy') {
            urls = [
                './resources/pictures/galaxy/px.png', //px
                './resources/pictures/galaxy/nx.png', //nx
                './resources/pictures/galaxy/py.png', //py
                './resources/pictures/galaxy/ny.png', //ny
                './resources/pictures/galaxy/pz.png', //pz
                './resources/pictures/galaxy/nz.png', //nz
            ];
        }

        if (this.type === 'night') {
            urls = [
                './resources/pictures/night/px.png', //px
                './resources/pictures/night/nx.png', //nx
                './resources/pictures/night/py.png', //py
                './resources/pictures/night/ny.png', //ny
                './resources/pictures/night/pz.png', //pz
                './resources/pictures/night/nz.png', //nz
            ];
        }

        if (this.type === 'cloudy') {
            urls = [
                './resources/pictures/cloudy/px.png', //px
                './resources/pictures/cloudy/nx.png', //nx
                './resources/pictures/cloudy/py.png', //py
                './resources/pictures/cloudy/ny.png', //ny
                './resources/pictures/cloudy/pz.png', //pz
                './resources/pictures/cloudy/nz.png', //nz
            ];
        }

        let materials = [];
        for (let i = 0; i < 6; i++) {
            materials.push(new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load(urls[i]),
                side: THREE.DoubleSide
            }));
        }
        let skyGeometry = new THREE.BoxGeometry(1300, 1300, 1300);
        this.skybox = new THREE.Mesh(skyGeometry, materials);
        this.skybox.position.set(400, -100, 400);
        this.scene.add(this.skybox);
        return this.skybox;
    }

}

