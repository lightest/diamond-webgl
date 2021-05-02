# TITLE
INTRO

See it live [here (CHANGE LINK)]().

## Description

BLABLA DESCRIPTION

## Preview
COOL IMAGES

## Diamond
### Diamond cut
The beauty of a diamond resides not only in the purity of the gem, but also in the way it is cut. The purity affects mostly light absorption, while the cut affects the way light is reflected. The goal is to reflect as much light as possible towards the viewer (that is, towards the top of the gem) so that the diamond appears the brightest.

One of the most popular diamond cuts is the brilliant cut. Subtle variations in the proportions change greatly the way light is reflected and can make the difference between a mediocre and an ideal diamond. It is described in by a few key lengths:

<img src="src/readme/diamond_brilliant_cut.png"/>

### ASET evaluation
A common tool to evaluate the quality of the diamond cut is the Angular Spectrum Evaluation Tool (ASET) image evaluation. Such an image helps to check the way the diamond gives light back (cut proportions, symmetry etc.).

![ASET illustration](src/readme/ASET.png)
*On the left, diamond in natural light. On the right, ASET vizualiation. Image credits: www.diamondbuyingadvice.com*

ASET images can either be taken with in with an ASET scope, or be computed. Here is how it is built:

![ASET illustration](src/readme/ASET_meaning.png)

On an ASET image, the blue is the light that comes directly from above, the green from the sides, and the red from between the two. The black parts are parts that don't reflect the light at all.
The ASET image of a high quality diamond should:
- be as bright as possible
- exhibit a good symmetry
- have as much red as possible
- have blue areas that are very distinct from the red and green ones. This contributes to creating good contrasts between bright and dark areas.


Here is an ASET image of a perfect diamond I generated with this project, and its decomposition:

![ASET illustration](src/readme/ASET_decomposition.png)

## Implementation details
This project is essentially ray tracing. The main parts are:
- modeling the diamond
- simulating the behaviour of light using laws of geometrical optics
- detection of intersections between the light ray and the surface of the diamond. This needs to be efficient because it will be performed at most 20 times per fragment.
- a bit of post processing

### Modeling and ray tracing
The base operation in ray tracing is to detect collisions between light rays and geometry (triangles).
In this scene, it is critical because each light ray (fragment) will possibly be refracted/reflected dozens of time.

A ray intersects a triangle if and only if:
- an intersection point exists that is both on the trajectory of the ray, and the plane of the triangle
- this point is inside the triangle, between its 3 vertices. To test this, a triple dot product can be used to check that the point is on the same side of all 3 edges.

In this project, computing the intersection with the triangles would be too expensive. As an optimization, it is possible to skip the second part if I limit myself to convex shapes. I can then define the diamond as the intersection of all the half-spaces formed by the facets. This is very handy because:
- computing the intersection with a plane is way less expensive
- a typical diamond is made of 176 triangles but only 89 facets.

It turns out this limitation is not a problem at all because most diamonds are convex. 
<img src="src/readme/diamond_as_halfplanes.png"/>

The intersection is then seen as the equations:
<img src="src/readme/formula_intersection.png"/>

### Geometrical optics
The behaviour of light rays as they go through the diamond can be described by a few simple rules.

#### Refractive index
A medium such as diamond is defined by a refractive index n, which is defined as:
<table>
    <tr>
        <td>
            <img src="src/readme/formula_refractive_index.png"/>
        </td>
        <td>
            <ul>
                <li>c is the speed of light in void</li>
                <li>v the speed of light in the medium</li>
            </ul>
        </td>
    </tr>
</table>

This is why a refractive index is always greater than 1. I approximated air to have a refractive index of 1.

The speed of light in the medium is defined as:
<table>
    <tr>
        <td>
            <img src="src/readme/formula_light_speed.png"/>
        </td>
        <td>
            <ul>
                <li>λ is the wavelength</li>
                <li>f is the frequency</li>
            </ul>
        </td>
    </tr>
</table>

The perceived color is linked to the frequency, which is independent of media. This formula shows that for a given medium, each color has a unique refractive index. This is how a prism turns white light into a visible rainbow.

#### Snell's law
When a incident ray r<sub>i</sub> hits an boundary between two media (for instance a side of the diamond), it is split in two:
- a part of the ray (r<sub>r</sub>) is reflected
- another part (r<sub>t</sub>) is transmitted through the medium

<img width="400px" src="src/readme/reflection_refraction.png"/>

Here all angles are considered to be in [0, π/2] and are defined relatively to the local normal of the surface.
The reflected ray has the same angle as the incident ray (θ<sub>i</sub> = θ<sub>r</sub>).
The relationship between θ<sub>i</sub> and θ<sub>t</sub> is described by Snell's law:

<img src="src/readme/formula_snell.png"/>

This formula shows that:
- if the ray is entering a medium with a higher refraction index, the transmitted ray will be closer to the normal than the incident ray;
- if the ray is entering a medium with a lower refraction index, it is the other way around.

#### Fresnel
The intensity of the incident ray is split between the reflected ray and the transmitted ray (assuming there is no loss):

<table>
    <tr>
        <td>
            <img src="src/readme/formula_energy_split.png"/>
        </td>
        <td>
            <ul>
                <li>F is the intensity of the incident ray</li>
                <li>F<sub>r</sub> is the intensity of the reflected ray</li>
                <li>F<sub>t</sub> is the intensity of the transmitted ray</li>
            </ul>
        </td>
    </tr>
</table>

Fresnel gives us these coefficients:

<img src="src/readme/formula_fresnel.png"/>

This formula shows that the closer to the normal the incident ray is, the less reflective the surface is. This phenomenon is very natural and can be observed everywhere: if you are by a lake and look at the water from above, you clearly see the ground underneath the surface (no reflection due to perpendicular incident ray), however if you look at the other side of the lake, you only see the sky reflected by the water surface (high reflection due almost parallel incident ray).


#### Total reflection

If the light ray is entering a medium with a lower refractive index, the transmitted ray will be further away to the surface than the incident ray.

The critical angle (θ<sub>c</sub>) defines the maximum angle the incident ray can have that creates a transmitted ray. Beyond this angle, the entirety of the incident ray is reflected. This is called a total reflection.

<img width="400px" src="src/readme/total_reflection.png"/>

This angle is simply provided by the Snell formula when θ<sub>t</sub> = π/2:

<img src="src/readme/formula_critical_angle.png"/>

#### Beer absorption
No medium is completely transparent: the light is a partially absorbed by the material it is traveling through. The more opaque the medium, the more light is absorbed. This is described by Beer's law:

<table>
    <tr>
        <td>
            <img src="src/readme/formula_beer.png"/>
        </td>
        <td>
            <ul>
                <li>L is the loss of intensity</li>
                <li>α is the absorbance of the medium</li>
                <li>d is the distance traveled through the medium</li>
            </ul>
        </td>
    </tr>
</table>

### Post processing

#### Bloom
A small bloom effect is performed by:
- rendering to a texture, at full size
- copying this texture into a smaller one (to the next part faster) and extracting the bright parts
- blurring the small texture (I don't use a gaussian blur, but simply blur 2 two directions in one pass to create a sparkle effect)
- finally, combining both the full-sized and small texture

<table>
    <tr>
        <td>
            <img src="src/readme/bloom_fullsize.png"/>
        </td>
        <td>
            <img src="src/readme/bloom_downsized.png"/>
        </td>
        <td>
            <img src="src/readme/bloom_blurred.png"/>
        </td>
        <td>
            <img src="src/readme/bloom_final.png"/>
        </td>
    </tr>
</table>

#### Antialiasing
In this scene there are 2 types of aliasing:
- on the edges of the geometry (outline of the diamond). This one is due to the rasterization.
- inside the diamond. This is due to the processing of each fragment.

On my machine, asking for antialiasing with the `antialias` [WebGL flag](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext) only removes the first type of aliasing. This makes me think it uses a kind of MSAA because a SSAA would also remove the fragment aliasing. I am not sure it is part of the WebGL spec, it is probably implementation-dependent.

When doing post-processing, I first render a scene to an off-screen texture. Unfortunately, WebGL 1 does not support antialiasing when rendering to a texture. To antialias the scene, I have two options:
- do a kind of SSAA where I use a texture twice larger than the screen, which I downsize back to screen dimensions later. I cannot do this because it would lead to way too many fragments being processed (each fragment takes a lot of processing power in a ray-tracing application).
- or apply myself a custom antialiasing such as FXAA. This is the right approach but I didn't bother.