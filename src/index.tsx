import React from 'react';
import ReactDOM from 'react-dom';
import Titlescreen from './components/Titlescreen';
import Game from './Game';
import './css/index.css';
import './css/board.css';
import Board from './components/Board';
import ControlPanel from './components/ControlPanel';
import CreatureInspector from './components/CreatureInspector';
import { handleMouse, mouseClick } from './Mouse';
import GraphViewer from './components/GraphViewer';
import { getElem } from './utils';
import { setupGraphs } from './graph-viewer';

ReactDOM.render(
  <React.StrictMode>
    <Titlescreen />
    <ControlPanel />
    <Board />
    <CreatureInspector />
    <GraphViewer />
    <div id="mask" className="hidden"></div>
  </React.StrictMode>,
  document.getElementById("root")
);

export function hideMask(): void {
  getElem("mask").classList.add("hidden");
}

export function showMask(): void {
  getElem("mask").classList.remove("hidden");
}

const setup = (): void => {
  setupGraphs();

  // Start the game loop
  Game.runTick();
};

window.onload = setup;

document.onmousemove = handleMouse;
document.onclick = mouseClick;