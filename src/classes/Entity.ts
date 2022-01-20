import Game from "../Game";
import { getElem, Vector } from "../utils";

export interface EntityAttributes {
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

   constructor(position: Vector, attributes: EntityAttributes) {
      this.position = position;
      // By default all entities has no velocity.
      this.velocity = new Vector(0, 0);
      
      this.age = 0;

      // Set all attributes
      for (const attribute of Object.entries(attributes)) {
         this[attribute[0]] = attribute[1];
      }

      this.element = this.instantiate();
      this.createEntity();

      this.updatePosition();

      // Add the entity to the cells array
      Game.board.createEntity(this);
      // this.cellNumber = this.calculateCell();
   };

   // Used in derived classes to create the actual visual thing
   abstract instantiate(): HTMLElement;

   static count(entityType: any): number {
      let count = 0;
      for (const cell of Game.board.cells) {
         for (const entity of cell) {
            if (entityType.prototype.isPrototypeOf(entity)) count++;
         }
      }
      return count;
   }

   createEntity(): HTMLElement {
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
   updatePosition(): void {
      this.element.style.left = `${this.position.x}px`;
      this.element.style.top = `${this.position.y}px`;
   };
   die(): void {
      this.element.remove();

      Game.board.deleteEntity(this);
   };

   isCollidingWithEntity(entity: Entity): boolean {
      const distance = this.position.distanceFrom(entity.position);

      if (typeof this.size === "number") {
         return distance - this.size/2 <= 0;
      } else {
         // TODO: Inaccurate for entites with a different width and height, problem for future self
         if (typeof entity.size === "number") {
            return distance - this.size.x/2 - entity.size/2 <= 0;
         } else {
            return distance - this.size.x/2 - entity.size.x/2 <= 0;
         }
      }
   }
}

export default Entity;