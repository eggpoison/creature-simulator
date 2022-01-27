import Game from "../Game";
import GameImage from "../GameImage";
import { getOctavePerlinNoise, getPerlinNoise } from "../perlin-noise";
import { Colour, getElem, randFloat, randInt, randItem, Vector } from "../utils";
import Creature from "./Creature";

// Generate a height map and a temperature map

type NoiseType = "height" | "temperature";

export interface TileType {
   name: string;
   // A list of potential colours for the tile
   colour: Array<string>;
   fruitColour?: Array<string>;
   isLiquid: boolean;
   thumbnailFunc?: (thumbnail: HTMLCanvasElement, width: number, height: number, renderFunc: Function) => void;
   tickFunc?: (x: number, y: number) => void;
   walkFunc?: (creature: Creature) => void;
   effects?: {
      speedMultiplier?: number;
      fruitSpawnMultiplier?: number;
      /** Effects how quickly a creature's life decreases while on the tile */
      survivability?: number;
   }
}
export interface TerrainLayer {
   height?: number | [number, number];
   temperature?: number | [number, number];
   type: string;
}
export interface Terrain {
   name: string;
   noise: Array<NoiseType>;
   terrainLayers: Array<TerrainLayer>;
}
interface TerrainInfo {
   presets: ReadonlyArray<Terrain>;
   tiles: { [key: string]: TileType }
}
export const terrainInfo: TerrainInfo = {
   /**
    * Countryside: only plains biome
    * Biomes: no water
    * Archipelago: islands seperated by water
    * Hell: magma + mountain peaks, with lava instead of water
    * Russia: tundra, medium amount of water
    */
   presets: [
      {
         name: "Countryside",
         noise: ["height"],
         terrainLayers: [
            {
               height: 1,
               type: "grass"
            }
         ]
      },
      {
         name: "Biomes",
         noise: ["height", "temperature"],
         terrainLayers: [
            {
               height: 0.2,
               type: "bog"
            },
            {
               height: [0.8, 1],
               type: "mountain"
            },
            {
               temperature: 0.3,
               type: "tundra"
            },
            {
               temperature: 0.7,
               type: "grass"
            },
            {
               temperature: 1,
               type: "desert"
            },
         ]
      },
      {
         name: "Archipelago",
         noise: ["height", "temperature"],
         terrainLayers: [
            {
               height: 0.1,
               type: "deepWater"
            },
            {
               height: 0.3,
               type: "water"
            },
            {
               temperature: 0.3,
               type: "tundra"
            },
            {
               temperature: 0.7,
               type: "grass"
            },
            {
               temperature: 1,
               type: "desert"
            }
         ]
      },
      {
         name: "Hell",
         noise: ["height"],
         terrainLayers: [
            {
               height: 0.35,
               type: "lava"
            },
            {
               height: 0.8,
               type: "magma"
            },
            {
               height: 1,
               type: "mountain"
            }
         ]
      },
      {
         name: "Russia",
         noise: ["height"],
         terrainLayers: [
            {
               height: 0.1,
               type: "deepWater"
            },
            {
               height: 0.3,
               type: "water"
            },
            {
               height: 0.7,
               type: "tundra"
            },
            {
               height: 1,
               type: "mountain"
            }
         ]
      },
      {
         name: "Swamp",
         noise: ["height"],
         terrainLayers: [
            {
               height: 0.3,
               type: "deepWater"
            },
            {
               height: 0.4,
               type: "water"
            },
            {
               height: 1,
               type: "bog"
            }
         ]
      },
      {
         name: "Vomit",
         noise: ["height"],
         terrainLayers: [
            {
               height: 0.2,
               type: "grass"
            },
            {
               height: 0.3,
               type: "tundra"
            },
            {
               height: 0.4,
               type: "mountain"
            },
            {
               height: 0.5,
               type: "desert"
            },
            {
               height: 0.6,
               type: "magma"
            },
            {
               height: 0.7,
               type: "bog"
            },
            {
               height: 0.8,
               type: "water"
            },
            {
               height: 0.9,
               type: "deepWater"
            },
            {
               height: 1,
               type: "lava"
            },
         ]
      }
   ],
   tiles: {
      grass: {
         name: "Grass",
         colour: ["#23ee2d"],
         fruitColour: ["#009124"],
         isLiquid: false
      },
      tundra: {
         name: "Tundra",
         colour: ["#b8c6db"],
         fruitColour: ["#0066ff"],
         isLiquid: false
      },
      mountain: {
         name: "Mountain",
         colour: ["#fff"],
         fruitColour: ["#cf13bf"],
         isLiquid: false
      },
      desert: {
         name: "Desert",
         colour: ["yellow"],
         fruitColour: ["#666"],
         isLiquid: false
      },
      magma: {
         name: "Magma",
         colour: ["orange"],
         fruitColour: ["red"],
         isLiquid: false
      },
      bog: {
         name: "Bog",
         colour: ["#46911a", "#509121", "#457819"],
         fruitColour: ["#2d3d20", "#000"],
         isLiquid: false
      },
      water: {
         name: "Water",
         colour: ["blue"],
         isLiquid: true
      },
      deepWater: {
         name: "Deep water",
         colour: ["darkblue"],
         isLiquid: true
      },
      lava: {
         name: "Lava",
         colour: ["red"],
         isLiquid: true,
         thumbnailFunc: (thumbnail: HTMLCanvasElement, width: number, height: number, renderFunc: Function): void => {
            if (thumbnail.offsetParent === null || !thumbnail.classList.contains("lava")) {
               Game.removeRenderListener(renderFunc);
               return;
            }

            const thumbnailPos = thumbnail.getBoundingClientRect();
            const thumbnailX = thumbnailPos.x;
            const thumbnailY = thumbnailPos.y;

            const createSmoke = () => {
               const size = randInt(10, 20, true);
               const x = thumbnailX + size/2 + randFloat(0, width - size/2);
               const y = thumbnailY + size/2 + randFloat(0, height - size/2);
               const pos = new Vector(x, y);

               const smoke = new GameImage("smoke", 5, 3, size, size, pos).element;
               smoke.style.zIndex = "4";
               document.body.appendChild(smoke);
               
               const brightness = randFloat(0.6, 1);
               smoke.style.filter = `brightness(${brightness})`;
            }

            if (Math.random() < 0.05) {
               const smokeAmount = randInt(1, 5, true);
               for (let i = 0; i < smokeAmount; i++) {
                  createSmoke();
               }
            } else if (Math.random() < 0.2) {
               createSmoke();
            }
         },
         tickFunc: (x: number, y: number) => {
            const createSmoke = (size: number, brightness: number): void => {
               const pos = new Vector(x * Game.cellSize + randFloat(0, Game.cellSize), y * Game.cellSize + randFloat(0, Game.cellSize));
               const smoke = new GameImage("smoke", 5, 2, size, size, pos).element;
   
               smoke.style.filter = `brightness(${brightness})`;
            }

            // small smoke
            createSmoke(randInt(16, 25, true), randFloat(0.5, 1));

            // Big smoke
            if (Math.random() < 0.02) {
               const amount = randInt(3, 5);
               for (let i = 0; i < amount; i++) {
                  const size = randInt(25, 40, true);
                  createSmoke(size, 1);
               }
            }
         },
         walkFunc: (creature: Creature) => {
            // Harm creature once a second
            if ((Game.ticks + creature.seed) % Game.tps === 0) {
               // Remove 10% of health
               creature.damage(creature.lifespan / 10);

               // Create smoke
               const smokeAmount = randInt(2, 5, true);
               const o = 30;
               for (let i = 0; i < smokeAmount; i++) {
                  const size = randInt(20, 35, true);
                  const pos = creature.position.randomOffset(o);
                  const ticksPerFrame = randInt(3, 5, true);
                  const smoke = new GameImage("smoke", 5, ticksPerFrame, size, size, pos);

                  const brightness = randInt(5, 10, true) / 10;
                  smoke.element.style.filter = `brightness(${brightness})`;
               }
            }
         }
      }
   }
}

export class BoardGenerator {
   private width: number;
   private height: number;
   private readonly tileSize: number;
   private readonly canvas: HTMLCanvasElement;
   tiles!: Array<Array<TileType>>;

   constructor(width: number, height: number, tileSize: number) {
      this.width = width;
      this.height = height;
      this.tileSize = tileSize;
      this.canvas = this.instantiate();
   }

   private instantiate(): HTMLCanvasElement {
      const canvas = document.createElement("canvas");
      canvas.setAttribute("width", this.width * this.tileSize + "px");
      canvas.setAttribute("height", this.height * this.tileSize + "px");
      
      getElem("board-preview-container").appendChild(canvas);

      return canvas;
   }

   changeSize(newWidth: number, newHeight: number, showChanges: boolean) {
      this.width = newWidth;
      this.height = newHeight;

      if (showChanges) {
         this.canvas.setAttribute("width", this.width * this.tileSize + "px");
         this.canvas.setAttribute("height", this.height * this.tileSize + "px");
      }
   }

   getTiles(): Array<Array<TileType>> {
      return this.tiles;
   }

   private getTileType(terrain: Terrain, height: number | null, temperature: number | null): TileType {
      const testLevel = (type: "height" | "temperature", val: number, terrainType: TerrainLayer): boolean => {
         if (typeof terrainType[type] === "number") {
            // number
            if (val > terrainType[type]!) return false;
         } else if (Array.isArray(terrainType[type])) {
            const limitArr = terrainType[type] as [number, number];
            // [number, number]
            if (val < limitArr[0] || val > limitArr[1]) return false;
         }
         return true;
      }

      for (const terrainType of terrain.terrainLayers) {
         const heightCheck = height !== null ? testLevel("height", height, terrainType) : true;
         const temperatureCheck = temperature !== null ? testLevel("temperature", temperature, terrainType) : true;
         
         if (heightCheck && temperatureCheck) return terrainInfo.tiles[terrainType.type];
      }

      console.log("Height:", height, "Temperature:", temperature);
      console.log("Terrain layers:", terrain.terrainLayers);
      throw new Error(`Unable to find an appropriate tile type!`);
   }

   generateNoise(terrain: Terrain, scale: number, showChanges: boolean): void {
      // Reset tiles
      this.tiles = new Array<Array<TileType>>();
      for (let y = 0; y < this.height; y++) {
         this.tiles[y] = new Array<TileType>(this.width);
      }

      const noise: { [key: string]: Array<Array<number>> } = {};
      for (const noiseType of terrain.noise) {
         if (noiseType === "height") {
            noise.height = getPerlinNoise(this.width, this.height, scale);
         } else if (noiseType === "temperature") {
            noise.temperature = getPerlinNoise(this.width, this.height, scale);
         }
      }

      if (showChanges) {
         this.clearCanvas();

         const ctx = this.canvas.getContext("2d")!;
         for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
               const height = noise.height ? noise.height[y][x] + 0.5 : null;
               const temperature = noise.temperature ? noise.temperature[y][x] + 0.5 : null;
               const tileType = this.getTileType(terrain, height, temperature);
               this.tiles[y][x] = tileType;
   
               const colour = randItem(tileType.colour) as string;
               
               ctx.beginPath();
               ctx.fillStyle = colour;
               ctx.rect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
               ctx.fill();
            }
         }
   
         this.drawGridLines();
      } else {
         for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
               const height = noise.height ? noise.height[y][x] + 0.5 : null;
               const temperature = noise.temperature ? noise.temperature[y][x] + 0.5 : null;
               const tileType = this.getTileType(terrain, height, temperature);
               this.tiles[y][x] = tileType;
            }
         }
      }  
   }

   generateTestOctaveNoise(scale: number, octaves: number, lacunarity: number, persistance: number): void {
      const noise = getOctavePerlinNoise(this.width, this.height, scale, octaves, lacunarity, persistance);
      this.drawTestNoise(noise);
   }

   generateTestNoise(scale: number): void {
      const noise = getPerlinNoise(this.width, this.height, scale);
      this.drawTestNoise(noise);
   }

   private drawTestNoise(noise: Array<Array<number>>): void {
      this.clearCanvas();

      const ctx = this.canvas.getContext("2d")!;
      for (let y = 0; y < this.height; y++) {
         for (let x = 0; x < this.width; x++) {
            const weight = noise[y][x];
            
            ctx.beginPath();
            const colour = "#" + Colour.grayscale(weight + 0.5);
            ctx.fillStyle = colour;
            ctx.rect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            ctx.fill();
         }
      }
   }

   private drawGridLines(): void {
      const ctx = this.canvas.getContext("2d")!;

      for (let y = 1; y < this.height; y++) {
         ctx.moveTo(0, y * this.tileSize);
         ctx.lineTo(this.width * this.tileSize, y * this.tileSize);
      }

      for (let x = 1; x < this.width; x++) {
         ctx.moveTo(x * this.tileSize, 0);
         ctx.lineTo(x * this.tileSize, this.height * this.tileSize);
      }

      ctx.strokeStyle = "#000";
      ctx.stroke();
   }

   private clearCanvas(): void {
      const ctx = this.canvas.getContext("2d")!;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
   }
}