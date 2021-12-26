import { Entity } from "./classes/Entity";
import Game from "./Game";
import { getElem } from "./utils";

export type Cell = Array<Entity>;
export const cells: Array<Cell> = [];

const createBoard = (): void => {
   const board = getElem("board");

   board.style.setProperty("--cell-size", `${Game.cellSize}px`);
   board.style.setProperty("--cell-border-size", `${Game.cellBorderSize}px`);

   const boardWidth = Game.boardSize.width * Game.cellSize;
   board.style.width = `${boardWidth}px`;
   const boardHeight = Game.boardSize.height * Game.cellSize;
   board.style.height = `${boardHeight}px`;

   for (let i = 0; i < Game.boardSize.height; i++) {
      const cellRow = document.createElement("div");
      cellRow.style.height = `${Game.cellSize}px`;
      cellRow.className = "cell-row";
      board.appendChild(cellRow);

      for (let j = 0; j < Game.boardSize.width; j++) {
         const cellObj = document.createElement("div");
         cellObj.className = "cell";
         cellRow.appendChild(cellObj);

         // Colour the cells in a checkerboard pattern
         if ((i + j) % 2 === 0) {
            cellObj.classList.add("cell-1");
         } else {
            cellObj.classList.add("cell-2");
         }
   
         const cell: Cell = new Array<Entity>();
         cells.push(cell);
      }
   }
}

const hideTitleScreen = () => {
   getElem("title-options-container").classList.add("hidden");
}

export function StartGame(): void {
   Game.hasStarted = true;

   createBoard();

   hideTitleScreen();
}