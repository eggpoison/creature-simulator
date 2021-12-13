import { createCreature } from "./entities/Creature";
import { cells } from "./main";

const renderListeners: Array<Function> = [];

const Game = {
   hasStarted: false,
   // The number of ticks that have elapsed since the load of the web page
   tick: 0,
   // Effectively changes the number of rerenders each second. Affects everything from confetti to creatures.
   tps: 20,
   // Runs every {tps} seconds.
   runTick: function(): void {
      this.tick++;

      // Call all external render listeners
      for (const func of renderListeners) func();

      /***
      The following lines only run if the game has started 
      ***/
      if (!Game.hasStarted) return;

      // Call all entities' tick functions
      for (const cell of cells) {
         for (const entity of cell) {
            entity.tick();
         }
      }

      // Chance for a creature to spawn each second
      const CREATURE_SPAWN_CHANCE = 0.3;
      if (Math.random() <= CREATURE_SPAWN_CHANCE / this.tps) {
         createCreature();
      }
   },
   createRenderListener(func: Function): void {
      renderListeners.push(func);
   },
   removeRenderListener(func: Function): void {
      const functionIndex = renderListeners.indexOf(func);
      if (functionIndex === -1) throw new Error(`No matching function could be found! Name: ${func.name}`);
      renderListeners.push(func);
   },
   hasRenderListener(func: Function): boolean {
      const functionIndex = renderListeners.indexOf(func);
      return functionIndex >= 0;
   },
   boardSize: {
      width: 10,
      height: 10
   },
   // Size of the border between cells in px
   cellBorderSize: 2,
   // Width and height of cells in px
   cellSize: 60
};

export default Game;