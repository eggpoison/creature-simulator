import ReactDOM from 'react-dom';
import { creatureAttributeInfo } from './classes/Creature';
import Graph from './classes/Graph';
import { geneSamples } from './Game';
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

const selectOption = (optionClass: string): void => {
   const optionElem = getElem("graph-viewer").querySelector("." + optionClass) as HTMLElement;

   const isSelected = optionElem.classList.contains("selected");
   if (isSelected) {
      optionElem.classList.remove("selected");
   } else {
      optionElem.classList.add("selected");

      showGraph();
   }
   const optionInput = optionElem.querySelector("input") as HTMLInputElement;
   optionInput.checked = !isSelected;
}

interface CheckboxReference {
   elem: HTMLInputElement;
   option: GraphOption;
}
let checkboxReferences: Array<CheckboxReference> = new Array<CheckboxReference>();
export function setupGraphs(): void {
   graphOptions = createOptions();

   const graphViewer = getElem("graph-viewer");
   const optionsContainer = graphViewer.querySelector(".options-container");

   // Create JSX elements
   const optionElems = <>{
      graphOptions.map((option, i) => {
         return <div className={`option option-${i}`} key={i} onClick={() => selectOption(`option-${i}`)}>
            <input type="checkbox" name={option.id} />
            <label htmlFor={option.id}>{option.display}</label>
         </div>
      })
   }</>;

   ReactDOM.render(optionElems, optionsContainer);
}

export function openGraphViewer(): void {
   showMask();

   getElem("graph-viewer").classList.remove("hidden");
}

function showGraph(): void {
   const graphViewer = getElem("graph-viewer");
   const optionsContainer = graphViewer.querySelector(".options-container") as HTMLElement;

   if (checkboxReferences.length === 0) {
      checkboxReferences = graphOptions.map((option, i) => {
         return {
            elem: optionsContainer.querySelector(`.option-${i} input`)!,
            option: option
         }
      });
   }

   let options: Array<GraphOption> = new Array<GraphOption>();
   for (const ref of checkboxReferences) {
      if (ref.elem.checked) options.push(ref.option);
   }
   if (options.length === 0) return;

   let allDataPoints: Array<Array<number>> = new Array<Array<number>>();
   for (const option of options) {
      let dataPoints: Array<number>;
      switch (option.id) {
         case "creatures":
         case "fruit":
            dataPoints = geneSamples.map(sample => sample[option.id]);
            break;
         default:
            dataPoints = geneSamples.map(sample => sample.genes[option.id]);
      }
      allDataPoints.push(dataPoints);
   }

   console.log("created graph!");
   const graph = new Graph(300, 150, allDataPoints);
   const graphElem = graph.element;

   const graphContainer = getElem("graph-viewer").querySelector(".graph-container");
   graphContainer?.appendChild(graphElem);
}