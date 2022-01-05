import Game from "./Game";
import { getElem } from "./utils";

const updateTransform = (): void => {
   const board = getElem("board");

   board.style.top = `calc(50% + ${Game.transform.translate.y}%)`;
   board.style.left = `calc(50% + ${Game.transform.translate.x}%)`;
   board.style.transform = `translate(-50%, -50%) scale(${Game.transform.zoom}, ${Game.transform.zoom})`;
}

type translateDirection = "up" | "right" | "down" | "left";
const translateBoard = (dir: translateDirection): void => {
   const TRANSLATE_AMOUNT = 5;

   const translate = Game.transform.translate;
   switch (dir) {
      case "up": {
         translate.y -= TRANSLATE_AMOUNT;
         break;
      }
      case "right": {
         translate.x += TRANSLATE_AMOUNT;
         break;
      }
      case "down": {
         translate.y += TRANSLATE_AMOUNT;
         break;
      }
      case "left": {
         translate.x -= TRANSLATE_AMOUNT;
         break;
      }
   }

   updateTransform();
}

type zoomDirection = "in" | "out";
const zoomBoard = (dir: zoomDirection): void => {
   const ZOOM_AMOUNT = 0.15;

   switch (dir) {
      case "in": {
         Game.transform.zoom *= 1 + ZOOM_AMOUNT;
         break;
      }
      case "out": {
         Game.transform.zoom /= 1 + ZOOM_AMOUNT;
         break;
      }
   }

   updateTransform();
}

export function keyPress(): void {
   const e = window.event as KeyboardEvent;
   const key = e.key;

   switch (key) {
      case "ArrowUp": {
         translateBoard("up");
         break;
      }
      case "ArrowRight": {
         translateBoard("right");
         break;
      }
      case "ArrowDown": {
         translateBoard("down");
         break;
      }
      case "ArrowLeft": {
         translateBoard("left");
         break;
      }
      case "-":
      case "_": {
         zoomBoard("out");
         break;
      }
      case "+":
      case "=": {
         zoomBoard("in");
         break;
      }
   }
}