# Battleship game  
![intro](https://cloud.githubusercontent.com/assets/6867996/9029008/f94fe718-3982-11e5-9350-32a5b2428588.png)

## Installation & Game start

```bash
npm i battleship-game -g
battleship-game
```

> If you don't want to install this game globally you can do the following:
>
> ```
> git clone https://github.com/ricardofbarros/battleship-game.git
> cd battleship-game
> node bin/game.js
>```


## In game screens
![game2](https://cloud.githubusercontent.com/assets/6867996/9029011/08563bb8-3983-11e5-948a-9d16b547c448.png)

![game1](https://cloud.githubusercontent.com/assets/6867996/9029010/0238ae00-3983-11e5-9f67-e00c3917a017.png)

## Settings
![settings](https://cloud.githubusercontent.com/assets/6867996/9029015/0e03c1f2-3983-11e5-8ba1-0b13a12186a8.png)

### Board settings
- **Dimensions**: Configure the game board size
> Only "square" dimensions allowed, 10x10, 9x9, 8x8, etc.

- **Pretty Board**: Emojis on/off
> If your terminal doesn't support emojis you should turn this setting off.

### Units quantity
Configure how many units should be in the game.

You can easily add custom units to the game by editing this  [file](https://github.com/ricardofbarros/battleship-game/blob/master/metadata/units.json).


## Future features
- Make peer-to-peer game session
- Different Npc Levels (easy, medium, hard)
