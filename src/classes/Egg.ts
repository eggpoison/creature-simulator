import Game from "../Game";
import GameImage from "../GameImage";
import { Vector } from "../utils";
import Creature, { CreatureAttributes } from "./Creature";
import Entity, { EntityAttributes } from "./Entity";

class Egg extends Entity {
   generation: number;

   constructor(position: Vector, attributes: EntityAttributes, creatureAttributes: CreatureAttributes, generation: number) {
      super(position, attributes);

      this.generation = generation;
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

      const creature = new Creature(this.position.copy(), this.creatureAttributes);
      creature.stats.generation = this.generation;   
   }
}

export default Egg;