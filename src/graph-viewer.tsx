import ReactDOM from 'react-dom';
import { creatureAttributeInfo } from './classes/Creature';
import Graph from './classes/Graph';
import { showMask } from './index';
import { getElem } from './utils';

let graphOptions: Array<GraphOption> = new Array<GraphOption>();

interface GraphOption {
   display: string;
   id: string;
}

const createOptions = (): Array<GraphOption> => {
   let options: Array<GraphOption> = [
      {
         display: "Creatures over time",
         id: "creatures"
      },
      {
         display: "Fruit over time",
         id: "fruit"
      }
   ];
   for (const geneName of Object.keys(creatureAttributeInfo)) {
      options.push({
         display: `Creature ${geneName} over time`,
         id: geneName
      });
   }
   return options;
}

const selectOption = (optionClass: string, option: GraphOption): void => {
   const optionElem = getElem("graph-viewer").querySelector("." + optionClass) as HTMLElement;

   const isSelected = optionElem.classList.contains("selected");
   if (isSelected) {
      optionElem.classList.remove("selected");
   } else {
      optionElem.classList.add("selected");

      showGraph(option);
   }
   const optionInput = optionElem.querySelector("input") as HTMLInputElement;
   optionInput.checked = !isSelected;
}

export function setupGraphs(): void {
   graphOptions = createOptions();

   // Create JSX elements
   const optionElems = <>{
      graphOptions.map((option, i) => {
         return <div className={`option option-${i}`} key={i} onClick={() => selectOption(`option-${i}`, option)}>
            <input type="checkbox" name={option.id} onClick={() => showGraph(option)} />
            <label htmlFor={option.id}>{option.display}</label>
         </div>
      })
   }</>;

   ReactDOM.render(optionElems, getElem("graph-options"));
}

export function openGraphViewer(): void {
   showMask();

   getElem("graph-viewer").classList.remove("hidden");
}

function showGraph(option: GraphOption): void {
   new Graph(400, 100);
}