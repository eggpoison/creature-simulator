import Game from "../Game";
import { randItem, Vector } from "../utils";
import { Entity, EntityAttributes } from "./Entity";

export function createFruit(cellNumber: number): void {
   const attributes: EntityAttributes = {
      lifespan: 10 * Game.tps,
      size: new Vector(8, 8)
   };

   const position = Entity.randomPositionInCell(cellNumber);

   new Fruit(position, attributes);
}

export class Fruit extends Entity {
   instantiate(element: HTMLElement): void {
      element.className = "fruit";

      const FRUIT_COLOURS: ReadonlyArray<string> = ["red", "green", "pink"];

      const colour = randItem(FRUIT_COLOURS as unknown[]) as string;
      element.style.backgroundColor = colour;
   }
}