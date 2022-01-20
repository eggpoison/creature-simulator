import '../css/start-menu.css';
import { getElem } from '../utils';
import { StartGame } from "../main";
import InputRange from './InputRange';
import InputText from './InputText';
import Game, { defaultGameSettings, GameSettings } from '../Game';

export function openStartMenu(): void {
   getElem("start-menu").classList.remove("hidden");
}

const closeStartMenu = (): void => {
   getElem("start-menu").remove();

   StartGame();
}

let newGameSettings: GameSettings = JSON.parse(JSON.stringify(defaultGameSettings));

const startClickEvent = () => {
   Game.settings = newGameSettings;
   closeStartMenu();
};

const StartMenu = () => {
   return (
      <div id="start-menu" className="menu hidden">
         <div className="content">
            <h1 className="heading">Settings</h1>
         
            <h2 className="subheading">Board Size</h2>
            <p>Adjust the size of the environment.</p>
            <InputText func={newVal => Game.boardSize.width = newVal} text="Width" defaultValue={15} limit={100} />
            <InputText func={newVal => Game.boardSize.height = newVal} text="Height" defaultValue={15} limit={100} />

            <h2 className="subheading">Initial Population</h2>
            <InputRange func={newVal => newGameSettings.initialCreatures = newVal} text="Creatures" min={0} max={100} step={1} defaultValue={10} />
            <InputRange func={newVal => newGameSettings.initialFruit = newVal} text="Fruit" min={0} max={500} step={5} defaultValue={50} />

            <h2 className="subheading">Modifiers</h2>
            <InputRange func={newVal => newGameSettings.fruitSpawnRate = newVal} text="Fruit spawn rate" min={0.5} max={5} step={0.5} defaultValue={1} hasExtremeMode={true} />
            <InputRange func={newVal => newGameSettings.creatureMutationRate = newVal} text="Creature mutation rate" min={0.5} max={3} step={0.1} defaultValue={1} hasExtremeMode={true} />

            <h2 className="subheading">Other Stuff</h2>
            <p>I couldn't figure out where to put these so now this is here.</p>
            <InputRange func={newVal => newGameSettings.equilibrium = newVal} text="Desired equilibrium" min={0} max={100} step={5} defaultValue={20} />

            <button onClick={startClickEvent}>Start</button>
         </div>
      </div>
   )
}

export default StartMenu;
