
export const entity_manager = (() => {
    class EntityManager {
        constructor() {
            this.ids = 0;
            this.entitiesMap = {};
            this.entities = [];
        }

        makeName() {
            this.ids += 1;
            return 'name_' + this.ids;
        }

        get(n) {
            return this.entitiesMap[n];
        }

        //check back later, might not need
        filter(cb) {
            return this.entities.filter(cb);
        }

        add(e, n) {
            if (!n) {
                n = this.makeName();
            }

            this.entitiesMap[n] = e;
            this.entities.push(e);

            e.setParent(this);
            e.setName(n);
        }

        setActive(e, b) {
            const i = this.entities.indexOf(e);
            if (i < 0) {
                return;
            }

            this.entities.splice(i, 1);
        }

        update(timeElapsed) {
            for (let e of this.entities) {
                e.update(timeElapsed);
            }
        }

    }

    return {
        EntityManager: EntityManager
    };

})();

