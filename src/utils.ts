/**
 * Represents a generic object with an x and y value.
 * @constructor
 * @param {number} x - The x component of the object.
 * @param {number} y - The y component of the object.
 */
export class Vector {
   x: number;
   y: number;

   constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
   };

   add(vec2: Vector): Vector {
      return new Vector(
         this.x + vec2.x,
         this.y + vec2.y
      );
   };

   dot(vec2: Vector): number {
      return this.x * vec2.x + this.y * vec2.y;
   }

   lerp(targetVec: Vector, amount: number): Vector {
      return new Vector(
         lerp(this.x, targetVec.x, amount),
         lerp(this.y, targetVec.y, amount)
      );
   };

   distance(vec2: Vector): number {
      const distance = Math.sqrt(Math.pow(this.x - vec2.x, 2) + Math.pow(this.y - vec2.y, 2));
      return distance;
   };

   angleBetween(vec2: Vector): number {
      const angle = Math.atan2(vec2.y - this.y, vec2.x - this.x);
      return angle;
   }

   convertToPolar(vec2?: Vector): PolarVector {
      const targetVector = vec2 || new Vector(0, 0);

      const distance = this.distance(targetVector);
      const angle = this.angleBetween(targetVector);
      return new PolarVector(distance, angle);
   }
}

export class PolarVector {
   magnitude: number;
   direction: number;

   constructor(magnitude: number, direction: number) {
      this.magnitude = magnitude;
      this.direction = direction;
   }

   convertToCartesian(): Vector {
      const x = Math.cos(this.direction) * this.magnitude;
      const y = Math.sin(this.direction) * this.magnitude;
      return new Vector(x, y);
   }
}

export function getElem(id: string): HTMLElement {
   const elem = document.getElementById(id);
   if (!elem) throw new Error(`ungaming: tried to find element with an id of '${id}' but could not find any.'`);
   return elem;
}

/**
 * Returns a random integer between the specified minimum and maximum values.
 * @param min The lowest possible number.
 * @param max The highest possible number.
 */
export function randInt(min: number, max: number): number {
   if (min >= max) throw new Error(`Min of '${min}' is greater than max of '${max}'`);
   return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Returns a random float between the specified minimum and maximum values.
 * @param min The lowest possible number.
 * @param max The highest possible number.
 */
export function randFloat(min: number, max: number): number {
   if (min >= max) throw new Error(`Min of '${min}' is greater than max of '${max}'`);
   return Math.random() * (max - min) + min;
}

export function randItem(arr: Array<unknown>): unknown {
   const randIndex = randInt(0, arr.length);
   return arr[randIndex];
}

export function lerp(start: number, target: number, amount: number): number {
   return (1 - amount) * start + amount * target;
}