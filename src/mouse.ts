import Creature from "./classes/Creature";
import { createHoverBox, getElem, Vector } from "./utils";
import { closeInspector, openInspector } from "./creature-inspector";
import { closeGraphViewer, graphViewerIsVisible, openGraphViewer } from "./graph-viewer";
import Game from "./Game";

const MIN_HOVER_DISTANCE = 50;
let hoverBox: HTMLElement | null = null;
let closestCreature: Creature | null = null;

const highlight = (creature: Creature): void => {
   creature.element.classList.add("highlighted");
}

const removePreviousHighlight = (): void => {
   document.querySelector(".creature.highlighted")?.classList.remove("highlighted");
}

export function handleMouse(event: MouseEvent): void {
   const board = getElem("board");
   if (event.composedPath().includes(board)) {
      const boardBounds = board.getBoundingClientRect();
      updateMouse(event.clientX - boardBounds.x, event.clientY - boardBounds.y);
   }

}

export function updateMouse(mouseX: number, mouseY: number): void {
   const mult = 900 / 534;
   const mousePos = new Vector(mouseX * mult, mouseY * mult);

   closestCreature = null;
   let distanceToClosestCreature = MIN_HOVER_DISTANCE;
   for (const cell of Game.board.cells) {
      for (const entity of cell) {
         if (entity instanceof Creature) {
            const dist = mousePos.distanceFrom(entity.position);
            if (dist < distanceToClosestCreature) {
               closestCreature = entity;
               distanceToClosestCreature = dist;
            }
         }
      }
   }

   removePreviousHighlight();

   const board = getElem("board");
   if (closestCreature !== null) {
      highlight(closestCreature);
      const newHoverBox = createHoverBox(closestCreature.name, new Vector(closestCreature.position.x, closestCreature.position.y + 20 + closestCreature.size/2), board);
      // Remove previous hover box if possible
      if (hoverBox !== null && hoverBox !== newHoverBox) {
         hoverBox.remove();
      }
      hoverBox = newHoverBox;

      board.classList.add("highlight");
   } else {
      board.classList.remove("highlight");
      hoverBox?.remove();
      hoverBox = null;
   }
}

export function mouseClick(): void {
   const e = window.event;
   const targetElem = e?.target as HTMLElement;

   if (targetElem.id === "open-graph-viewer-button") {
      openGraphViewer();
   } else if (graphViewerIsVisible) {
      if (e?.composedPath().includes(getElem("graph-viewer"))) return;
      
      closeGraphViewer();
   } else {
      if (closestCreature !== null) {
         openInspector(closestCreature);
      } else {
         closeInspector();
      }
   }
}