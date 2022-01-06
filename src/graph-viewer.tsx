import ReactDOM from 'react-dom';
import { creatureGeneInfo } from './classes/Creature';
import Graph, { GraphSettings } from './classes/Graph';
import { geneSamples } from './Game';
import { hideMask, showMask } from './index';
import { getElem } from './utils';

let graphOptions: Array<GraphOption> = new Array<GraphOption>();

export let graphViewerIsVisible: boolean = false;


type settingType = "checkbox" | "range";
interface Setting {
   name: string;
   type: settingType;
   description?: string;
   isChecked?: boolean;
   value?: number;
}
const settings: ReadonlyArray<Setting> = [
   {
      name: "Extrapolate values",
      type: "checkbox",
      description: "Reduces the amount of nodes rendered, will probably reduce lag in extreme scenarios."
   },
   {
      name: "Show points",
      type: "checkbox"
   },
   {
      name: "Show lines",
      type: "checkbox"
   }
];

const selectSetting = (setting: Setting, settingElemClass: string): void => {
   const graphViewer = getElem("graph-viewer") as HTMLElement;
   const elem = graphViewer.querySelector("." + settingElemClass) as HTMLElement;

   const isSelected = elem.classList.contains("selected");
   if (isSelected) {
      elem.classList.remove("selected");
   } else {
      elem.classList.add("selected");
   }
   const input = elem.querySelector("input") as HTMLInputElement;
   input.checked = !isSelected;

   if (setting.type === "checkbox") {
      setting.isChecked = !setting.isChecked;
   } else if (setting.type === "range") {
      // setting.value
   }
}

const createSettings = (): void => {
   const graphViewer = getElem("graph-viewer") as HTMLElement;
   const settingsContainer = graphViewer.querySelector(".settings-container");

   const elems: Array<JSX.Element> = settings.map((setting, i) => {
      const elemName: string = `setting-input-${i}`;

      // Create the element
      let elem: JSX.Element;
      switch (setting.type) {
         case "checkbox": {
            elem = <div key={i} className={`option ${elemName}`} onClick={() => selectSetting(setting, elemName)}>
               <input name={elemName} type="checkbox" />
               <label htmlFor={elemName}>{setting.name}</label>
               {setting.description ? 
               <p className="description">{setting.description}</p>
               : ""}
            </div>;
            break;
         }
      }

      return elem!;
   });

   ReactDOM.render(elems, settingsContainer);
}

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
   for (const geneName of Object.keys(creatureGeneInfo)) {
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

   drawGraph();
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

   createSettings();

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

function drawGraph(): void {
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

   const graphContainer = graphViewer.querySelector(".graph-container") as HTMLElement;

   // If no options are selected, display text and leave
   if (options.length === 0) {
      graphContainer.innerHTML = "<p>Your graph will appear here once you choose an option.</p>";
      return;
   }

   // Remove any previous graphs
   graphContainer.innerHTML = "";

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
   
   const graphSettings: GraphSettings = {
      shouldExtrapolate: settings[0].isChecked!
   }

   const graph = new Graph(300, 150, allDataPoints, graphSettings);
   const graphElem = graph.element;
   graphContainer.appendChild(graphElem);
}