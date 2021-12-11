import Game from "./Game";
import { randFloat, randItem, Vector } from "./utils";

const confettis: Array<Confetti> = [];

class Confetti {
   element: HTMLElement;
   position: Vector;
   velocity: Vector;

   constructor() {
      this.element = this.createInstance();
      this.position = this.getRandomPosition();
      this.velocity = this.getRandomVelocity();
   };
   getRandomPosition(): Vector {
      // Between 100 and 0, percentage of the screen that the x position could start at
      const X_RANGE = 90;
      // Between 100 and 0, percentage of the screen that the y position could start at
      const Y_RANGE = 90;
      // Shifts the potential y positions up and down. Negative is a shift down
      const Y_OFFSET = -10;

      const x = randFloat(0, X_RANGE) + (100 - X_RANGE) / 2;
      const y = randFloat(0, Y_RANGE) + (100 - Y_RANGE) / 2 - Y_OFFSET;
      return new Vector(x, y);
   };
   getRandomVelocity(): Vector {
      const xVel = randFloat(-2, 2);
      const yVel = randFloat(-12, -5);
      return new Vector(xVel, yVel);
   };
   createInstance(): HTMLElement {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      document.body.appendChild(confetti);

      // Give it a random size
      const WIDTH_RANGE = [3, 7];
      const HEIGHT_RANGE = [5, 12];
      const width = randFloat(WIDTH_RANGE[0], WIDTH_RANGE[1]);
      const height = randFloat(HEIGHT_RANGE[0], HEIGHT_RANGE[1]);
      confetti.style.width = `${width}px`;
      confetti.style.height = `${height}px`;
      
      // Apply a random rotation
      const rotation = Math.random() * 180;
      confetti.style.transform = `rotate(${rotation}deg)`;

      const potentialColours: Array<string> = ["red", "pink", "orange", "green", "blue"];
      const colour: string = randItem(potentialColours) as string;
      confetti.style.backgroundColor = colour;

      return confetti;
   };
   updatePosition(): void {
      this.element.style.left = `${this.position.x}%`;
      this.element.style.top = `${this.position.y}%`;
   };
   tick() {
      for (let i = 0; i < 7; i++) {
         // Apply velocity
         this.position = this.position.lerp(this.position.add(this.velocity), 1 / Game.tps);
         // Gravityyyyy
         this.velocity.y += 0.05;
      }

      // If the confetti is out of bounds, stab it
      if (this.position.y > 100 || this.position.x < 0 || this.position.x > 100) {
         this.die();
      }

      this.updatePosition();
   };
   die() {
      this.element.remove();

      const confettiIndex = confettis.indexOf(this);
      confettis.splice(confettiIndex, 1);
   }
}

const handleConfettis = () => {
   for (const confetti of confettis) confetti.tick();
}

export function createConfettis(n: number) {
   for (let i = 0; i < n; i++) {
      confettis.push(new Confetti());
   }

   if (!Game.hasRenderListener(handleConfettis)) Game.createRenderListener(handleConfettis);
}