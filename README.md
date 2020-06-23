<meta name="google-site-verification" content="c0XDkWOd2V_c74sAGyck5d1YfR3l1-Xkc-oQkGo2Y30" />

# arcade-sprite-viewer
An arcade game sprite viewer / map viewer (cps1 neogeo etc.)
* Images are assembled by putting together serials of tiles that extracted from rom data. Currently it only supports a few games, Metal Slug, King of Fighters, Punisher, Dinosaur & Cadillacs, Gunbird, Warth, etc.
BTW. CPS & NEOGEO both use 68k but PSIKYOSH uses SH-2 which is far more difficult to read.
* Click [here](https://github.com/bombzj/arcade-sprite-viewer) to view source code.</p>

## CPS [view more](https://bombzj.github.io/arcade-sprite-viewer/cps)
![punisher animation](https://bombzj.github.io/arcade-sprite-viewer/res/punisheranim.gif)<br/>
![dino animation](https://bombzj.github.io/arcade-sprite-viewer/res/animdino.gif)<br/>

* Click [here](https://bombzj.github.io/arcade-sprite-viewer/viewer.html?punisher) to view `punisher`.

## PSIKYOSH [view more](https://bombzj.github.io/arcade-sprite-viewer/psi)
![1945ii animation](https://bombzj.github.io/arcade-sprite-viewer/res/anim1945ii.gif)<br/>
![gunbird2 background](https://bombzj.github.io/arcade-sprite-viewer/res/mapgunbird2.png)<br/>

* Click [here](https://bombzj.github.io/arcade-sprite-viewer/viewer.html?1945ii) to view `strikers 1945ii`.

## NEOGEO [view more](https://bombzj.github.io/arcade-sprite-viewer/neo)
![kof97 animation](https://bombzj.github.io/arcade-sprite-viewer/res/animkof97.gif)<br/>
![kof98 animation](https://bombzj.github.io/arcade-sprite-viewer/res/animkof98.gif)<br/>
![mslug2 background](https://bombzj.github.io/arcade-sprite-viewer/res/map3mslug2.gif)<br/>
![kof2000 animation](https://bombzj.github.io/arcade-sprite-viewer/res/animkof2000.gif)<br/>

* Click [here](https://bombzj.github.io/arcade-sprite-viewer/viewer.html?kof97) to view `kof97`.

## Usage
* m key = change mode from 1 - 6 loop
* ctrl + arrow keys = change palette set to level/scene
* mode 1 (tiles)
  * arrow keys/page up/down = move tiles
  * \[ / \] change tile set
  * , / . change palette
* mode 2 (sprites)
  * arrow up/down = change set of sprites
  * arrow left/right = change sprite
* mode 3/4 (background layer)
  * arrow up/down = change level
  * arrow left/right = change scene of level
  * , / . = move map left/right
  * c show collision box (if found)
* mode 5 (player animation) unfinished
* mode 6 (animation) if any
  * arrow up/down = change set of animations
  * arrow left/right = change animation

## TODO
* webgl & wasm?
* more games
* how to know which pen/color of background layer is in front of sprites?

## Reference
* [Capcom System 1](https://patpend.net/technical/arcade/cps1.html)
* [NeoGeo Sprite graphics format](https://wiki.neogeodev.org/index.php?title=Sprite_graphics_format)
* [NeoGeo Auto Animation](https://wiki.neogeodev.org/index.php?title=Auto_animation)

## Thanks to
Project [mamedev](https://github.com/mamedev/mame)<br/>
Phil Bennett
