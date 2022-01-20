import React, { useEffect } from 'react';
import Creature, { createCreature } from '../classes/Creature';
import Entity from '../classes/Entity';
import Fruit, { createFruit } from '../classes/Fruit';
import "../css/control-panel.css";
import Game from '../Game';
import { getElem, roundNum } from '../utils';
import InputCheckbox from './InputCheckbox';
import InputRange from './InputRange';

export let updateControlPanel: Function;

const createCreatures = (amount: number): void => {
   for (let i = 0; i < amount; i++) createCreature();
}
const createFruits = (amount: number): void => {
   for (let i = 0; i < amount; i++) {
      createFruit();
   }
}

const changeDarkMode = (newVal: boolean): void => {
   if (newVal) {
      document.body.classList.add("dark-mode");
   } else {
      document.body.classList.remove("dark-mode");
   }
}

const changeTimewarp = (newVal: number) => {
   Game.timewarp = newVal;
}

const changeDebugOutputMode = (newVal: boolean) => {
   Game.settings.showDebugOutput = newVal;
}

const expandControlPanel = (): void => {
   const controlPanel = getElem("control-panel") as HTMLElement;
   controlPanel.classList.remove("hidden");
   const expandIcon = getElem("expand-icon") as HTMLElement;
   expandIcon.classList.add("hidden");
}
const collapseControlPanel = (): void => {
   const controlPanel = getElem("control-panel") as HTMLElement;
   controlPanel.classList.add("hidden");
   const expandIcon = getElem("expand-icon") as HTMLElement;
   expandIcon.classList.remove("hidden");
}

const ControlPanel = () => {
   const [, updateState] = React.useState({});
   const forceUpdate = React.useCallback(() => updateState({}), []);

   useEffect(() => {
      updateControlPanel = forceUpdate;
   }, [forceUpdate]);

   return (
      <>
         <div id="expand-icon" className="hidden" onClick={expandControlPanel}>
            <div className="formatter">
               <div className="vertical-bar"></div>
               <div className="horizontal-bar"></div>
            </div>
            <div className="text">Control Panel</div>
         </div>
         <div id="control-panel" className="menu">
            <div className="collapse-icon" onClick={collapseControlPanel}>
               <div className="horizontal-bar"></div>
            </div>

            <h1 className="heading">Control Panel</h1>

            <h2 className="subheading">Settings</h2>

            <InputCheckbox name="dark-mode" text="Dark Mode" defaultValue={true} func={(newVal: boolean) => changeDarkMode(newVal)} />
            <InputCheckbox name="show-debug-output" text="Show Debug Output" defaultValue={false} func={newVal => changeDebugOutputMode(newVal)} />

            { Game.hasStarted ? ( <>
               <button id="open-graph-viewer-button">View Graphs</button>

               <h2 className="subheading">Overview</h2>

               <p>Creatures: {Entity.count(Creature)}</p> 
               <p>Fruit: {Entity.count(Fruit)}</p>
               <p>Time elapsed: {roundNum(Game.ticks / 20, 1)} seconds <i>({Game.ticks} ticks)</i></p>
               
               <h2 className="subheading">Creatures</h2>
               
               <InputRange button="Create" text="Create creatures" min={1} max={10} defaultValue={1} step={1} func={createCreatures} />
               <InputRange button="Create" text="Create fruit" min={5} max={100} defaultValue={5} step={5} func={createFruits} />

               <h2 className="subheading">World</h2>
               
               <InputRange text="Timewarp" min={1} max={10} defaultValue={1} step={1} func={changeTimewarp} hasExtremeMode={true} />
            </> ) : ""}
         </div>
      </>
   );
}

export default ControlPanel;
