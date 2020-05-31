# arcade-sprite-viewer
An arcade game sprite / map viewer (cps1 neogeo ...)

![punisher animation](https://raw.githubusercontent.com/bombzj/arcade-sprite-viewer/master/res/punisheranim.gif)<br/>
![punisher animation](https://raw.githubusercontent.com/bombzj/arcade-sprite-viewer/master/res/punishermap.png)<br/>

Click [here](https://bombzj.github.io/arcade-sprite-viewer/) to open viewer.

## control
* m = change mode from 1 - 6 loop
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
* neogeo
* webgl & wasm?
* more games

## Thanks to
Project [mamedev](https://github.com/mamedev/mame)<br/>
Phil Bennett
