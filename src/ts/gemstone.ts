import { averagePoint, computeTriangleNormal, IHalfSpace, IPoint, ITriangle } from "./geometry";


class Gemstone {
    public facets: IHalfSpace[];
    public bufferData: Float32Array;
    public nbTriangles: number;

    public constructor() {
        this.loadBufferData(
            `# Blender v2.92.0 OBJ File: ''
            # www.blender.org
            mtllib cube.mtl
            o Cube
            v 0.400000 0.400000 -0.400000
            v 0.400000 -0.400000 -0.400000
            v 0.400000 0.400000 0.400000
            v 0.400000 -0.400000 0.400000
            v -0.400000 0.400000 -0.400000
            v -0.400000 -0.400000 -0.400000
            v -0.400000 0.400000 0.400000
            v -0.400000 -0.400000 0.400000
            vt 0.625000 0.500000
            vt 0.875000 0.500000
            vt 0.875000 0.750000
            vt 0.625000 0.750000
            vt 0.375000 0.750000
            vt 0.625000 1.000000
            vt 0.375000 1.000000
            vt 0.375000 0.000000
            vt 0.625000 0.000000
            vt 0.625000 0.250000
            vt 0.375000 0.250000
            vt 0.125000 0.500000
            vt 0.375000 0.500000
            vt 0.125000 0.750000
            vn 0.0000 1.0000 0.0000
            vn 0.0000 0.0000 1.0000
            vn -1.0000 0.0000 0.0000
            vn 0.0000 -1.0000 0.0000
            vn 1.0000 0.0000 0.0000
            vn 0.0000 0.0000 -1.0000
            usemtl Material
            s off
            f 1/1/1 5/2/1 7/3/1 3/4/1
            f 4/5/2 3/4/2 7/6/2 8/7/2
            f 8/8/3 7/9/3 5/10/3 6/11/3
            f 6/12/4 2/13/4 4/5/4 8/14/4
            f 2/13/5 1/1/5 3/4/5 4/5/5
            f 6/11/6 5/10/6 1/1/6 2/13/6`);
    }

    private loadBufferData(input: string): void {
        const lines = input.split("\n");

        const vertices: IPoint[] = [];
        const triangles: ITriangle[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const lineItems = line.split(/\s+/);
            const command = lineItems[0];

            if (command === "v") { // declare vertex
                if (lineItems.length >= 4) {
                    vertices.push({
                        x: parseFloat(lineItems[1]),
                        y: parseFloat(lineItems[2]),
                        z: parseFloat(lineItems[3]),
                    });
                } else {
                    console.log(`Ignoring line ${i} because it does not have enough items: '${line}'.`);
                    continue;
                }
            } else if (command === "f") { // declare face
                if (lineItems.length >= 4) {
                    // faces with more that 3 vertices are interpreted as TRIANGLE_FAN
                    for (let iV = 3; iV < lineItems.length; iV++) {
                        const indices: number[] = [
                            +(lineItems[1].split("/")[0]),
                            +(lineItems[iV - 1].split("/")[0]),
                            +(lineItems[iV].split("/")[0]),
                        ];

                        for (const indice of indices) {
                            if (indice < 1 || indice >= vertices.length) {
                                console.log(`Ignoring line ${i} because vertex index ${indice} is out of range: '${line}'.`);
                                continue;
                            }
                        }

                        triangles.push({
                            p1: vertices[indices[0] - 1],
                            p2: vertices[indices[1] - 1],
                            p3: vertices[indices[2] - 1],
                        });
                    }
                } else {
                    console.log(`Ignoring line ${i} because only triangular faces are supported: '${line}'.`);
                    continue;
                }
            } else {
                console.log(`Ignoring line ${i}: '${line}'.`);
                continue;
            }
        }

        this.nbTriangles = triangles.length;
        this.bufferData = Gemstone.buildBufferFromTriangles(triangles);
        this.facets = Gemstone.buildFacetsFromTriangles(triangles);
    }

    private static buildBufferFromTriangles(triangles: ITriangle[]): Float32Array {
        const nbFloatsPerTriangle = (3 + 3) * 3;
        const bufferData = new Float32Array(nbFloatsPerTriangle * triangles.length);
        let i = 0;
        for (const triangle of triangles) {
            const normal = computeTriangleNormal(triangle);

            bufferData[i++] = triangle.p1.x;
            bufferData[i++] = triangle.p1.y;
            bufferData[i++] = triangle.p1.z;
            bufferData[i++] = normal.x;
            bufferData[i++] = normal.y;
            bufferData[i++] = normal.z;
            bufferData[i++] = triangle.p2.x;
            bufferData[i++] = triangle.p2.y;
            bufferData[i++] = triangle.p2.z;
            bufferData[i++] = normal.x;
            bufferData[i++] = normal.y;
            bufferData[i++] = normal.z;
            bufferData[i++] = triangle.p3.x;
            bufferData[i++] = triangle.p3.y;
            bufferData[i++] = triangle.p3.z;
            bufferData[i++] = normal.x;
            bufferData[i++] = normal.y;
            bufferData[i++] = normal.z;
        }
        return bufferData;
    }

    private static buildFacetsFromTriangles(triangles: ITriangle[]): IHalfSpace[] {
        const result: IHalfSpace[] = [];
        for (const triangle of triangles) {
            result.push({
                point: averagePoint(triangle.p1, triangle.p2, triangle.p3),
                normal: computeTriangleNormal(triangle),
            });
        }
        return result;
    }
}

export { Gemstone };
