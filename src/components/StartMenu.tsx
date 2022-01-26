import '../css/start-menu.css';
import { getElem } from '../utils';
import InputRange from './InputRange';
import Game, { defaultGameSettings, GameSettings } from '../Game';
import TerrainGenerator from './TerrainGenerator';
import { useState } from 'react';

export function openStartMenu(): void {
   getElem("start-menu").classList.remove("hidden");
}

const closeStartMenu = (): void => {
   getElem("start-menu").remove();

   Game.start();
}

let newGameSettings: GameSettings = JSON.parse(JSON.stringify(defaultGameSettings));

const startClickEvent = () => {
   Game.settings = newGameSettings;
   closeStartMenu();
};

enum Stages {
   TerrainGeneration = 1,
   Options = 2,
   StartGame = 3
}

const StartMenu = () => {
   const [stage, setStage] = useState(1);

   const advanceStage = (): void => {
      const nextStage = stage + 1;

      if (nextStage === Stages.StartGame) {
         startClickEvent();
      } else {
         setStage(nextStage);
      }
   }

   return (
      <div id="start-menu" className="menu hidden">
         <div className="content">
            <h1 className="heading">Settings</h1>

            {stage === Stages.TerrainGeneration ?
            <TerrainGenerator />
            : ""}
            {stage === Stages.Options ?
            <>
               <h2 className="subheading">Initial Population</h2>
               <InputRange func={newVal => newGameSettings.initialCreatures = newVal} text="Creatures" min={0} max={250} step={5} defaultValue={10} />
               <InputRange func={newVal => newGameSettings.initialFruit = newVal} text="Fruit" min={0} max={500} step={5} defaultValue={50} />

               <h2 className="subheading">Modifiers</h2>
               <InputRange func={newVal => newGameSettings.fruitSpawnRate = newVal} text="Fruit spawn rate" min={0.5} max={5} step={0.5} defaultValue={1} hasExtremeMode={true} prefix="x" />
               <InputRange func={newVal => newGameSettings.creatureMutationRate = newVal} text="Creature mutation rate" min={0.5} max={3} step={0.1} defaultValue={1} hasExtremeMode={true} prefix="x" />
               <InputRange func={newVal => newGameSettings.eggIncubationTime = newVal} text="Egg incubation time" min={0} max={15} step={1} defaultValue={5} hasExtremeMode={true} prefix=" seconds" />

               <h2 className="subheading">Other Stuff</h2>
               <p>How many creatures you want to have.</p>
               <InputRange func={newVal => newGameSettings.equilibrium = newVal} text="Desired equilibrium" min={0} max={250} step={5} defaultValue={20} prefix=" creatures" />
            </>
            : ""}

            <button className="next-button" onClick={advanceStage}>&gt; Next &lt;</button>
         </div>
      </div>
   )
}

export default StartMenu;
