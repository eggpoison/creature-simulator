import ReactDOM from 'react-dom';
import { creatureAttributeInfo } from './classes/Creature';
import Graph from './classes/Graph';
import { geneSamples } from './Game';
import { hideMask, showMask } from './index';
import { getElem } from './utils';

let graphOptions: Array<GraphOption> = new Array<GraphOption>();

export let graphViewerIsVisible: boolean = false;

interface GraphOption {
   display: string;
   id: string;
}

const createOptions = (): Array<GraphOption> => {
   let options: Array<GraphOption> = [
      {
         display: "Number of creatures",
         id: "creatures"
      },
      {
         display: "Number of fruit",
         id: "fruit"
      }
   ];
   for (const geneName of Object.keys(creatureAttributeInfo)) {
      options.push({
         display: `Creature ${geneName}`,
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
   }
   const optionInput = optionElem.querySelector("input") as HTMLInputElement;
   optionInput.checked = !isSelected;

   if (!isSelected) showGraph();
}

const stopClick = () => {
   const e = window.event;
   e?.stopPropagation();
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
            <input onClick={stopClick} type="checkbox" name={option.id} />
            <label htmlFor={option.id}>{option.display}</label>
         </div>
      })
   }</>;

   ReactDOM.render(optionElems, optionsContainer);
}

export function closeGraphViewer(): void {
   hideMask();
   getElem("graph-viewer").classList.add("hidden");
   graphViewerIsVisible = false;
}

export function openGraphViewer(): void {
   showMask();
   getElem("graph-viewer").classList.remove("hidden");
   graphViewerIsVisible = true;
}

function showGraph(): void {
   const graphViewer = getElem("graph-viewer") as HTMLElement;
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

   // Remove any previous graphs
   (graphViewer.querySelector(".graph-container") as HTMLElement).innerHTML = "";

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