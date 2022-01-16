import ReactDOM from 'react-dom';
import { creatureGeneInfo } from './classes/Creature';
import Graph, { GraphSettings } from './classes/Graph';
import InputCheckbox from './components/InputCheckbox';
import { geneSamples } from './Game';
import { hideMask, showMask } from './index';
import { getElem } from './utils';

let graphOptions: Array<GraphOptions> = new Array<GraphOptions>();

export let graphViewerIsVisible: boolean = false;


type settingType = "checkbox" | "range";
interface Setting {
   name: string;
   type: settingType;
   description?: string;
   isChecked?: boolean;
   value?: number;
   defaultValue: boolean | number;
}
export const graphSettingData: ReadonlyArray<Setting> = [
   {
      name: "Extrapolate values",
      type: "checkbox",
      description: "Reduces the amount of nodes rendered, will probably reduce lag in extreme scenarios.",
      defaultValue: false
   },
   {
      name: "Automatically update",
      type: "checkbox",
      defaultValue: true
   },
   {
      name: "Show points",
      type: "checkbox",
      defaultValue: true
   },
   {
      name: "Show lines",
      type: "checkbox",
      defaultValue: true
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
      // TODO: setting.value
   }

   drawGraphs();
}

const createSettings = (): void => {
   const graphViewer = getElem("graph-viewer") as HTMLElement;
   const settingsContainer = graphViewer.querySelector(".settings-container");

   const elems: Array<JSX.Element> = graphSettingData.map((setting, i) => {
      // Create the element
      const elemName: string = `setting-input-${i}`;
      let elem: JSX.Element;
      switch (setting.type) {
         case "checkbox": {
            elem = <div key={i} className={`option ${elemName} ${setting.defaultValue ? "selected" : ""}`} onClick={() => selectSetting(setting, elemName)}>
               <input name={elemName} defaultChecked={setting.defaultValue as boolean} type="checkbox" />
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

const setupSettings = (): void => {
   for (const setting of graphSettingData) {
      if (setting.type === "checkbox") {
         setting.isChecked = setting.defaultValue as boolean;
      }
   }
}

export interface GraphOptions {
   display: string;
   id: string;
   colour: string;
   dependentVariable: string;
}
const createOptions = (): Array<GraphOptions> => {
   let options: Array<GraphOptions> = [
      {
         display: "Number of creatures",
         id: "creatures",
         colour: "#26ff1f",
         dependentVariable: "Creatures"
      },
      {
         display: "Number of fruit",
         id: "fruit",
         colour: "#19c6ff",
         dependentVariable: "Fruit"
      }
   ];
   for (const gene of Object.entries(creatureGeneInfo)) {
      options.push({
         display: `Creature ${gene[1].display}`,
         id: gene[0],
         colour: gene[1].colour,
         dependentVariable: gene[1].display
      });
   }
   return options;
}

let selectedOptions: Array<GraphOptions> = new Array<GraphOptions>();
export function setupGraphs(): void {
   graphOptions = createOptions();

   createSettings();
   setupSettings();

   const graphViewer = getElem("graph-viewer");
   const optionsContainer = graphViewer.querySelector(".options-container");

   // Create JSX elements
   const optionElems = <>{
      graphOptions.map((option, i) => {
         const clickEvent = (isSelected: boolean, elem?: HTMLElement) => {
            if (isSelected) {
               // selectedOptions.push(option);
               selectedOptions.splice(i, 0, option)
            } else {
               const idx = selectedOptions.indexOf(option);
               selectedOptions.splice(idx, 1);
            }

            drawGraphs();
         };

         return <InputCheckbox key={i} name={option.id} text={option.display} defaultValue={false} func={clickEvent} />
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

export function drawGraphs(): void {
   const graphViewer = getElem("graph-viewer") as HTMLElement;
   const graphContainer = graphViewer.querySelector(".graph-container") as HTMLElement;

   // If no options are selected, display text and leave
   if (selectedOptions.length === 0) {
      graphContainer.innerHTML = "<p>Your graph will appear here once you choose an option.</p>";
      return;
   }

   // Remove any previous graphs
   graphContainer.innerHTML = "";
   
   const graphSettings: GraphSettings = {
      shouldExtrapolate: graphSettingData[0].isChecked!
   };

   for (const option of selectedOptions) {
      let dataPoints: Array<number>;
      switch (option.id) { 
         case "creatures":
         case "fruit":
            dataPoints = geneSamples.map(sample => sample[option.id]);
            break;
         default:
            dataPoints = geneSamples.map(sample => sample.genes[option.id]);
      }

      const graph = new Graph(300, 150, dataPoints, graphSettings, option);
      const graphElem = graph.element;
      graphContainer.appendChild(graphElem);
   }
}