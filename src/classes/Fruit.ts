import Game from "../Game";
import { Vector } from "../utils";
import Entity, { EntityGenes } from "./Entity";

export function createFruit(cellNumber?: number): void {
   const attributes: EntityGenes = {
      lifespan: 10 * Game.tps,
      size: 8
   };

   let position: Vector;
   if (cellNumber) {
      position = Game.board.randomPositionInCell(cellNumber);
   } else {
      position = Game.board.randomPosition();
   }

   const colour = Game.board.getFruitColour(position);

   if (colour !== null) {   
      new Fruit(position, attributes, colour);
   }
}

class Fruit extends Entity {
   constructor(position: Vector, attributes: EntityGenes, colour: string) {
      super(position, attributes);

      this.element.style.backgroundColor = colour;
   }

   instantiate(): HTMLElement {
      const element = document.createElement("div");
      element.className = "fruit";

      // const FRUIT_COLOURS: ReadonlyArray<string> = ["red", "green", "pink"];

      // const colour = randItem(FRUIT_COLOURS as unknown[]) as string;
      // element.style.backgroundColor = colour;

      return element;
   }
}

export default Fruit;