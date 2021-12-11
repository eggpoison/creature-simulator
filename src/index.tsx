import React from 'react';
import ReactDOM from 'react-dom';
import Titlescreen from './components/Titlescreen';
import Game from './Game';
import './css/index.css';
import './css/board.css';
import { setupTitlescreen } from './start';
import Board from './components/Board';

ReactDOM.render(
  <React.StrictMode>
    <Titlescreen />
    <Board />
  </React.StrictMode>,
  document.getElementById("root")
);

const setup = (): void => {
   setupTitlescreen();

   // Create the game loop
   setInterval(() => Game.runTick(), 1000 / Game.tps);
};

window.onload = setup;