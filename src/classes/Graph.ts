import Game from '../Game';
import { GraphOptions } from '../graph-viewer';
import { lerp, roundNum, Vector } from "../utils";

type timeUnits = "seconds" | "minutes";

export interface GraphSettings {
   readonly shouldExtrapolate: boolean;
}

class Graph {
   element: HTMLElement;
   width: number;
   height: number;
   dataPoints: Array<number | null>;
   time = Game.ticks;
   settings: GraphSettings;
   options: GraphOptions;

   minY: number;
   maxY: number;
   
   xAxisMeasurements = 10;
   timeUnit: timeUnits = this.calculateTimeUnit(this.time);

   constructor(width: number, height: number, dataPoints: Array<number | null>, settings: GraphSettings, options: GraphOptions) {
      this.width = width;
      this.height = height;
      this.dataPoints = dataPoints;
      this.settings = settings;
      this.options = options;

      this.minY = this.calculateMinY();
      this.maxY = this.calculateMaxY();

      this.element = this.instantiate();
      
      this.plotData();
      this.createAxes();
      this.createLabels();
   }
   instantiate(): HTMLElement {
      const element = document.createElement("div");
      element.className = "graph";

      element.style.width = this.width + "px";
      element.style.height = this.height + "px";

      return element;
   }

   calculateMinY(): number {
      if (this.options.min) return this.options.min;
      return 0;
   }
   calculateMaxY(): number {
      if (this.options.max) return this.options.max;
      let maxY = 0;
      for (const dataPoint of this.dataPoints) {
         if (dataPoint !== null && dataPoint > maxY) maxY = dataPoint;
      }
      return maxY;
   }

   calculateTimeUnit(time: number): timeUnits {
      const seconds = time / 20;
      if (seconds / this.xAxisMeasurements > 60) {
         return "minutes";
      } else {
         return "seconds";
      }
   }

   drawPoint(pos: Vector, colour: string): void {
      const point = document.createElement("div");
      point.className = "point";
      point.style.backgroundColor = colour;
      this.element.appendChild(point);
      
      point.style.left = pos.x + "px";
      point.style.bottom = pos.y + "px";
   }

   drawLine(previousPos: Vector, pos: Vector, colour: string): void {
      const line = document.createElement("div");
      line.className = "line";
      this.element.appendChild(line);
      
      line.style.left = previousPos.x + "px";
      line.style.bottom = previousPos.y + "px";
      line.style.backgroundColor = colour;
      
      const dist = previousPos.distanceFrom(pos);
      const ang = -previousPos.angleBetween(pos);
      line.style.width = dist + "px";
      line.style.transform = `rotate(${ang}rad)`;
   }

   plotData() {
      let dataPoints: Array<number | null> = new Array<number | null>();
      const EXTRAPOLATION_AMOUNT = 75;
      if (this.settings.shouldExtrapolate && this.dataPoints.length > EXTRAPOLATION_AMOUNT) {
         for (let i = 0; i < EXTRAPOLATION_AMOUNT; i++) {
            const relativeIndex = this.dataPoints.length * i/EXTRAPOLATION_AMOUNT;

            let dataPoint: number | null;
            const remainder = relativeIndex % 1;
            if (remainder === 0) {
               // If data point already exists, use existing value
               dataPoint = this.dataPoints[relativeIndex];
            } else {
               // Otherwise extrapolate
               const floorVal = this.dataPoints[Math.floor(relativeIndex)];
               const ceilVal = this.dataPoints[Math.ceil(relativeIndex)];

               if (floorVal === null && ceilVal === null) {
                  dataPoint = null;
               } else if (floorVal === null && ceilVal !== null) {
                  dataPoint = ceilVal;
               } else if (floorVal !== null && ceilVal === null) {
                  dataPoint = floorVal;
               } else {
                  dataPoint = lerp(floorVal as number, ceilVal as number, remainder);
               }
            }
            dataPoints.push(dataPoint);
         }
      } else {
         dataPoints = this.dataPoints;
      }

      let previousPos: Vector | null = null;
      for (let j = 0; j < dataPoints.length; j++) {
         const dataPoint = dataPoints[j];
         if (dataPoint === null) {
            previousPos = null;
            continue;
         }
         const stepSize = this.width / (dataPoints.length-1);
         
         const pos = new Vector(
            stepSize * j,
            this.height * (dataPoint - this.minY)/(this.maxY - this.minY)
         );

         this.drawPoint(pos, this.options.colour);
         if (j > 0 && previousPos !== null) {
            this.drawLine(previousPos, pos, this.options.colour);
         }

         previousPos = pos;
      }
   }

   createAxisMeasurement(val: number): HTMLElement {
      const measurement = document.createElement("div");
      measurement.className = "measurement";
      this.element.appendChild(measurement);
      const dpp = 1;
      measurement.innerHTML = roundNum(val, dpp).toString();

      return measurement;
   }

   createAxes(): void {
      
      // Time
      for (let i = 0; i < this.xAxisMeasurements; i++) {
         let val = this.time / this.xAxisMeasurements * i / Game.tps;
         if (this.timeUnit === "minutes") val /= 60;
         
         const measurement = this.createAxisMeasurement(val);
         measurement.classList.add("x");
         measurement.style.left = this.width / this.xAxisMeasurements * i * (this.xAxisMeasurements+1)/this.xAxisMeasurements + "px";
      }
      
      const Y_AXIS_MEASUREMENTS = 7;
      for (let i = 0; i < Y_AXIS_MEASUREMENTS; i++) {
         const val = this.minY + i * (this.maxY - this.minY)/(Y_AXIS_MEASUREMENTS-1);
         const measurement = this.createAxisMeasurement(val);
         measurement.classList.add("y");
         measurement.style.bottom = this.height / (Y_AXIS_MEASUREMENTS-1) * i + "px";
      }
   }

   createLabels(): void {
      const xLabel = document.createElement("div");
      xLabel.className = "label x-label";
      this.element.appendChild(xLabel);
      if (this.timeUnit === "seconds") {
         xLabel.innerHTML = "Seconds";
      } else if (this.timeUnit === "minutes") {
         xLabel.innerHTML = "Minutes";
      }

      const yLabel = document.createElement("div");
      yLabel.className = "label y-label";
      this.element.appendChild(yLabel);
      const val = this.options.dependentVariable;
      yLabel.innerHTML = val;
   }
}

export default Graph;