import { getOctavePerlinNoise, getPerlinNoise } from "../perlin-noise";
import { Colour, getElem } from "../utils";

interface TileType {
   name: string;
}

const tileTypes: { [key: string]: TileType } = {
   plains: {
      name: "Plains"
   },
   tundra: {
      name: "Tundra"
   },
   mountains: {
      name: "Mountains"
   },
   desert: {
      name: "Desert"
   },
   magma: {
      name: "Magma"
   },
   water: {
      name: "Water"
   },
   deepWater: {
      name: "Deep water"
   },
   lava: {
      name: "Lava"
   }
};


/**
 * Biomes: no water
 * Archipelago: islands seperated by water
 * Hell: magma + mountain peaks, with lava instead of water
 * Russia: tundra, medium amount of water
 */
type boardType = "biomes" | "archipelago" | "hell" | "russia";

// Generate a height map and a temperature map

export class BoardGenerator {
   // private width: number;
   // private height: number;
   tileSize: number;
   canvas: HTMLCanvasElement;

   constructor(tileSize: number) {
      // this.width = width;
      // this.height = height;
      this.tileSize = tileSize;
      this.canvas = this.instantiate();
   }

   private instantiate(): HTMLCanvasElement {
      const canvas = document.createElement("canvas");
      // canvas.style.width = this.width + "px";
      // canvas.style.height = this.height + "px";
      
      getElem("board-preview-container").appendChild(canvas);

      return canvas;
   }

   drawOctaveNoise(width: number, height: number, scale: number, octaves: number, lacunarity: number, persistance: number): void {
      const noise = getOctavePerlinNoise(width, height, scale, octaves, lacunarity, persistance);
      this.draw(noise, width, height);
   }

   drawNoise(width: number, height: number, scale: number): void {
      // const noise = getPerlinNoise(width, height, scale);
      const noise = getPerlinNoise(width, height, scale);
      this.draw(noise, width, height);
   }

   private draw(noise: Array<Array<number>>, width: number, height: number): void {
      this.canvas.setAttribute("width", width * this.tileSize + "px");
      this.canvas.setAttribute("height", height * this.tileSize + "px");

      this.clearCanvas();

      const ctx = this.canvas.getContext("2d")!;
      for (let y = 0; y < height; y++) {
         for (let x = 0; x < width; x++) {
            const weight = noise[y][x];
            
            ctx.beginPath();
            const colour = "#" + Colour.grayscale(weight + 0.5);
            ctx.fillStyle = colour;
            ctx.rect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            ctx.fill();
         }
      }
   }

   private clearCanvas(): void {
      const ctx = this.canvas.getContext("2d")!;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
   }
}