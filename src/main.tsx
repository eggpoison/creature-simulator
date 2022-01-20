import Game from "./Game";
import { getElem } from "./utils";

const cellRows: Array<HTMLElement> = new Array<HTMLElement>();

const createCell = (): HTMLElement => {
   const cellObj = document.createElement("div");
   cellObj.className = "cell";
   return cellObj;
}
const createCellRow = (): HTMLElement => {
   const cellRow = document.createElement("div");
   cellRow.style.height = `${Game.cellSize}px`;
   cellRow.className = "cell-row";
   return cellRow;
}

const createBoard = (): void => {
   const board = getElem("board");
   board.classList.remove("hidden");

   board.style.setProperty("--cell-size", `${Game.cellSize}px`);
   board.style.setProperty("--cell-border-size", `${Game.cellBorderSize}px`);

   const boardWidth = Game.boardSize.width * Game.cellSize;
   board.style.width = `${boardWidth}px`;
   const boardHeight = Game.boardSize.height * Game.cellSize;
   board.style.height = `${boardHeight}px`;

   for (let i = 0; i < Game.boardSize.height; i++) {
      const cellRow = createCellRow();
      board.appendChild(cellRow);
      cellRows.push(cellRow);

      for (let j = 0; j < Game.boardSize.width; j++) {
         const cellObj = createCell();
         cellRow.appendChild(cellObj);

         // Colour the cells in a checkerboard pattern
         if ((i + j) % 2 === 0) {
            cellObj.classList.add("cell-1");
         } else {
            cellObj.classList.add("cell-2");
         }
      }
   }
}

const hideTitleScreen = () => {
   getElem("title-options-container").classList.add("hidden");
}

export function StartGame(): void {
   createBoard();
   
   Game.start();

   hideTitleScreen();
}