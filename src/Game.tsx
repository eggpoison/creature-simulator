import Fruit, { createFruit } from "./classes/Fruit";
import { cells } from "./main";
import { gameImages } from "./GameImage";
import { updateMouse } from "./Mouse";
import { inspectorIsOpen, rerenderInspector } from "./creature-inspector";
import { updateControlPanel } from "./components/ControlPanel";
import Creature, { creatureGeneInfo } from "./classes/Creature";
import Entity from "./classes/Entity";
import { Vector } from "./utils";
import { drawGraphs, graphSettingData } from "./graph-viewer";

const renderListeners: Array<Function> = [];

export const geneSamples: Array<GeneSample> = new Array<GeneSample>();

interface GenePool {
   [key: keyof typeof creatureGeneInfo]: number | null;
}
interface GeneSample {
   [key: string]: any;
   creatures: number | null;
   fruit: number | null;
   genePool: GenePool
}

const sampleGenes = (creatures: Array<Creature>) => {
   let genePool: GenePool = {};
   for (const geneName of Object.keys(creatureGeneInfo)) {
      genePool[geneName] = 0;
   }

   for (const creature of creatures) {
      for (const geneName of Object.keys(creatureGeneInfo)) {
         if (!genePool.hasOwnProperty(geneName)) {
            genePool[geneName] = creature[geneName];
         } else {
            genePool[geneName] += creature[geneName];
         }
      }
   }
   for (const [ geneName, gene ] of Object.entries(genePool)) {
      genePool[geneName]! /= creatures.length;
      if (gene === 0) genePool[geneName] = null;
   }

   let creatureCount: number | null = Entity.count(Creature);
   if (creatureCount === 0) creatureCount = null;
   let fruitCount: number | null = Entity.count(Fruit);
   if (fruitCount === 0) fruitCount = null;

   geneSamples.push({
      creatures: creatureCount,
      fruit: fruitCount,
      genePool: genePool
   });

   if (graphSettingData[1].isChecked) {
      drawGraphs();
   }
};

interface GameType {
   hasStarted: boolean;
   isPaused: boolean;
   ticks: number;
   readonly tps: number;
   timewarp: number;
   runTick: Function;
   createRenderListener: Function;
   removeRenderListener: Function;
   hasRenderListener: Function;
   boardSize: {
      width: number;
      height: number;
   },
   transform: {
      zoom: number;
      translate: Vector;
   },
   readonly cellBorderSize: number;
   readonly cellSize: number;
   settings: GameSettings;
}
export interface GameSettings {
   fruitSpawnRate: number;
   creatureMutationRate: number;
}

export const defaultGameSettings: GameSettings = {
   fruitSpawnRate: 1,
   creatureMutationRate: 1
}
const Game: GameType = {
   hasStarted: false,
   isPaused: false,
   // The number of ticks that have elapsed since the load of the web page
   ticks: 0,
   // Effectively changes the number of rerenders each second. Affects everything from confetti to creatures.
   tps: 20,
   timewarp: 1,
   // Runs every {tps} seconds.
   runTick: function(): void {
      if (this.isPaused) {
         setTimeout(() => this.runTick(), 1000 / this.tps / this.timewarp);
         return;
      }

      // Call all external render listeners
      for (const func of renderListeners) func();

      if (this.hasStarted) {
         this.ticks++;

         // Remove all rays
         document.querySelectorAll(".ray").forEach(ray => ray.remove());

         let creatures = new Array<Creature>();
   
         // Call all entities' tick functions
         for (const cell of cells) {
            for (const entity of cell) {
               if (entity instanceof Creature) creatures.push(entity);
               entity.tick();
            }
         }
   
         for (const gameImage of gameImages) gameImage.tick();
   
         // Number of fruits which spawn in a cell each second
         const FRUIT_SPAWN_RATE = 0.05 * this.settings.fruitSpawnRate;
         for (let cellNumber = 0; cellNumber < cells.length; cellNumber++) {
            const rand = Math.random();
            for (let i = 0; rand <= FRUIT_SPAWN_RATE / this.tps - i; i++) {
               createFruit(cellNumber);
            }
         }
   
         updateControlPanel();
         updateMouse();
   
         if (inspectorIsOpen) rerenderInspector();

         // Seconds between gene samples
         const GENE_SAMPLE_INTERVAL = 1;
         if (this.ticks / this.tps % GENE_SAMPLE_INTERVAL === 0) {
            sampleGenes(creatures);
         }
      }

      setTimeout(() => this.runTick(), 1000 / this.tps / this.timewarp);
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
   transform: {
      zoom: 1,
      translate: new Vector(0, 0)
   },
   // Size of the border between cells in px
   cellBorderSize: 2,
   // Width and height of cells in px
   cellSize: 60,
   settings: defaultGameSettings
};

export default Game;