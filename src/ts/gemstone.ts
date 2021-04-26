interface IPoint {
    x: number;
    y: number;
    z: number;
}

interface IVector {
    x: number;
    y: number;
    z: number;
}

interface IHalfSpace {
    point: IPoint;
    normal: IVector;
}

class Gemstone {
    public readonly facets: IHalfSpace[];

    public constructor() {
        this.facets = [];

        const DISTANCE = 0.23;

        const NB_BOTTOM = 8;
        for (let i = 0; i < NB_BOTTOM; i++) {
            const angle = (i + 0.5) * 2 * Math.PI / NB_BOTTOM;
            const x = DISTANCE * Math.cos(angle);
            const y = DISTANCE * Math.sin(angle);
            const z = -DISTANCE;

            const length = Math.sqrt(x * x + y * y + z * z);
            this.facets.push({
                point: { x, y, z },
                normal: { x: x / length, y: y / length, z: z / length },
            });
        }

        const NB_TOP = 16;
        for (let i = 0; i < NB_TOP; i++) {
            const angle = (i + 0.5) * 2 * Math.PI / NB_TOP;
            const x = DISTANCE * Math.cos(angle);
            const y = DISTANCE * Math.sin(angle);
            const z = DISTANCE;

            const length = Math.sqrt(x * x + y * y + z * z);
            this.facets.push({
                point: { x, y, z },
                normal: { x: x / length, y: y / length, z: z / length },
            });
        }

        const NB_SUPERTOP = 8;
        for (let i = 0; i < NB_SUPERTOP; i++) {
            const angle = i * 2 * Math.PI / NB_SUPERTOP;
            const x = 0.3 * DISTANCE * Math.cos(angle);
            const y = 0.3 * DISTANCE * Math.sin(angle);
            const z = DISTANCE;

            const length = Math.sqrt(x * x + y * y + z * z);
            this.facets.push({
                point: { x, y, z },
                normal: { x: x / length, y: y / length, z: z / length },
            });
        }

        this.facets.push({
            point: { x: 0, y: 0, z: 0.2 },
            normal: { x: 0, y: 0, z: 1 },
        });

        const NB_SIDE = 16;
        for (let i = 0; i < NB_SIDE; i++) {
            const angle = i * 2 * Math.PI / NB_SIDE;
            const x = 1.8 * DISTANCE * Math.cos(angle);
            const y = 1.8 * DISTANCE * Math.sin(angle);
            const z = 0;

            const length = Math.sqrt(x * x + y * y + z * z);
            this.facets.push({
                point: { x, y, z },
                normal: { x: x / length, y: y / length, z: z / length },
            });
        }
    }
}

export { Gemstone };
