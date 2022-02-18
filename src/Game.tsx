import Fruit, { createFruit } from "./classes/Fruit";
import { gameImages } from "./classes/GameImage";
import { inspectorIsOpen, rerenderInspector } from "./creature-inspector";
import { updateControlPanel } from "./components/ControlPanel";
import Creature, { createCreature, creatureGeneInfo } from "./classes/Creature";
import { getElem, roundNum, standardDeviation, Vector } from "./utils";
import { drawGraphs, graphSettingData } from "./graph-viewer";
import { updateTransform } from "./keyboard";
import Entity from "./classes/Entity";
import { Board } from "./classes/Board";

const renderListeners: Array<Function> = [];

export const geneSamples: Array<GeneSample> = new Array<GeneSample>();

export interface GeneSampleEntry {
   average: number;
   min: number;
   max: number;
   standardDeviation: number;
}
interface GenePool {
   [key: keyof typeof creatureGeneInfo]: GeneSampleEntry;
}
interface GeneSample {
   [key: string]: any;
   creatures: number | null;
   fruit: number | null;
   fruitMultiplier: number;
   genePool: GenePool | null;
}

const sampleGenes = (creatures: ReadonlyArray<Creature>, fruit: ReadonlyArray<Fruit>) => {
   let genePool: GenePool | null = {};
   if (creatures.length === 0) {
      genePool = null;
   } else {
      let allGenes: { [ key: keyof typeof creatureGeneInfo ]: Array<number> } = {};
      for (const geneName of Object.keys(creatureGeneInfo)) {
         allGenes[geneName] = new Array<number>();
      }
      
      for (const creature of creatures) {
         for (const geneName of Object.keys(allGenes)) {
            allGenes[geneName].push(creature[geneName]);
         }
      }
      
      for (const geneName of Object.keys(creatureGeneInfo)) {
         const geneVals = allGenes[geneName];
         
         const n = geneVals.length;
         let minVal = Number.MAX_SAFE_INTEGER;
         let maxVal = 0;
         let average = 0;
         for (let i = 0; i < n; i++) {
            const val = geneVals[i];
            if (val < minVal) minVal = val;
            if (val > maxVal) maxVal = val;
            average += val;
         }
         average /= n;
         
         genePool[geneName] = {
            average: average,
            min: minVal,
            max: maxVal,
            standardDeviation: standardDeviation(geneVals)
         };
      }
   }

   let creatureCount: number | null = Entity.count(Creature);
   // let creatureCount: number | null = creatures.length;
   if (creatureCount === 0) creatureCount = null;
   const fruitCount: number | null = Entity.count(Fruit);
   // const fruitCount: number | null = fruit.length;
   geneSamples.push({
      creatures: creatureCount,
      fruit: fruitCount,
      fruitMultiplier: Game.fruitMultiplier,
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
   fruitMultiplier: number;
   previousTime: number;
   previousTicks: number;
   runTick: Function;
   start: Function;
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
   readonly cellSize: number;
   settings: GameSettings;
   board: Board;
}
export interface GameSettings {
   fruitSpawnRate: number;
   creatureMutationRate: number;
   eggIncubationTime: number;
   initialCreatures: number;
   initialFruit: number;
   equilibrium: number;
   tilePreference: number;
   creatureColour: string;
   showDebugOutput: boolean;
}
export const defaultGameSettings: GameSettings = {
   fruitSpawnRate: 1,
   creatureMutationRate: 1,
   eggIncubationTime: 5,
   initialCreatures: 10,
   initialFruit: 50,
   equilibrium: 20,
   tilePreference: 0.2,
   creatureColour: "regular",
   showDebugOutput: false
}

const Game: GameType = {
   hasStarted: false,
   isPaused: false,
   // The number of ticks that have elapsed since the load of the web page
   ticks: 0,
   // Effectively changes the number of rerenders each second. Affects everything from confetti to creatures.
   tps: 20,
   timewarp: 1,
   fruitMultiplier: 1,
   previousTime: Date.now(),
   previousTicks: 0,
   // Runs every {tps} seconds.
   runTick: async function(): Promise<void> {
      if (this.isPaused) {
         setTimeout(() => this.runTick(), 1000 / this.tps / this.timewarp);
         return;
      }

      this.previousTicks++;

      // Call all external render listeners
      for (const func of renderListeners) func();

      for (const gameImage of gameImages) gameImage.tick();
      
      if (this.hasStarted) {
         this.ticks++;

         this.board.tick();

         // Remove all rays
         document.querySelectorAll(".ray").forEach(ray => ray.remove());

         /** Seconds between samples of the population + genes */
         const SAMPLE_INTERVAL = 5;
         if (this.ticks % (SAMPLE_INTERVAL * this.tps) === 0) {
            const entities = await Game.board.census();

            const creatureCount = entities.creatures.length;
            if (creatureCount === 0) {
               this.fruitMultiplier = 1;
            } else {
               this.fruitMultiplier = this.settings.equilibrium / creatureCount;
            }

            const fruitDensity = entities.fruit.length / this.board.landTileIndexes.length;
            const MAX_FRUIT_DENSITY = 10;
            if (fruitDensity > MAX_FRUIT_DENSITY) {
               console.log("MAX!");
            }

            sampleGenes(entities.creatures, entities.fruit);
         }

         // Number of fruits which spawn in a cell each second
         const FRUIT_SPAWN_RATE = 0.05 * this.settings.fruitSpawnRate * this.fruitMultiplier;
         for (let i = 0; i < this.board.landTileIndexes.length; i++) {
            const cellNumber = this.board.landTileIndexes[i];
            const rand = Math.random();
            for (let i = 0; rand <= FRUIT_SPAWN_RATE / this.tps - i; i++) {
               createFruit(cellNumber);
            }
         }
   
         updateControlPanel();
   
         if (inspectorIsOpen) rerenderInspector();
      }

      const time = Date.now();
      const dt = time - this.previousTime;
      if (time - this.previousTime >= 1000) {
         if (this.settings.showDebugOutput) console.log(this.previousTicks + " ticks (" + roundNum(this.previousTicks / this.tps, 1) + " seconds(s)) in " + dt + "ms");
         this.previousTicks = 0;
         this.previousTime = time;
      }

      setTimeout(() => this.runTick(), 1000 / this.tps / this.timewarp);
   },
   start(): void {
      getElem("title-options-container").classList.add("hidden");

      // Create the board object
      this.board = new Board(this.boardSize.width, this.boardSize.height, this.cellSize);

      this.hasStarted = true;

      this.transform.zoom = 25 / Math.pow(this.boardSize.width + this.boardSize.height, 1.1);
      updateTransform();
   
      for (let i = 0; i < this.settings.initialCreatures; i++) {
         createCreature();
      }
      for (let i = 0; i < this.settings.initialFruit; i++) {
         createFruit();
      }
   },
   createRenderListener(func: Function): void {
      renderListeners.push(func);
   },
   removeRenderListener(func: Function): void {
      const functionIndex = renderListeners.indexOf(func);
      if (functionIndex === -1) throw new Error(`No matching function could be found! Name: ${func.name}`);
      renderListeners.splice(functionIndex, 1);
   },
   hasRenderListener(func: Function): boolean {
      const functionIndex = renderListeners.indexOf(func);
      return functionIndex >= 0;
   },
   boardSize: {
      width: 15,
      height: 15
   },
   transform: {
      zoom: 1,
      translate: new Vector(0, 0)
   },
   // Width and height of cells in px
   cellSize: 60,
   settings: defaultGameSettings,
   board: null as unknown as Board
};

export default Game;