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

   static randomUnitVector(): Vector {
      const theta = Math.random() * 2 * Math.PI;
      return new Vector(Math.cos(theta), Math.sin(theta));
   }

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

   distanceFrom(vec2: Vector): number {
      const distance = Math.sqrt(Math.pow(this.x - vec2.x, 2) + Math.pow(this.y - vec2.y, 2));
      return distance;
   };

   angleBetween(vec2: Vector): number {
      const angle = Math.atan2(vec2.y - this.y, vec2.x - this.x);
      return angle;
   }

   convertToPolar(vec2?: Vector): PolarVector {
      const targetVector = vec2 || new Vector(0, 0);

      const distance = this.distanceFrom(targetVector);
      const angle = this.angleBetween(targetVector);
      return new PolarVector(distance, angle);
   }

   randomOffset(radius: number): Vector {
      const dist = randFloat(0, radius);
      const ang = randFloat(0, 360);
      const offset = new PolarVector(dist, ang);
      return this.add(offset.convertToCartesian());
   }

   copy(): Vector {
      return new Vector(this.x, this.y);
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

   static randomUnitVector(): PolarVector {
      const theta = randFloat(0, 360);
      // const theta = Math.random() * 2 * Math.PI;
      return new PolarVector(1, theta);
      // return new Vector(Math.cos(theta), Math.sin(theta));
   }
}

export function getElem(id: string): HTMLElement {
   const elem = document.getElementById(id);
   if (!elem) throw new Error(`ungaming: tried to find element with an id of '${id}' but could not find any.'`);
   return elem;
}

export function getSuffix(num: number): string {
   return num === 1 ? "" : "s";
}

/**
 * Returns a random integer between the specified minimum and maximum values.
 * @param min The lowest possible number.
 * @param max The highest possible number.
 */
export function randInt(min: number, max: number, isInclusive?: boolean): number {
   if (min >= max) throw new Error(`Min of '${min}' is greater than max of '${max}'`);
   return Math.floor(Math.random() * (max - min + (isInclusive ? 1 : 0))) + min;
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

export function randomGaussianBell(): number {
   // Box Muller method from https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve

   let u = 0, v = 0;
   while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
   while(v === 0) v = Math.random();
   let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
   num = num / 10.0 + 0.5; // Translate to 0 -> 1
   if (num > 1 || num < 0) return randomGaussianBell() // resample between 0 and 1
   return num;
 }

export function createHoverBox(text: string, position: Vector, parent: HTMLElement): HTMLElement {
   const hoverBox = document.createElement("div");
   hoverBox.className = "hover-box";
   hoverBox.style.left = position.x + "px";
   hoverBox.style.top = position.y + "px";
   hoverBox.innerHTML = text;
   parent.appendChild(hoverBox);

   return hoverBox;
}

export function roundNum(num: number, dpp: number): number {
   const power = Math.pow(10, dpp)
   return Math.round((num + Number.EPSILON) * power) / power;
}

export function drawRay(start: Vector, end: Vector) {
   const dist = start.distanceFrom(end);
   const ang = start.angleBetween(end);

   const ray = document.createElement("div");
   getElem("board").appendChild(ray);
   ray.className = "ray";
   ray.style.transform = `rotate(${ang}rad)`;
   ray.style.width = dist + "px";
   ray.style.left = start.x + "px";
   ray.style.top = start.y + "px";
}

export function standardDeviation(data: ReadonlyArray<number>): number {
   const n = data.length;
   const mean = data.reduce((a, b) => a + b) / n;
   const sqrDeviations = data.map(val => Math.pow(val - mean, 2));
   const variance = sqrDeviations.reduce((a, b) => a + b) / n;
   return Math.sqrt(variance);
}

export class Colour {
   private _hex!: string;
   public get hex(): string {
      return "#" + this._hex;
   }

   private _rgb: [number, number, number];
   public get rgb(): string {
      const [ r, g, b ] = this._rgb;
      return `rgb(${r}, ${g}, ${b})`;
   }

   constructor(colour: string | [number, number, number] ) {
      if (typeof colour === "string") {
         this._hex = colour.toLowerCase();
         if (this._hex.length === 7) {
            this._hex = this._hex.substring(1, 7);
         }
   
         this._rgb = this.getRGB();
      } else {
         this._rgb = colour;

         this._hex = Colour.getHex(this._rgb);
      }
   }

   private getRGB(): [number, number, number] {
      const hexDigits = "0123456789abcdef".split("");

      const rgb: [number, number, number] = [0, 0, 0];
      for (let i = 0; i < 3; i++) {
         const digit1 = hexDigits.indexOf(this._hex[i * 2]);
         const digit2 = hexDigits.indexOf(this._hex[i * 2 + 1]);
         rgb[i] = digit1 * 16 + digit2;
      }
      return rgb;
   }
   private static getHex(rgb: [number, number, number]): string {
      const hexDigits = "0123456789abcdef".split("");

      let hex = "";
      for (let i = 0; i < 3; i++) {
         const col = rgb[i];
         const digit2 = col % 16;
         const digit1 = (col-digit2) / 16;
         hex += hexDigits[digit1] + hexDigits[digit2];
      }
      return hex;
   }

   darken(amount: number): Colour {
      // 1 = fully darkened, 0.5 = half darkened
      // Rounds down
      const rgb = this._rgb.map(colour => Math.round(colour * (1 - amount))) as [number, number, number];
      return new Colour(rgb);
   }

   // https://stackoverflow.com/questions/13348129/using-native-javascript-to-desaturate-a-colour/13355255
   desaturate(amount: number): Colour {
      const col = this._rgb.slice();
      const gray = col[0] * 0.3086 + col[1] * 0.6094 + col[2] * 0.0820;

      col[0] = Math.round(lerp(col[0], gray, amount));
      col[1] = Math.round(lerp(col[1], gray, amount));
      col[2] = Math.round(lerp(col[2], gray, amount));

      return new Colour([col[0], col[1], col[2]]);
   }

   static grayscale(val: number): string {
      const b16 = Math.floor(val * 255);

      const hex = Colour.getHex([b16, b16, b16]);
      return hex;
   }
}

export async function sleep(ms: number): Promise<void> {
   return new Promise(resolve => {
      setTimeout(resolve, ms);
   });
}

export function clamp(num: number, lowerBound: number, upperBound: number): number {
   return Math.max(Math.min(num, upperBound), lowerBound);
}