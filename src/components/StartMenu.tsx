import React, { useState } from 'react'
import '../css/start-menu.css';
import { getElem } from '../utils';
import { StartGame } from "../main";
import InputRange from './InputRange';

export function openStartMenu(): void {
   getElem("start-menu").classList.remove("hidden");
}

const closeStartMenu = (): void => {
   getElem("start-menu").remove();

   StartGame();
}

const updateGameSettings = (): void => {
   console.log("test");
}

interface GameSettings {
   fruitSpawnRate: number;
   creatureMutationRate: number;
}

let gameSettings: GameSettings;
let newGameSettings: { [key in keyof GameSettings]?: unknown } = {};

const startClickEvent = () => {
   updateGameSettings();
   closeStartMenu();
};

const StartMenu = () => {
   return (
      <div id="start-menu" className="menu hidden">
         <div className="content">
            <h1 className="heading">Settings</h1>
         
            <h2 className="subheading">Board Size</h2>
            <p>Width: <input type="text" defaultValue="10" /></p>
            <p>Height: <input type="text" defaultValue="10" /></p>

            <h2 className="subheading">Modifiers</h2>
            <InputRange func={(newVal: number) => newGameSettings.fruitSpawnRate = newVal} text="Fruit spawn rate" min={1} max={5} step={1} defaultValue={1} extremeModeCutoff={5} />
            <InputRange func={(newVal: number) => newGameSettings.creatureMutationRate = newVal} text="Creature mutation rate" min={0.5} max={2} step={0.1} defaultValue={1} extremeModeCutoff={2} />

            <h2 className="subheading">Almost over...</h2>
            <button onClick={startClickEvent}>Start</button>
         </div>
      </div>
   )
}

export default StartMenu;
