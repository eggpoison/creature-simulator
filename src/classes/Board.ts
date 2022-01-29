import { getTiles } from "../components/TerrainGenerator";
import Game from "../Game";
import { clamp, getElem, randFloat, randInt, randItem, Vector } from "../utils";
import { TileType } from "./BoardGenerator";
import Creature from "./Creature";
import Entity from "./Entity";
import Fruit from "./Fruit";

interface BoardCensus {
   creatures: Array<Creature>;
   fruit: Array<Fruit>;
}

export class Board {
   readonly width: number;
   readonly height: number;
   readonly cellSize: number;
   readonly cells: Array<Array<Array<Entity>>>;
   landTileIndexes = new Array<number>();
   private tiles: Array<Array<TileType>>;

   constructor(width: number, height: number, cellSize: number) {
      this.width = width;
      this.height = height;
      this.cellSize = cellSize;

      this.cells = new Array<Array<Array<Entity>>>();
      for (let i = 0; i < height; i++) {
         this.cells.push(new Array<Array<Entity>>());
         for (let j = 0; j < width; j++) {
            this.cells[i].push(new Array<Entity>());
         }
      }

      this.tiles = this.generateTiles();
   }

   private createCell(): HTMLElement {
      const cellObj = document.createElement("div");
      cellObj.className = "cell";
      return cellObj;
   }
   private createCellRow(): HTMLElement {
      const cellRow = document.createElement("div");
      cellRow.style.height = `${this.cellSize}px`;
      cellRow.className = "cell-row";
      return cellRow;
   }
   private generateTiles(): Array<Array<TileType>> {
      const tileTypes = getTiles();

      const board = getElem("board");
      board.classList.remove("hidden");

      const CELL_BORDER_SIZE = 2;
      board.style.setProperty("--cell-size", `${this.cellSize}px`);
      board.style.setProperty("--cell-border-size", `${CELL_BORDER_SIZE}px`);

      const boardWidth = this.width * this.cellSize;
      board.style.width = `${boardWidth}px`;
      const boardHeight = this.height * this.cellSize;
      board.style.height = `${boardHeight}px`;

      const cellRows = new Array<HTMLElement>();
      for (let i = 0; i < this.height; i++) {
         const cellRow = this.createCellRow();
         board.appendChild(cellRow);
         cellRows.push(cellRow);
         for (let j = 0; j < this.width; j++) {
            const tileType = tileTypes[i][j];
            if (!tileType.isLiquid) {
               this.landTileIndexes.push(i * this.width + j);
            }

            const cellObj = this.createCell();
            const colour = randItem(tileType.colour) as string;
            cellObj.style.backgroundColor = colour;
            cellRow.appendChild(cellObj);
         }
      }

      return tileTypes;
   }

   createEntity(entity: Entity): void {
      const cellNumbers = this.getCells(entity.position, entity.size/2);
      this.insertEntity(entity, cellNumbers);
   }

   deleteEntity(entity: Entity): void {
      const cells = this.getEntityReferences(entity);
      this.removeEntity(entity, cells);
   }

   updateEntity(entity: Entity) {
      const previousCellNumbers = this.getEntityReferences(entity);
      const cellNumbers = this.getCells(entity.position, entity.size/2);

      if (cellNumbers !== previousCellNumbers) {
         if (previousCellNumbers.length !== 0) this.removeEntity(entity, previousCellNumbers);
         this.insertEntity(entity, cellNumbers);
      }

      if (entity instanceof Creature) {
         this.runWalkFunc(entity);
      }
   }

   getNearby(position: Vector, radius: number): Array<Entity> {
      const minX = Math.max(Math.floor((position.x - radius) / this.cellSize), 0);
      const maxX = Math.min(Math.floor((position.x + radius) / this.cellSize), this.width - 1);
      const minY = Math.max(Math.floor((position.y - radius) / this.cellSize), 0);
      const maxY = Math.min(Math.floor((position.y + radius) / this.cellSize), this.height - 1);

      let nearbyEntities = new Array<Entity>();
      for (let y = minY; y <= maxY; y++) {
         for (let x = minX; x <= maxX; x++) {
            for (const entity of this.cells[y][x]) {
               const distanceFromEntity = position.distanceFrom(entity.position);
               if (!nearbyEntities.includes(entity) && distanceFromEntity - entity.size/2 <= radius) {
                  nearbyEntities.push(entity);
               }
            }
         }
      }
      return nearbyEntities;
   }

   randomPosition(): Vector {
      if (this.landTileIndexes.length === 0) {
         const x = randFloat(0, this.width * this.cellSize);
         const y = randFloat(0, this.height * this.cellSize);
         return new Vector(x, y);
      }
      const tileIndex = randItem(this.landTileIndexes) as number;
      const x = tileIndex % this.width;
      const y = Math.floor(tileIndex / this.width);

      const xo = randFloat(0, this.cellSize);
      const yo = randFloat(0, this.cellSize);

      return new Vector(x * this.cellSize + xo, y * this.cellSize + yo);
   }

   getFruitColour(position: Vector): string | null {
      if (this.landTileIndexes.length === 0) return null;

      const x = Math.floor(position.x / this.cellSize);
      const y = Math.floor(position.y / this.cellSize);

      const tileType = this.tiles[y][x];
      if (tileType.isLiquid) {
         console.warn("Tried to find the fruit colour of a liquid!");
      }
      return randItem(tileType.fruitColour!) as string;
   }

   getTileType(position: Vector): TileType {
      const x = clamp(Math.floor(position.x / this.cellSize), 0, this.width - 1);
      const y = clamp(Math.floor(position.y / this.cellSize), 0, this.height - 1);

      return this.tiles[y][x];
   }

   randomPositionInCell(cellNumber: number): Vector {
      const cellX = cellNumber % this.width;
      const cellY = Math.floor(cellNumber / this.width);

      const x = randFloat(0, this.cellSize);
      const y = randFloat(0, this.cellSize);

      return new Vector(cellX * this.cellSize + x, cellY * this.cellSize + y);
   }

   randomNearbyPosition(position: Vector, radius: number, tilePreference?: TileType): Vector {
      let nearbyPosition: Vector | null = null;
      while (nearbyPosition === null) {
         const pos = position.randomOffset(radius);
         if (this.positionIsInBoard(pos)) {
            const tileType = this.getTileType(pos);
            if (tileType !== tilePreference && Math.random() >= Game.settings.tilePreference) continue;

            nearbyPosition = pos;
         }
      }
      return nearbyPosition;
   }

   census(): Promise<BoardCensus> {
      return new Promise(resolve => {
         let creatures: Array<Creature> = new Array<Creature>();
         let fruit: Array<Fruit> = new Array<Fruit>();
      
         for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
               const cell = this.cells[y][x];
               for (const entity of cell) {
                  if (entity instanceof Creature && !creatures.includes(entity)) creatures.push(entity);
                  else if (entity instanceof Fruit && !fruit.includes(entity)) fruit.push(entity);
               }
            }
         }
   
         const entities = {
            creatures: creatures,
            fruit: fruit
         };
         resolve(entities);
      });
   }

   /** Tick a random couple of tiles each tick. */
   tick() {
      const tickedEntities = new Array<Entity>();
      for (let y = 0; y < this.height; y++) {
         for (let x = 0; x < this.width; x++) {
            const cell = this.cells[y][x];
            for (const entity of cell) {
               if (!tickedEntities.includes(entity)) {
                  entity.tick();
                  tickedEntities.push(entity);
               }
            }
         }
      }

      const tileTickAmount = this.width * this.height / 100;
      for (let i = 0; i < tileTickAmount; i++) {
         const x = randInt(0, this.width);
         const y = randInt(0, this.height);
         
         const tileType = this.tiles[y][x];
         if (tileType.tickFunc) tileType.tickFunc(x, y);
      }
   }

   private runWalkFunc(creature: Creature): void {
      const x = clamp(Math.floor(creature.position.x / this.cellSize), 0, this.width - 1);
      const y = clamp(Math.floor(creature.position.y / this.cellSize), 0, this.height - 1);

      const tileType = this.tiles[y][x];
      if (tileType.walkFunc) tileType.walkFunc(creature);
   }

   private insertEntity(entity: Entity, cells: Array<Array<Entity>>) {
      for (const cell of cells) {
         cell.push(entity);
      }
   }

   private removeEntity(entity: Entity, cells: Array<Array<Entity>>) {
      for (const cell of cells) {
         while (true) {
            const idx = cell.indexOf(entity);
            if (idx !== -1) {
               cell.splice(idx, 1);
            } else {
               break;
            }
         }
      }
   }

   private getEntityReferences(entity: Entity): Array<Array<Entity>> {
      const xCell = clamp(Math.floor(entity.position.x / this.cellSize), 0, this.width - 1);
      const yCell = clamp(Math.floor(entity.position.y / this.cellSize), 0, this.height - 1);

      const minX = Math.max(xCell - 2, 0);
      const maxX = Math.min(xCell + 2, this.width - 1);
      const minY = Math.max(yCell - 2, 0);
      const maxY = Math.min(yCell + 2, this.height - 1);

      let cellNumbs = [];
      let cells = new Array<Array<Entity>>();
      for (let y = minY; y <= maxY; y++) {
         for (let x = minX; x <= maxX; x++) {
            const cell = this.cells[y][x];
            if (cell.includes(entity)) {
               cellNumbs.push([x, y]);
               cells.push(cell);
            }
         }
      }

      return cells;
   }

   private getCells(position: Vector, radius: number): Array<Array<Entity>> {
      const x = Math.floor(position.x / this.cellSize);
      const y = Math.floor(position.y / this.cellSize);

      // The (position.x + this.cellSize) part is necessary because sometimes is negative
      const cellX = (position.x + this.cellSize) % this.cellSize;
      const cellY = (position.y + this.cellSize) % this.cellSize;

      const baseCellNumber: [number, number] = [x, y];

      let cellNumbers: Array<[number, number]> = [baseCellNumber];

      // Top
      if (cellX - radius < 0) cellNumbers.push([x - 1, y]);
      // Bottom
      if (cellX + radius > this.cellSize) cellNumbers.push([x + 1, y]);
      // Left
      if (cellY - radius < 0) cellNumbers.push([x, y - 1]);
      // Right
      if (cellY + radius > this.cellSize) cellNumbers.push([x, y + 1]);
      // Top left
      if (cellX - radius < 0 && cellY - radius < 0) cellNumbers.push([x - 1, y - 1]);
      // Top right
      if (cellX + radius > this.cellSize && cellY - radius < 0) cellNumbers.push([x - 1, y - 1]);
      // Bottom left
      if (cellX - radius < 0 && cellY + radius < this.cellSize) cellNumbers.push([x - 1, y - 1]);
      // Bottom right
      if (cellX + radius > this.cellSize && cellY + radius < this.cellSize) cellNumbers.push([x - 1, y - 1]);

      for (let i = cellNumbers.length - 1; i >= 0; i--) {
         const cellNumber = cellNumbers[i];
         if (cellNumber[0] < 0 || cellNumber[0] >= this.width || cellNumber[1] < 0 || cellNumber[1] >= this.height) {
            cellNumbers.splice(i, 1);
         }
      }

      const cells = new Array<Array<Entity>>();
      for (const cellNumber of cellNumbers) {
         cells.push(this.cells[cellNumber[1]][cellNumber[0]]);
      }

      return cells;
   }

   private positionIsInBoard(position: Vector): boolean {
      return position.x >= 0 && position.x <= this.width * this.cellSize && position.y >= 0 && position.y <= this.height * this.cellSize;
   }
}