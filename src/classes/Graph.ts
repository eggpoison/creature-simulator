import Game from '../Game';
import { GraphOptions } from '../graph-viewer';
import { lerp, roundNum, Vector } from "../utils";

type timeUnits = "seconds" | "minutes";

export interface GraphSettings {
   readonly shouldExtrapolate: boolean;
}

export type dataPointArray = {
   readonly options: GraphOptions;
   readonly dataPoints: Array<number>;
}

class Graph {
   element: HTMLElement;
   width: number;
   height: number;
   dataPoints: ReadonlyArray<number>;
   time = Game.ticks;
   settings: GraphSettings;
   options: GraphOptions;
   
   xAxisMeasurements = 10;
   timeUnit: timeUnits = this.calculateTimeUnit(this.time);

   constructor(width: number, height: number, dataPoints: ReadonlyArray<number>, settings: GraphSettings, options: GraphOptions) {
      this.width = width;
      this.height = height;
      this.dataPoints = dataPoints;
      this.settings = settings;
      this.options = options;

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
      let maxY = 0;
      for (const dataPoint of this.dataPoints) {
         if (dataPoint > maxY) maxY = dataPoint;
      }

      const EXTRAPOLATION_AMOUNT = 75;
      if (this.settings.shouldExtrapolate && this.dataPoints.length > EXTRAPOLATION_AMOUNT) {
         let previousPos: Vector = new Vector(0, 0);
         for (let j = 0; j < EXTRAPOLATION_AMOUNT; j++) {
            const relativeIndex = this.dataPoints.length * j/EXTRAPOLATION_AMOUNT;

            let dataPoint: number;
            const remainder = relativeIndex % 1;
            if (remainder === 0) {
               // If data point already exists, use existing value
               dataPoint = this.dataPoints[relativeIndex];
            } else {
               // Otherwise extrapolate
               const floorVal = this.dataPoints[Math.floor(relativeIndex)];
               const ceilVal = this.dataPoints[Math.ceil(relativeIndex)];

               dataPoint = lerp(floorVal, ceilVal, remainder);
            }
            
            const stepSize = this.width / EXTRAPOLATION_AMOUNT;
            const pos = new Vector(
               stepSize * j,
               this.height * dataPoint/maxY
            );

            this.drawPoint(pos, this.options.colour);
            if (j > 0) {
               this.drawLine(previousPos, pos, this.options.colour);
            }
            
            previousPos = pos;
         }
      } else {
         let previousPos: Vector = new Vector(0, 0);
         for (let j = 0; j < this.dataPoints.length; j++) {
            const dataPoint = this.dataPoints[j];
            const stepSize = this.width / this.dataPoints.length;
            
            const pos = new Vector(
               stepSize * j,
               this.height * dataPoint/maxY
            );

            this.drawPoint(pos, this.options.colour);
            if (j > 0) {
               this.drawLine(previousPos, pos, this.options.colour);
            }

            previousPos = pos;
         }
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
      const Y_AXIS_MEASUREMENTS = 10;

      // Time
      for (let i = 0; i < this.xAxisMeasurements; i++) {
         let val = this.time / this.xAxisMeasurements * i / Game.tps;
         if (this.timeUnit === "minutes") val /= 60;

         const measurement = this.createAxisMeasurement(val);
         measurement.classList.add("x");
         measurement.style.left = this.width / this.xAxisMeasurements * i * (this.xAxisMeasurements+1)/this.xAxisMeasurements + "px";
      }

      let maxY = 0;
      for (const dataPoint of this.dataPoints) {
         if (dataPoint > maxY) maxY = dataPoint;
      }

      for (let i = 0; i < Y_AXIS_MEASUREMENTS; i++) {
         const val = maxY / (Y_AXIS_MEASUREMENTS-1) * i;
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