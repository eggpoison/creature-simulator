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

interface ColourOption {
   text: string;
   className: string;
   isSelected?: boolean;
}
const CreatureColourSelect = (): JSX.Element => {
   const colourOptions: Array<ColourOption> = [
      {
         text: "Regular",
         className: "regular",
         isSelected: true
      },
      {
         text: "Gene-based",
         className: "gene-based"
      },
      {
         text: "RGB",
         className: "rgb"
      }
   ];
   const [options, setOptions] = useState<Array<ColourOption>>(colourOptions);

   const clickEvent = (option: ColourOption): void => {
      newGameSettings.creatureColour = option.className;
      const newOptionsArray = options.slice();
      for (const currentOption of newOptionsArray) {
         if (currentOption.text === option.text) {
            currentOption.isSelected = true;
         } else if (currentOption.isSelected) {
            currentOption.isSelected = false;
         }
      }
      setOptions(newOptionsArray);
   }

   let selectedOption!: ColourOption;
   for (const option of options) {
      if (option.isSelected) {
         selectedOption = option;
         break;
      }
   }

   return <div className="colour-options">
      <div className="formatter">
         {options.map((option, i) => {
            const className = `option${option.isSelected ? " selected" : ""}`;
            return <div onClick={() => clickEvent(option)} key={i} className={className}>{option.text}</div>
         })}
      </div>

      <div className="preview-caption">Preview</div>
      <div className="creature-preview-container">
         <div className={"creature-preview " + selectedOption.className}></div>
      </div>
   </div>;
}

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

               <h2 className="subheading">Creature Colour</h2>
               <CreatureColourSelect />

               <h2 className="subheading">Modifiers</h2>
               <InputRange func={newVal => newGameSettings.fruitSpawnRate = newVal} text="Fruit spawn rate" min={0.5} max={5} step={0.5} defaultValue={1} hasExtremeMode={true} prefix="x" />
               <InputRange func={newVal => newGameSettings.creatureMutationRate = newVal} text="Creature mutation rate" min={0.5} max={3} step={0.1} defaultValue={1} hasExtremeMode={true} prefix="x" />
               <InputRange func={newVal => newGameSettings.eggIncubationTime = newVal} text="Egg incubation time" min={0} max={15} step={1} defaultValue={5} hasExtremeMode={true} prefix=" seconds" />

               <h2 className="subheading">Other Stuff</h2>
               <InputRange func={newVal => newGameSettings.equilibrium = newVal} text="Desired equilibrium" min={0} max={250} step={5} defaultValue={20} prefix=" creatures" description="How many creatures you want to have." />
               <InputRange text="Tile preference" min={0} defaultValue={defaultGameSettings.tilePreference} max={1} step={0.1} description="How strongly creatures should prefer the biome they were born in." />
            </>
            : ""}

            <button className="next-button" onClick={advanceStage}>&gt; Next &lt;</button>
         </div>
      </div>
   )
}

export default StartMenu;
