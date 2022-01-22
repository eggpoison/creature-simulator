import React from 'react';
import { BoardGenerator } from '../classes/BoardGenerator';

let boardGenerator: BoardGenerator;

const generatePreview = (): void => {
   console.log("Started generating noise.");

   if (typeof boardGenerator === "undefined") {
      // boardGenerator = new BoardGenerator(16);
      boardGenerator = new BoardGenerator(2);
   }
   // boardGenerator.drawNoise(360, 360, 15);
   boardGenerator.drawOctaveNoise(180, 180, 10, 2, 2, 0.5);
}

const BoardPreview = () => {
   return <>
      <button onClick={generatePreview}>Generate preview</button>

      <div id="board-preview-container"></div>
   </>;
};

export default BoardPreview;