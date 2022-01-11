import React, { useState } from 'react'
import '../css/start-menu.css';
import { getElem } from '../utils';
import { StartGame } from "../main";

export function openStartMenu(): void {
   getElem("start-menu").classList.remove("hidden");
}

const closeStartMenu = (): void => {
   getElem("start-menu").remove();

   StartGame();
}

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
         content = <>
            <div className="panel">
               <h2>Board Size</h2>
               <p>Width: <input type="text" defaultValue="10" /></p>
               <p>Height: <input type="text" defaultValue="10" /></p>
            </div>

            <p>Fruit spawn rate: <b>1x</b></p>
            <input type="range" min="1" max="10" step="1" defaultValue="1" />

            <button onClick={closeStartMenu}>Start</button>
         </>
         break;
      }
   }

   return (
      <div id="start-menu" className="menu hidden">
         <h1>Settings</h1>
      
         {content!}
      </div>
   )
}

export default StartMenu;
