import { randFloat, Vector } from "../utils";
import Creature from "./Creature";
import Entity from "./Entity";
import Fruit from "./Fruit";

interface BoardCensus {
   creatures: Array<Creature>;
   fruit: Array<Fruit>;
}

export class Board {
   private width: number;
   private height: number;
   private cellSize: number;
   cells: Array<Array<Entity>>;

   constructor(width: number, height: number, cellSize: number) {
      this.width = width;
      this.height = height;
      this.cellSize = cellSize;

      this.cells = new Array<Array<Entity>>(width * height);
      for (let i = 0; i < width * height; i++) {
         this.cells[i] = [];
      }
   }

   createEntity(entity: Entity): void {
      const cellNumbers = this.getCellNumbers(entity.position, entity.size/2);
      this.insertEntity(entity, cellNumbers);
   }

   deleteEntity(entity: Entity): void {
      const cellNumbers = this.getCellNumbers(entity.position, entity.size/2);
      this.removeEntity(entity, cellNumbers);
   }

   updateEntity(entity: Entity) {
      const previousCellNumbers = this.getEntityReferences(entity);
      const cellNumbers = this.getCellNumbers(entity.position, entity.size/2);

      if (cellNumbers !== previousCellNumbers) {
         this.removeEntity(entity, previousCellNumbers);
         this.insertEntity(entity, cellNumbers);
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
            const cellNumber = y * this.width + x;
            for (const entity of this.cells[cellNumber]) {
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
      const x = randFloat(0, this.width) * this.cellSize;
      const y = randFloat(0, this.height) * this.cellSize;
      return new Vector(x, y);
   }

   randomPositionInCell(cellNumber: number): Vector {
      const cellX = cellNumber % this.width;
      const cellY = Math.floor(cellNumber / this.width);

      const x = randFloat(0, this.cellSize);
      const y = randFloat(0, this.cellSize);

      return new Vector(cellX * this.cellSize + x, cellY * this.cellSize + y);
   }

   randomNearbyPosition(position: Vector, radius: number): Vector {
      let nearbyPosition: Vector | null = null;
      while (nearbyPosition === null) {
         const pos = position.randomOffset(radius);
         if (this.positionIsInBoard(pos)) {
            nearbyPosition = pos;
         }
      }
      return nearbyPosition;
   }

   census(): Promise<BoardCensus> {
      return new Promise(resolve => {
         let creatures: Array<Creature> = new Array<Creature>();
         let fruit: Array<Fruit> = new Array<Fruit>();
      
         for (const cell of this.cells) {
            for (const entity of cell) {
               if (entity instanceof Creature && !creatures.includes(entity)) creatures.push(entity);
               else if (entity instanceof Fruit && !fruit.includes(entity)) fruit.push(entity);
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

   private insertEntity(entity: Entity, cellNumbers: Array<number>) {
      for (const cellNumber of cellNumbers) {
         this.cells[cellNumber].push(entity);
      }
   }

   private removeEntity(entity: Entity, cellNumbers: Array<number>) {
      for (const cellNumber of cellNumbers) {
         const idx = this.cells[cellNumber].indexOf(entity);
         this.cells[cellNumber].splice(idx, 1);
      }
   }

   private getEntityReferences(entity: Entity): Array<number> {
      let cells = new Array<number>();
      for (let i = 0; i < this.cells.length; i++) {
         if (this.cells[i].includes(entity)) cells.push(i);
      }
      return cells;
   }

   private getCellNumbers(position: Vector, radius: number): Array<number> {
      // The (position.x + this.cellSize) part is necessary because sometimes is negative
      const cellX = (position.x + this.cellSize) % this.cellSize;
      const cellY = (position.y + this.cellSize) % this.cellSize;
      
      const x = Math.floor(position.x / this.cellSize);
      const y = Math.floor(position.y / this.cellSize);

      const positionInCell = new Vector(cellX, cellY);
      
      const baseCellNumber = y * this.width + x;
      let cellNumbers = [baseCellNumber];
      if (positionInCell.x - radius < 0) cellNumbers.push(baseCellNumber - 1);
      if (positionInCell.x + radius > this.cellSize) cellNumbers.push(baseCellNumber + 1);
      if (positionInCell.y - radius < 0) cellNumbers.push(baseCellNumber - this.width);
      if (positionInCell.y + radius > this.cellSize) cellNumbers.push(baseCellNumber + this.width);
      if (positionInCell.x - radius < 0 && positionInCell.y - radius < 0) cellNumbers.push(baseCellNumber - this.width - 1);
      if (positionInCell.x - radius < 0 && positionInCell.y + radius > this.cellSize) cellNumbers.push(baseCellNumber + this.width - 1);
      if (positionInCell.x - radius > this.cellSize && positionInCell.y - radius < 0) cellNumbers.push(baseCellNumber - this.width + 1);
      if (positionInCell.x - radius > this.cellSize && positionInCell.y + radius > this.cellSize) cellNumbers.push(baseCellNumber + this.width + 1);
      // TODO: Do corners

      const maxCellNumber = this.width * this.height - 1;
      for (let i = cellNumbers.length - 1; i >= 0; i--) {
         const cellNumber = cellNumbers[i];
         if (cellNumber < 0 || cellNumber > maxCellNumber) {
            cellNumbers.splice(i, 1);
         }
      }

      return cellNumbers;
   }

   private positionIsInBoard(position: Vector): boolean {
      return position.x >= 0 && position.x <= this.width * this.cellSize && position.y >= 0 && position.y <= this.height * this.cellSize;
   }
}