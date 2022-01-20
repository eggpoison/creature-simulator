import Game from "../Game";
import { randItem, Vector } from "../utils";
import Entity, { EntityAttributes } from "./Entity";

export function createFruit(cellNumber?: number): void {
   const attributes: EntityAttributes = {
      lifespan: 10 * Game.tps,
      size: 8
   };

   let position: Vector;
   if (cellNumber) {
      position = Game.board.randomPositionInCell(cellNumber);
   } else {
      position = Game.board.randomPosition();
   }

   new Fruit(position, attributes);
}

class Fruit extends Entity {
   instantiate(): HTMLElement {
      const element = document.createElement("div");
      element.className = "fruit";

      const FRUIT_COLOURS: ReadonlyArray<string> = ["red", "green", "pink"];

      const colour = randItem(FRUIT_COLOURS as unknown[]) as string;
      element.style.backgroundColor = colour;

      return element;
   }
}

export default Fruit;