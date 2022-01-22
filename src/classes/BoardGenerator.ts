import { getOctavePerlinNoise, getPerlinNoise } from "../perlin-noise";
import { Colour, getElem } from "../utils";

// Generate a height map and a temperature map

type NoiseType = "height" | "temperature";

export interface TileType {
   name: string;
   colour: string;
   fruitColour?: string;
   isLiquid: boolean;
}
interface TerrainType {
   height?: number | [number, number];
   temperature?: number | [number, number];
   type: string;
}
export interface Terrain {
   name: string;
   noise: Array<NoiseType>;
   terrainTypes: ReadonlyArray<TerrainType>;
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
         terrainTypes: [
            {
               height: 1,
               type: "grass"
            }
         ]
      },
      {
         name: "Biomes",
         noise: ["height", "temperature"],
         terrainTypes: [
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
         terrainTypes: [
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
         terrainTypes: [
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
         terrainTypes: [
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
         name: "???",
         noise: ["height"],
         terrainTypes: [
            {
               height: 0.3,
               type: "grass"
            },
            {
               height: 0.4,
               type: "tundra"
            },
            {
               height: 0.5,
               type: "mountain"
            },
            {
               height: 0.6,
               type: "desert"
            },
            {
               height: 0.7,
               type: "magma"
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
         colour: "#23ee2d",
         fruitColour: "#00c431",
         isLiquid: false
      },
      tundra: {
         name: "Tundra",
         colour: "#b8c6db",
         fruitColour: "#0066ff",
         isLiquid: false
      },
      mountain: {
         name: "Mountain",
         colour: "#fff",
         fruitColour: "#cf13bf",
         isLiquid: false
      },
      desert: {
         name: "Desert",
         colour: "yellow",
         fruitColour: "#666",
         isLiquid: false
      },
      magma: {
         name: "Magma",
         colour: "orange",
         fruitColour: "red",
         isLiquid: false
      },
      water: {
         name: "Water",
         colour: "blue",
         isLiquid: true
      },
      deepWater: {
         name: "Deep water",
         colour: "darkblue",
         isLiquid: true
      },
      lava: {
         name: "Lava",
         colour: "red",
         isLiquid: true
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

   changeSize(newWidth: number, newHeight: number) {
      this.width = newWidth;
      this.height = newHeight;

      this.canvas.setAttribute("width", this.width * this.tileSize + "px");
      this.canvas.setAttribute("height", this.height * this.tileSize + "px");
   }

   getTiles(): Array<Array<TileType>> {
      return this.tiles;
   }

   private getTileType(terrain: Terrain, height: number | null, temperature: number | null): TileType {
      let tileType: TileType;
      for (const terrainType of terrain.terrainTypes) {
         if (terrainType.height) {
            if (typeof terrainType.height === "number") {
               if (height! <= terrainType.height) return terrainInfo.tiles[terrainType.type];
            } else if (Array.isArray(terrainType.height)) {
               if (height! >= terrainType.height[0] && height! <= terrainType.height[1]) return terrainInfo.tiles[terrainType.type];
            }
         } else if (terrainType.temperature) {
            if (typeof terrainType.temperature === "number") {
               if (temperature! <= terrainType.temperature) return terrainInfo.tiles[terrainType.type];
            } else if (Array.isArray(terrainType.height)) {
               if (temperature! >= terrainType.temperature[0] && temperature! <= terrainType.temperature[1]) return terrainInfo.tiles[terrainType.type];
            }
         }
      }
      return tileType!;
   }

   generateNoise(terrain: Terrain): void {
      // Reset tiles
      this.tiles = new Array<Array<TileType>>();
      for (let y = 0; y < this.height; y++) {
         this.tiles[y] = new Array<TileType>(this.width);
      }

      const scale = 5;

      const noise: { [key: string]: Array<Array<number>> } = {};
      for (const noiseType of terrain.noise) {
         if (noiseType === "height") {
            noise.height = getPerlinNoise(this.width, this.height, scale);
         } else if (noiseType === "temperature") {
            noise.temperature = getPerlinNoise(this.width, this.height, scale);
         }
      }

      this.clearCanvas();

      const ctx = this.canvas.getContext("2d")!;
      for (let y = 0; y < this.height; y++) {
         for (let x = 0; x < this.width; x++) {
            const height = noise.height ? noise.height[y][x] + 0.5 : null;
            const temperature = noise.temperature ? noise.temperature[y][x] + 0.5 : null;
            const tileType = this.getTileType(terrain, height, temperature);
            this.tiles[y][x] = tileType;

            // console.log(terrain, height, temperature);
            const colour = tileType.colour;
            
            ctx.beginPath();
            ctx.fillStyle = colour;
            ctx.rect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            ctx.fill();
         }
      }

      this.drawGridLines();
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