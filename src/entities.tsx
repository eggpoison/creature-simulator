import { Vector } from "./utils";

export class Thing {
   position: Vector;
   velocity: Vector;
   size: Vector;
   age: number;
   lifespan: number;

   constructor(position: Vector, size: Vector, lifespan: number) {
      this.position = position;
      // By default, the thing has no velocity.
      this.velocity = new Vector(0, 0);
      this.size = size;
      this.age = 0;
      this.lifespan = lifespan;
   };

   tick(): void {
      if (this.age++ >= this.lifespan) {
         this.die();
         return;
      }
   };
   die(): void {

   };
}