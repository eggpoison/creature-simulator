import Game from "../Game";
import { getElem, Vector } from "../utils";

export interface EntityGenes {
   [key: string]: number | string | Vector | undefined;
   lifespan: number;
   readonly size: number;
}

abstract class Entity {
   [key: string]: any;

   position: Vector;
   velocity: Vector;

   age: number;
   lifespan!: number;

   element: HTMLElement;

   constructor(position: Vector, genes: EntityGenes) {
      this.position = position;
      // By default all entities has no velocity.
      this.velocity = new Vector(0, 0);
      
      this.age = 0;

      // Set all attributes
      for (const [geneName, gene] of Object.entries(genes)) {
         this[geneName] = gene;
      }

      this.element = this.instantiate();
      this.createEntity();

      this.updatePosition();

      // Add the entity to the cells array
      Game.board.createEntity(this);
   };

   // Used in derived classes to create the actual visual thing
   abstract instantiate(): HTMLElement;

   static count(entityType: any): number {
      let count = 0;
      const entities = new Array<Entity>();
      for (let y = 0; y < Game.board.height; y++) {
         for (let x = 0; x < Game.board.width; x++) {
            const cell = Game.board.cells[y][x];
            for (const entity of cell) {
               if (entityType.prototype.isPrototypeOf(entity) && !entities.includes(entity)) {
                  entities.push(entity);
                  count++;
               }
            }
         }
      }
      return count;
   }

   private createEntity(): HTMLElement {
      getElem("board").appendChild(this.element);

      let width: number, height: number;

      if (typeof this.size === "number") {
         // Number
         width = this.size;
         height = this.size;
      } else {
         // Vector
         width = this.size.x;
         height = this.size.y;
      }

      this.element.style.width = width + "px";
      this.element.style.height = height + "px";

      return this.element;
   };

   tick(): void {
      if (this.age++ >= this.lifespan) {
         this.die();
         return;
      }

      // Move
      this.position = this.position.add(this.velocity);

      Game.board.updateEntity(this);
      this.updatePosition();
   };
   protected updatePosition(): void {
      this.element.style.left = `${this.position.x}px`;
      this.element.style.top = `${this.position.y}px`;
   };
   die(): void {
      Game.board.deleteEntity(this);
      
      this.element.remove();
   };

   isCollidingWithEntity(entity: Entity): boolean {
      const distance = this.position.distanceFrom(entity.position);

      if (typeof this.size === "number") {
         return distance - this.size/2 <= 0;
      } else {
         if (typeof entity.size === "number") {
            return distance - this.size.x/2 - entity.size/2 <= 0;
         } else {
            return distance - this.size.x/2 - entity.size.x/2 <= 0;
         }
      }
   }
}

export default Entity;