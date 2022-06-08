import * as THREE from 'three';

export class skybox {
    constructor(params) {
        this.init(params);
    }

    init(params){
        this.scene = params.scene;
        this.type = params.type;
        this.dim = params.dim;
        this.pos = params.pos;
        this.makeSkybox();
    }


    makeSkybox() {

        //loading in skybox textures
        let urls = [];
        if (this.type === 'night1'){
             urls = [
                '../../resources/pictures/nightsky/negZ.png',
                '../../resources/pictures/nightsky/posZ.png',
                '../../resources/pictures/nightsky/posY.png',
                '../../resources/pictures/nightsky/negY.png',
                '../../resources/pictures/nightsky/posX.png',
                '../../resources/pictures/nightsky/negX.png',
            ];
        }
        if(this.type === 'DaylightBox'){
            urls = [
                '../../resources/pictures/DaylightBox/Daylight Box_Right.bmp', //right
                '../../resources/pictures/DaylightBox/Daylight Box_Left.bmp', //left
                '../../resources/pictures/DaylightBox/Daylight Box_Top.bmp', //top
                '../../resources/pictures/DaylightBox/Daylight Box_Bottom.bmp', //bottom
                '../../resources/pictures/DaylightBox/Daylight Box_Front.bmp', //front
                '../../resources/pictures/DaylightBox/Daylight Box_Back.bmp', //back
            ];
        }
        if(this.type === 'MountainBox'){
            urls = [
                '../../resources/pictures/MountainBox/sh_rt.png', //right
                '../../resources/pictures/MountainBox/sh_lf.png', //left
                '../../resources/pictures/MountainBox/sh_up.png', //top
                '../../resources/pictures/MountainBox/sh_dn.png', //bottom
                '../../resources/pictures/MountainBox/sh_ft.png', //front
                '../../resources/pictures/MountainBox/sh_bk.png', //back
            ];
        }

        if (this.type === 'cloudy') {
            urls = [
                '../../resources/pictures/cloudy/px.png', //px
                '../../resources/pictures/cloudy/nx.png', //nx
                '../../resources/pictures/cloudy/py.png', //py
                '../../resources/pictures/cloudy/ny.png', //ny
                '../../resources/pictures/cloudy/pz.png', //pz
                '../../resources/pictures/cloudy/nz.png', //nz
            ];
        }

        if (this.type === 'night') {
            urls = [
                '../../resources/pictures/night/px.png', //px
                '../../resources/pictures/night/nx.png', //nx
                '../../resources/pictures/night/py.png', //py
                '../../resources/pictures/night/ny.png', //ny
                '../../resources/pictures/night/pz.png', //pz
                '../../resources/pictures/night/nz.png', //nz
            ];
        }

        if (this.type === 'dusk') {
            urls = [
                '../../resources/pictures/dusk/px.png', //px
                '../../resources/pictures/dusk/nx.png', //nx
                '../../resources/pictures/dusk/py.png', //py
                '../../resources/pictures/dusk/ny.png', //ny
                '../../resources/pictures/dusk/pz.png', //pz
                '../../resources/pictures/dusk/nz.png', //nz
            ];
        }

        let materials = [];
        for (let i = 0; i < 6; i++) {
            materials.push(new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load(urls[i]),
                side: THREE.DoubleSide
            }));
        }
        let skyGeometry = new THREE.BoxGeometry(this.dim.x, this.dim.y, this.dim.z);
        this.skybox = new THREE.Mesh(skyGeometry, materials);
        this.skybox.position.set(this.pos.x, this.pos.y, this.pos.z);
        this.scene.add(this.skybox);
    }

    Update(timeElapsed) {
        if (this.skybox){
            this.skybox.rotation.y += timeElapsed*0.05;
        }
    }

}
