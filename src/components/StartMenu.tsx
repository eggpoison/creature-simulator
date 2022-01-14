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

const StartMenu = () => {
   const [stage, setStage] = useState(0);

   let content: JSX.Element;
   switch (stage) {
      case 0: {
         content = <>
            <button onClick={closeStartMenu}>Use default settings</button>
            <button onClick={() => setStage(stage + 1)}>Customize settings</button>
         </>
         break;
      }
      case 1: {
         let newGameSettings: { [key in keyof GameSettings]?: unknown } = {};

         const startClickEvent = () => {
            updateGameSettings();
            closeStartMenu();
         };

         content = <>
            <h2 className="subheading">Board Size</h2>
            <p>Width: <input type="text" defaultValue="10" /></p>
            <p>Height: <input type="text" defaultValue="10" /></p>

            <h2 className="subheading">Modifiers</h2>
            <InputRange func={(newVal: number) => newGameSettings.fruitSpawnRate = newVal} text="Fruit spawn rate" min={1} max={10} step={1} defaultValue={1} />
            <InputRange func={(newVal: number) => newGameSettings.creatureMutationRate = newVal} text="Creature mutation rate" min={0.5} max={2} step={0.1} defaultValue={1} />

            <h2 className="subheading">Almost over...</h2>
            <button onClick={startClickEvent}>Start</button>
         </>;

         gameSettings = newGameSettings as GameSettings;
         break;
      }
   }

   return (
      <div id="start-menu" className="menu hidden">
         <div className="content">
            <h1 className="heading">Settings</h1>
         
            {content!}
         </div>
      </div>
   )
}

export default StartMenu;
