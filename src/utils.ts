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
   lerp(targetVec: Vector, amount: number) {
      return new Vector(
         lerp(this.x, targetVec.x, amount),
         lerp(this.y, targetVec.y, amount)
      );
   };
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