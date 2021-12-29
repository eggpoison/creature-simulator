import Game from "../Game";
import GameImage from "../GameImage";
import { Vector } from "../utils";
import Creature, { CreatureAttributes } from "./Creature";
import Entity, { EntityAttributes } from "./Entity";

class Egg extends Entity {
   constructor(position: Vector, attributes: EntityAttributes, creatureAttributes: CreatureAttributes) {
      super(position, attributes);

      this.creatureAttributes = creatureAttributes;
   }

   instantiate(): HTMLElement {
      const ticksPerFrame = Math.floor(this.lifespan / 5);
      const element = new GameImage("egg", 5, ticksPerFrame, this.size, this.size, this.position).element;

      return element;
   }

   tick(): void {
      super.tick();

      const shakeAmount = Math.sin(Game.ticks * Game.tps) * 1.25;
      this.element.style.transform = `translate(-50%, -50%) rotate(${shakeAmount}deg)`;
   }

   die(): void {
      super.die();

      new Creature(this.position.copy(), this.creatureAttributes);
   }

   // count(): number {
   //    let count = 0;
   //    for (const cell of cells) {
   //       for (const entity of cell) {
   //          if (entity instanceof Egg) count++;
   //       }
   //    }
   // }
}

export default Egg;