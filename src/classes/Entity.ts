import Game from "../Game";
import { Cell, cells } from "../main";
import { getElem, randFloat, Vector } from "../utils";

export interface EntityAttributes {
   [key: string]: number | Vector | undefined;
   lifespan?: number;
   readonly size: Vector;
}

export abstract class Entity {
   [key: string]: any;

   cellNumber: number;
   position: Vector;
   velocity: Vector;

   age: number;
   lifespan!: number;
   size!: Vector;

   element: HTMLElement;

   constructor(position: Vector, attributes: EntityAttributes) {
      this.position = position;
      // By default all entities has no velocity.
      this.velocity = new Vector(0, 0);
      
      this.age = 0;

      // Set all attributes
      for (const attribute of Object.entries(attributes)) {
         this[attribute[0]] = attribute[1];
      }

      this.element = this.createEntity();
      this.instantiate(this.element);

      this.updatePosition();

      // Add the entity to the cells array
      this.cellNumber = this.calculateCell();
   };

   // Used in derived classes to create the actual visual thing
   abstract instantiate(element: HTMLElement): void;

   createEntity(): HTMLElement {
      const entity = document.createElement("div");
      getElem("board").appendChild(entity);

      const width = `${this.size.x}px`;
      const height = `${this.size.y}px`;
      entity.style.width = width;
      entity.style.height = height;

      return entity;
   };

   tick(): void {
      if (this.age++ >= this.lifespan) {
         this.die();
         return;
      }

      // Move
      this.position = this.position.add(this.velocity);

      this.calculateCell();
      this.updatePosition();
   };
   updatePosition(): void {
      this.element.style.left = `${this.position.x}px`;
      this.element.style.top = `${this.position.y}px`;
   };
   die(): void {
      this.element.remove();

      // Remove all instances of this entity from the cells object
      for (const cell of cells) {
         const index = cell.indexOf(this);
         if (index !== -1) {
            cell.splice(index, 1);
         }
      }
   };

   /**
    * Calculate which cell the entity is currently in.
    */
   calculateCell(): number {
      const cellX = Math.floor(this.position.x / Game.cellSize);
      const cellY = Math.floor(this.position.y / Game.cellSize);

      const minCellNumber = 0;
      const maxCellNumber = Game.boardSize.width * Game.boardSize.height - 1;

      let cellNumber = cellY * Game.boardSize.width + cellX;
      // Clamp the cell number at the minimum and maximum values.
      cellNumber = Math.min(Math.max(cellNumber, minCellNumber), maxCellNumber);

      this.cellNumber = cellNumber;

      // Remove any previous instances of the entity from the cells object
      for (let i = 0; i < cells.length; i++) {
         const cell = cells[i];

         if (cell.includes(this)) {
            const cellIndex = cell.indexOf(this);
            cell.splice(cellIndex, 1);
         }
      }

      if (cells[cellNumber] === undefined) {
         console.log(cells);
         console.log(cellNumber);
      }
      cells[cellNumber].push(this);

      return cellNumber;
   };

   /**
    * Get cells near to the entity
    * @param {number} searchRadius - The radius of cells for which to search
    */
   getSurroundingCells(searchRadius: number): ReadonlyArray<Cell> {
      let surroundingCells = new Array<Cell>();

      // The number of cells in one row of the world
      const offset = Game.boardSize.width;
      // Get the cell offset number for all surrounding cells in a square of width searchRadius * 2 + 1
      // e.g.
      //     X X X
      //     X X X
      //     X X X
      // Where X signifies a cell to check, and the centermost X Is the location of the creature.
      for (let i = 0; i < searchRadius * 2 + 1; i++) {
         for (let j = 0; j < searchRadius * 2 + 1; j++) {
            const cellYOffset = (i - searchRadius) * offset;
            const cellXOffset = j - searchRadius;
            const cellOffset = cellYOffset + cellXOffset;

            const cellNumber = cellOffset + this.cellNumber;

            // Filter out cell numbers which are out of bounds
            const horizontalDistanceToCell = Math.abs((this.cellNumber % Game.boardSize.width) - (cellNumber % Game.boardSize.width));
            if (horizontalDistanceToCell > 1) continue;

            const maxCellNumber = Game.boardSize.width * Game.boardSize.height - 1;
            if (cellNumber < 0 || cellNumber > maxCellNumber) continue;

            surroundingCells.push(cells[cellNumber]);
         }
      }

      return surroundingCells;
   }

   getEntitiesInCells(cells: ReadonlyArray<Cell>): ReadonlyArray<Entity> {
      let entities = new Array<Entity>();
      for (const cell of cells) {
         const newEntities = cell.filter(entity => !(entity === this));
         entities = entities.concat(newEntities);
      }
      return entities;
   };

   static randomPositionInCell(cellNumber: number) {
      const cellX = cellNumber % Game.boardSize.width;
      const cellY = Math.floor(cellNumber / Game.boardSize.width);

      const x = randFloat(0, Game.cellSize);
      const y = randFloat(0, Game.cellSize);

      return new Vector(cellX * Game.cellSize + x, cellY * Game.cellSize + y);
   }

   isCollidingWithEntity(entity: Entity): boolean {
      const distance = this.position.distanceFrom(entity.position);

      // Inaccurate for entites with a different width and height, problem for future self
      return distance - this.size.x/2 - entity.size.x/2 <= 0;
   }
}