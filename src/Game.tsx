import Fruit, { createFruit } from "./classes/Fruit";
import { gameImages } from "./GameImage";
import { updateMouse } from "./Mouse";
import { inspectorIsOpen, rerenderInspector } from "./creature-inspector";
import { updateControlPanel } from "./components/ControlPanel";
import Creature, { createCreature, creatureGeneInfo } from "./classes/Creature";
import { standardDeviation, Vector } from "./utils";
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
   genePool: GenePool | null;
   fruitMultiplier: number;
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
      genePool: genePool,
      fruitMultiplier: Game.fruitMultiplier
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
   readonly cellBorderSize: number;
   readonly cellSize: number;
   settings: GameSettings;
   board: Board;
}
export interface GameSettings {
   fruitSpawnRate: number;
   creatureMutationRate: number;
   initialCreatures: number;
   initialFruit: number;
   equilibrium: number;
   showDebugOutput: boolean;
}
export const defaultGameSettings: GameSettings = {
   fruitSpawnRate: 1,
   creatureMutationRate: 1,
   initialCreatures: 0,
   initialFruit: 50,
   equilibrium: 20,
   showDebugOutput: false
}

interface Entities {
   creatures: Array<Creature>;
   fruit: Array<Fruit>;
}
const updateEntities = (): Promise<Entities> => {
   return new Promise(resolve => {
      let creatures: Array<Creature> = new Array<Creature>();
      let fruit: Array<Fruit> = new Array<Fruit>();
   
      for (const cell of Game.board.cells) {
         for (const entity of cell) {
            if (entity instanceof Creature) creatures.push(entity);
            else if (entity instanceof Fruit) fruit.push(entity);
            entity.tick();
         }
      }

      const entities = {
         creatures: creatures,
         fruit: fruit
      };
      resolve(entities);
   });
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

         // Remove all rays
         document.querySelectorAll(".ray").forEach(ray => ray.remove());

         const entities = await updateEntities();

         const creatureCount = entities.creatures.length;
         if (creatureCount === 0) {
            this.fruitMultiplier = 1;
         } else {
            this.fruitMultiplier = this.settings.equilibrium / creatureCount;
         }
   
         // Number of fruits which spawn in a cell each second
         const FRUIT_SPAWN_RATE = 0.05 * this.settings.fruitSpawnRate * this.fruitMultiplier;
         for (let cellNumber = 0; cellNumber < this.boardSize.width * this.boardSize.height; cellNumber++) {
            const rand = Math.random();
            for (let i = 0; rand <= FRUIT_SPAWN_RATE / this.tps - i; i++) {
               createFruit(cellNumber);
            }
         }
   
         updateControlPanel();
         updateMouse();
   
         if (inspectorIsOpen) rerenderInspector();

         // Seconds between gene samples
         const GENE_SAMPLE_INTERVAL = 10;
         if (this.ticks / this.tps % GENE_SAMPLE_INTERVAL === 0) {
            sampleGenes(entities.creatures, entities.fruit);
         }
      }

      const time = Date.now();
      const dt = time - this.previousTime;
      if (time - this.previousTime >= 1000) {
         if (this.settings.showDebugOutput) console.log(this.previousTicks + " ticks in " + dt + "ms");
         this.previousTicks = 0;
         this.previousTime = time;
      }

      setTimeout(() => this.runTick(), 1000 / this.tps / this.timewarp);
   },
   start(): void {
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
      renderListeners.push(func);
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
   // Size of the border between cells in px
   cellBorderSize: 2,
   // Width and height of cells in px
   cellSize: 60,
   settings: defaultGameSettings,
   board: null as unknown as Board
};

export default Game;