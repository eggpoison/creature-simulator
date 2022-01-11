import Entity from "./classes/Entity";
import Game from "./Game";
import { getElem } from "./utils";

export type Cell = Array<Entity>;
export const cells: Array<Cell> = [];

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

export function redrawBoard(): void {
   const previousWidth = cellRows[0].children.length;
   const previousHeight = cellRows.length;

   const width = Game.boardSize.width, height = Game.boardSize.height;

   // Resize the board
   const board = getElem("board");
   const boardWidth = width * Game.cellSize;
   board.style.width = `${boardWidth}px`;
   const boardHeight = height * Game.cellSize;
   board.style.height = `${boardHeight}px`;

   if (previousWidth !== width) {
      if (width > previousWidth) {
         // Create more cells in each row

         const newCellAmount = width - previousWidth;
         for (let i = 0; i < newCellAmount; i++) {
            cellRows.forEach((row, j) => {
               const cellIndex = (previousWidth + i) * (j + 1) + j;
               
               const cellObj = createCell();
               row.appendChild(cellObj);
               if ((i + j) % 2 === 0) {
                  cellObj.classList.add("cell-1");
               } else {
                  cellObj.classList.add("cell-2");
               }
               
               const cell: Cell = new Array<Entity>();
               cells.splice(cellIndex, 0, cell);
            });
         }
      } else {
         // Remove cells from each row

         const cellRemoveAmount = previousWidth - width;
         for (let i = 0; i < cellRemoveAmount; i++) {
            for (let j = 0; j < previousWidth; j++) {
               const cellIndex = (previousWidth - i - 1) * (j + 1);
               const cell = cells[cellIndex];
               for (const entity of cell) {
                  entity.die();
               }
               cells.splice(cellIndex, 1);
   
               const cellObj = cellRows[j].children[previousWidth - i - 1];
               cellObj.remove();
            }
         }
      }
   }

   if (previousHeight !== height) {
      if (height > previousHeight) {
         // Create rows

         const newCellAmount = height - previousHeight;
         for (let i = 0; i < newCellAmount; i++) {
            const row = createCellRow();
            board.appendChild(row);
            cellRows.push(row);

            for (let j = 0; j < width; j++) {
               const cellIndex = width * (height + i - 1) + j;

               const cellObj = createCell();
               row.appendChild(cellObj);
               if ((i + j) % 2 === 0) {
                  cellObj.classList.add("cell-1");
               } else {
                  cellObj.classList.add("cell-2");
               }

               const cell: Cell = new Array<Entity>();
               cells.splice(cellIndex, 0, cell);
            }
         }
      } else {
         // Remove rows

         const removeCount = previousHeight - height;
         for (let i = 0; i < removeCount; i++) {
            const rowElem = cellRows[previousHeight - i - 1];
            rowElem.remove();

            const startIndex = width * (previousHeight - i - 1) - 1;
            for (let j = 0; j < width; j++) {
               const cell = cells[startIndex + j];
               for (const entity of cell) {
                  entity.die();
               }
            }

            cells.splice(startIndex, width);
         }
      }
   }
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