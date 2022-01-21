import ReactDOM from 'react-dom';
import { creatureGeneInfo } from './classes/Creature';
import Graph, { GraphData, GraphSettings, GraphType } from './classes/Graph';
import InputCheckbox from './components/InputCheckbox';
import InputRange from './components/InputRange';
import { geneSamples } from './Game';
import { hideMask, showMask } from './index';
import { getElem } from './utils';

export let graphViewerIsVisible: boolean = false;

type settingType = "checkbox" | "range";
interface Setting {
   text: string;
   type: settingType;
   description?: string;
   isChecked?: boolean;
   value?: number;
   min?: number;
   max?: number;
   step?: number;
   defaultValue: boolean | number;
   requirement?: string;
   elem?: JSX.Element;
}
export const graphSettingData: ReadonlyArray<Setting> = [
   {
      text: "Extrapolate values",
      type: "checkbox",
      description: "Reduces the amount of nodes rendered, will significantly reduce lag in extreme scenarios.",
      defaultValue: false
   },
   // {
   //    text: "Max number of points",
   //    type: "range",
   //    description: "The highest number of points, after which values will be extrapolated.",
   //    defaultValue: 50,
   //    min: 50,
   //    max: 100,
   //    step: 5,
   //    requirement: "Extrapolate values"
   // },
   {
      text: "Automatically update",
      type: "checkbox",
      defaultValue: true
   },
   {
      text: "Show points",
      type: "checkbox",
      defaultValue: true
   },
   {
      text: "Show lines",
      type: "checkbox",
      defaultValue: true
   }
];

const createSettings = (): void => {
   const graphViewer = getElem("graph-viewer") as HTMLElement;
   const settingsContainer = graphViewer.querySelector(".settings-container");

   const elems: Array<JSX.Element> = graphSettingData.map((setting, i) => {
      const baseClickEvent = (): void => {
         // Check for any settings which require this one
         for (const settingCheck of graphSettingData) {
            if (settingCheck.requirement === setting.text) {

            }
         }

         drawGraphs();
      }

      let elem: JSX.Element;
      const name = `graph-setting-${i}`;
      switch (setting.type) {
         case "checkbox": {
            const clickEvent = (isSelected: boolean): void => {
               setting.isChecked = isSelected;
               baseClickEvent();
            }

            elem = <InputCheckbox key={i} name={name} text={setting.text} defaultValue={setting.defaultValue as boolean} func={clickEvent} />
            break;   
         }
         case "range": {
            const clickEvent = (newVal: number): void => {
               setting.value = newVal;
               baseClickEvent();
            }

            elem = <InputRange key={i} text={setting.text} defaultValue={setting.defaultValue as number} min={setting.min!} max={setting.max!} step={setting.step!} func={clickEvent} />
            break;
         }
      }
      setting.elem = elem;
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
   type: GraphType;
   min?: number;
   max?: number;
   isSelected?: boolean;
}
let graphOptions: Array<GraphOptions> = [
   {
      display: "Number of creatures",
      id: "creatures",
      colour: "#26ff1f",
      dependentVariable: "Creatures",
      type: "simple"
   },
   {
      display: "Number of fruit",
      id: "fruit",
      colour: "#19c6ff",
      dependentVariable: "Fruit",
      type: "simple"
   },
   {
      display: "Fruit multiplier",
      id: "fruit-multiplier",
      colour: "#31ff2e",
      dependentVariable: "Multiplier",
      type: "simple"
   }
];
const createGraphOptions = (): void => {
   for (const [ geneName, gene ] of Object.entries(creatureGeneInfo)) {
      graphOptions.push({
         display: `Creature ${gene.display}`,
         id: geneName,
         colour: gene.colour,
         dependentVariable: gene.display,
         min: gene.min,
         max: gene.max,
         type: "detailed"
      });
   }
}

let selectedGraphOptions: Array<GraphOptions> = new Array<GraphOptions>();
export function setupGraphs(): void {
   createGraphOptions();
   createSettings();
   setupSettings();

   const graphViewer = getElem("graph-viewer");
   const optionsContainer = graphViewer.querySelector(".options-container");

   const optionElems = <>{
      graphOptions.map((option, i) => {
         const clickEvent = (isSelected: boolean) => {
            option.isSelected = isSelected;
            if (isSelected) {
               let hasInserted = false;
               for (let j = 0; j < selectedGraphOptions.length; j++) {
                  const n = graphOptions.indexOf(selectedGraphOptions[j]);
                  if (n > i) {
                     selectedGraphOptions.splice(j, 0, option)
                     hasInserted = true;
                     break;
                  }
               }
               if (!hasInserted) {
                  selectedGraphOptions.push(option);
               }
            } else {
               const idx = selectedGraphOptions.indexOf(option);
               selectedGraphOptions.splice(idx, 1);
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
   if (selectedGraphOptions.length === 0) {
      graphContainer.innerHTML = "<p>Your graph will appear here once you choose an option.</p>";
      return;
   }

   // Remove any previous graphs
   graphContainer.innerHTML = "";
   
   const graphSettings: GraphSettings = {
      shouldExtrapolate: graphSettingData[0].isChecked!
   };

   for (const graphOptions of selectedGraphOptions) {
      let dataPoints: GraphData;
      if (graphOptions.type === "simple") {
         dataPoints = geneSamples.map(sample => sample[graphOptions.id]);
      } else if (graphOptions.type === "detailed") {
         dataPoints = geneSamples.map(sample => sample.genePool !== null ? sample.genePool[graphOptions.id] : null);
      }

      const aspectRatio = 5/3;
      const width = 350;

      const graph = new Graph(width, width/aspectRatio, dataPoints!, graphSettings, graphOptions);
      graphContainer.appendChild(graph.element);
   }
}