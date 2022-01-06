import Game from '../Game';
import { lerp, roundNum, Vector } from "../utils";

type timeUnits = "seconds" | "minutes";

export interface GraphSettings {
   readonly shouldExtrapolate: boolean;
}

export type dataPointArray = {
   readonly colour: string;
   readonly dataPoints: Array<number>;
}

class Graph {
   element: HTMLElement;
   width: number;
   height: number;
   allDataPoints: Array<dataPointArray>;
   time = Game.ticks;
   settings: GraphSettings;
   
   maxYHeight = 0.9;
   xAxisMeasurements = 10;
   timeUnit: timeUnits = this.calculateTimeUnit(this.time);

   constructor(width: number, height: number, allDataPoints: Array<dataPointArray>, settings: GraphSettings) {
      this.width = width;
      this.height = height;
      this.allDataPoints = allDataPoints;
      this.settings = settings;

      this.element = this.instantiate();
      
      this.plotData();

      this.createAxes();
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
      // const colours = ["red", "green", "purple", "aqua", "yellow"];

      this.allDataPoints.forEach((dataPointArray, i) => {
         const dataPoints = dataPointArray.dataPoints, colour = dataPointArray.colour;

         let dataMaxY = 0;
         for (const dataPoint of dataPoints) {
            if (dataPoint > dataMaxY) dataMaxY = dataPoint;
         }

         const EXTRAPOLATION_AMOUNT = 75;
         if (this.settings.shouldExtrapolate && dataPoints.length > EXTRAPOLATION_AMOUNT) {
            let previousPos: Vector = new Vector(0, 0);
            for (let j = 0; j < EXTRAPOLATION_AMOUNT; j++) {
               const relativeIndex = dataPoints.length * j/EXTRAPOLATION_AMOUNT;

               let dataPoint: number;
               const remainder = relativeIndex % 1;
               if (remainder === 0) {
                  // If data point already exists, use existing value
                  dataPoint = dataPoints[relativeIndex];
               } else {
                  // Otherwise extrapolate
                  const floorVal = dataPoints[Math.floor(relativeIndex)];
                  const ceilVal = dataPoints[Math.ceil(relativeIndex)];

                  dataPoint = lerp(floorVal, ceilVal, remainder);
               }
               
               const stepSize = this.width / EXTRAPOLATION_AMOUNT;
               const pos = new Vector(
                  stepSize * j,
                  dataPoint / dataMaxY * this.height * this.maxYHeight
               );

               this.drawPoint(pos, colour);
               if (j > 0) {
                  this.drawLine(previousPos, pos, colour);
               }
               
               previousPos = pos;
            }
         } else {
            let previousPos: Vector = new Vector(0, 0);
            for (let j = 0; j < dataPoints.length; j++) {
               const dataPoint = dataPoints[j];
               const stepSize = this.width / dataPoints.length;
               
               const pos = new Vector(
                  stepSize * j,
                  dataPoint / dataMaxY * this.height * this.maxYHeight
               );

               this.drawPoint(pos, colour);
               if (j > 0) {
                  this.drawLine(previousPos, pos, colour);
               }

               previousPos = pos;
            }
         }
      });
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

      // TIME
      for (let i = 0; i < this.xAxisMeasurements; i++) {
         let val = this.time / this.xAxisMeasurements * i / Game.tps;
         if (this.timeUnit === "minutes") val /= 60;

         const measurement = this.createAxisMeasurement(val);
         measurement.classList.add("x");
         measurement.style.left = this.width / this.xAxisMeasurements * i + "px";
      }

      // VALUES
      let dataMaxY = 0;
      for (const dataPoint of this.allDataPoints[0].dataPoints) {
         if (dataPoint > dataMaxY) dataMaxY = dataPoint;
      }
      for (let i = 0; i < Y_AXIS_MEASUREMENTS; i++) {
         const val = dataMaxY / Y_AXIS_MEASUREMENTS * i;
         const measurement = this.createAxisMeasurement(val);
         measurement.classList.add("y");
         measurement.style.bottom = this.height / Y_AXIS_MEASUREMENTS * i * this.maxYHeight + "px";
      }
   }
}

export default Graph;