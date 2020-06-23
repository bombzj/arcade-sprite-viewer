# arcade-sprite-viewer
An arcade game sprite / map viewer (cps1 neogeo ...)

## CPS [view more](https://github.com/bombzj/arcade-sprite-viewer/tree/master/cps)
![punisher animation](https://raw.githubusercontent.com/bombzj/arcade-sprite-viewer/master/res/punisheranim.gif)<br/>
![dino animation](https://raw.githubusercontent.com/bombzj/arcade-sprite-viewer/master/res/animdino.gif)<br/>

* Click [here](https://bombzj.github.io/arcade-sprite-viewer/viewer.html?punisher) to view `punisher`.

## PSIKYOSH [view more](https://github.com/bombzj/arcade-sprite-viewer/tree/master/psi)
![1945ii animation](https://raw.githubusercontent.com/bombzj/arcade-sprite-viewer/master/res/anim1945ii.gif)<br/>
![gunbird2 background](https://raw.githubusercontent.com/bombzj/arcade-sprite-viewer/master/res/mapgunbird2.png)<br/>

* Click [here](https://bombzj.github.io/arcade-sprite-viewer/viewer.html?1945ii) to view `strikers 1945ii`.

## NEOGEO [view more](https://github.com/bombzj/arcade-sprite-viewer/tree/master/neo)
![kof97 animation](https://raw.githubusercontent.com/bombzj/arcade-sprite-viewer/master/res/animkof97.gif)<br/>
![kof98 animation](https://raw.githubusercontent.com/bombzj/arcade-sprite-viewer/master/res/animkof98.gif)<br/>
![mslug2 background](https://raw.githubusercontent.com/bombzj/arcade-sprite-viewer/master/res/map3mslug2.gif)<br/>
![kof2000 animation](https://raw.githubusercontent.com/bombzj/arcade-sprite-viewer/master/res/animkof2000.gif)<br/>

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
* more games, wof?
* how to know which pen/color of background layer is in front of sprites?

## Reference
* [Capcom System 1](https://patpend.net/technical/arcade/cps1.html)
* [NeoGeo Sprite graphics format](https://wiki.neogeodev.org/index.php?title=Sprite_graphics_format)
* [NeoGeo Auto Animation](https://wiki.neogeodev.org/index.php?title=Auto_animation)

## Thanks to
Project [mamedev](https://github.com/mamedev/mame)<br/>
Phil Bennett
