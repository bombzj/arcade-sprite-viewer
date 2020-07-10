# arcade-sprite-viewer
An arcade game sprite viewer / background image viewer with hitbox data (cps1 neogeo etc.)
* Images are assembled by putting together serials of tiles that extracted from rom data. Currently it only supports a few games, Metal Slug, King of Fighters, Punisher, Dinosaur & Cadillacs, Gunbird, Warth, etc.
BTW. CPS & NEOGEO both use 68k but PSIKYOSH uses SH-2 which is far more difficult to read.
* Click [here](https://github.com/bombzj/arcade-sprite-viewer) to view source code.

## NEOGEO [view more games](https://asv.bombzj.com/neo/)
![kof97 animation](https://asv.bombzj.com/res/animkof97.gif)
![kof98 animation](https://asv.bombzj.com/res/animkof98.gif)
![kof2000 animation](https://asv.bombzj.com/res/animkof2000.gif)<br/>
![kof98 background](https://asv.bombzj.com/res/bgkof98.gif)<br/>
![mslug2 background](https://asv.bombzj.com/res/map3mslug2.gif)<br/>

* Click [here](https://asv.bombzj.com/viewer.html?kof97) to view `King of Fighters 97`.

## CPS [view more games](https://asv.bombzj.com/cps/)
![punisher animation](https://asv.bombzj.com/res/punisheranim.gif)
![dino animation](https://asv.bombzj.com/res/animdino.gif)<br/>
![captcomm background](https://asv.bombzj.com/res/mapcapt.png)<br/>

* Click [here](https://asv.bombzj.com/viewer.html?punisher) to view `Punisher`.

## PSIKYOSH [view more games](https://asv.bombzj.com/psi/)
![1945ii animation](https://asv.bombzj.com/res/anim1945ii.gif)
![gunbird2 animation](https://asv.bombzj.com/res/animgunbird2.gif)<br/>
![gunbird2 background](https://asv.bombzj.com/res/mapgunbird2.png)<br/>

* Click [here](https://asv.bombzj.com/viewer.html?1945ii) to view `Strikers 1945ii`.

* [Full Game List](https://asv.bombzj.com/list.html)

## Usage
* m key = change mode from 1 - 6 loop
* ctrl + arrow keys = change palette set to level/scene
* mode 1 (tiles)
  * arrow keys/page up/down = move tiles
  * \[ / \] key = change tile set
  * , / . key = change palette
* mode 2 (sprites)
  * arrow up/down = change set of sprites
  * arrow left/right = change sprite
* mode 3/4 (background layer)
  * arrow up/down = change level
  * arrow left/right = change scene of level
  * , / . key = move map left/right
  * c key = show hitbox / collision box (if found)
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
