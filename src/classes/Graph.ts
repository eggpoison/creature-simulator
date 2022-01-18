import Game, { GeneSampleEntry } from '../Game';
import { GraphOptions } from '../graph-viewer';
import { Colour, lerp, roundNum, Vector } from "../utils";

type timeUnits = "seconds" | "minutes";

export interface GraphSettings {
   readonly shouldExtrapolate: boolean;
}

export type GraphData = Array<GeneSampleEntry | null> | Array<number | null>;
export type GraphType = "simple" | "detailed";
class Graph {
   data: GraphData;

   element: HTMLElement;
   width: number;
   height: number;
   time = Game.ticks;
   settings: GraphSettings;
   options: GraphOptions;

   minY: number;
   maxY: number;
   
   xAxisMeasurements = 10;
   timeUnit: timeUnits = this.calculateTimeUnit(this.time);

   constructor(width: number, height: number, data: GraphData, settings: GraphSettings, options: GraphOptions) {
      this.width = width;
      this.height = height;
      this.data = data;
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
      if (this.options.type === "simple") {
         for (const dataPoint of (this.data as Array<number | null>)) {
            if (dataPoint !== null && dataPoint > maxY) maxY = dataPoint;
         }
      } else if (this.options.type === "detailed") {
         for (const dataPoint of (this.data as Array<GeneSampleEntry | null>)) {
            if (dataPoint !== null && dataPoint.max > maxY) maxY = dataPoint.max;
         }
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

   drawRect(pos: Vector, width: number, height: number, colour: string): void {
      const rect = document.createElement("div");
      rect.className = "rect";
      this.element.appendChild(rect);

      rect.style.width = width + "px";
      rect.style.height = height + "px";
      rect.style.backgroundColor = colour;

      rect.style.left = pos.x + "px";
      rect.style.bottom = pos.y + "px";
   }

   drawTrangle(pos: Vector, width: number, height: number, colour: string, type: "top-left" | "top-right" | "bottom-right" | "bottom-left"): void {
      const triangle = document.createElement("div");
      triangle.className = `triangle ${type}`;
      this.element.appendChild(triangle);

      // triangle.style.width = width + "px";
      // triangle.style.height = height + "px";
      triangle.style.setProperty("--width", height / 2 + "px");
      triangle.style.setProperty("--height", width / 2 + "px");
      triangle.style.setProperty("--colour", colour);
      // triangle.style.backgroundColor = colour;

      triangle.style.left = pos.x + "px";
      triangle.style.bottom = pos.y + "px";
   }

   getData(): GraphData {
      const EXTRAPOLATION_AMOUNT = 75;
      if (!this.settings.shouldExtrapolate || this.data.length <= EXTRAPOLATION_AMOUNT) {
         return this.data;
      }

      let data!: GraphData;
      if (this.options.type === "simple") {
         data = new Array<number | null>();
      } else if (this.options.type === "detailed") {
         data = new Array<GeneSampleEntry | null>();
      }

      for (let i = 0; i < EXTRAPOLATION_AMOUNT; i++) {
         const relativeIndex = this.data.length * i/EXTRAPOLATION_AMOUNT;

         if (this.options.type === "simple") {
            let dataPoint: number | null;

            const remainder = relativeIndex % 1;
            if (remainder === 0) {
               // If data point already exists, use existing value
               dataPoint = this.data[relativeIndex] as number | null;
            } else {
               // Otherwise extrapolate
               const floorVal = this.data[Math.floor(relativeIndex)] as number | null;
               const ceilVal = this.data[Math.ceil(relativeIndex)] as number | null;

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
            (data as Array<number | null>).push(dataPoint);
         } else if (this.options.type === "detailed") {
            let dataPoint: GeneSampleEntry | null;

            const remainder = relativeIndex % 1;
            if (remainder === 0) {
               // If data point already exists, use existing value
               dataPoint = this.data[relativeIndex] as GeneSampleEntry | null;
            } else {
               // Otherwise extrapolate
               const floorVal = this.data[Math.floor(relativeIndex)] as GeneSampleEntry | null;
               const ceilVal = this.data[Math.ceil(relativeIndex)] as GeneSampleEntry | null;

               if (floorVal === null && ceilVal === null) {
                  dataPoint = null;
               } else if (floorVal === null && ceilVal !== null) {
                  dataPoint = ceilVal;
               } else if (floorVal !== null && ceilVal === null) {
                  dataPoint = floorVal;
               } else {
                  dataPoint = {
                     average: lerp(floorVal!.average, ceilVal!.average, remainder),
                     min: lerp(floorVal!.min, ceilVal!.min, remainder),
                     max: lerp(floorVal!.max, ceilVal!.max, remainder),
                     standardDeviation: lerp(floorVal!.standardDeviation, ceilVal!.standardDeviation, remainder)
                  }
               }
            }
            (data as Array<GeneSampleEntry | null>).push(dataPoint);
         }
      }
      return data;
   }

   plotData(): void {
      const data = this.getData();

      if (this.options.type === "simple") {
         this.plotSimpleData(data as Array<number | null>);
      } else if (this.options.type === "detailed") {
         this.plotDetailedData(data as Array<GeneSampleEntry | null>);
      }
   }

   plotSimpleData(data: Array<number | null>): void {
      let previousPos: Vector | null = null;
      for (let i = 0; i < data.length; i++) {
         const dataPoint = data[i];
         if (dataPoint === null) {
            previousPos = null;
            continue;
         }
         const stepSize = this.width / (data.length-1);
         
         const pos = new Vector(
            stepSize * i,
            this.height * (dataPoint - this.minY)/(this.maxY - this.minY)
         );

         this.drawPoint(pos, this.options.colour);
         if (i > 0 && previousPos !== null) {
            this.drawLine(previousPos, pos, this.options.colour);
         }

         previousPos = pos;
      }
   }

   draw(colour: string, stepSize: number, i: number, value: number, previousPos: Vector | null, shouldDrawPoint: boolean): Vector | null {
      const pos = new Vector(
         stepSize * i,
         this.height * (value - this.minY)/(this.maxY - this.minY)
      );

      if (shouldDrawPoint) this.drawPoint(pos, colour);
      if (i > 0 && previousPos !== null) {
         this.drawLine(previousPos, pos, colour);
      }
      return pos;
   }

   plotDetailedData(data: Array<GeneSampleEntry | null>): void {
      const averageColour = new Colour(this.options.colour);

      let stdevColour = averageColour.desaturate(0.3);
      stdevColour = stdevColour.darken(0.2);

      let outerColour = averageColour.desaturate(0.7);
      outerColour = outerColour.darken(0.2);

      const n = data.length;

      let previousAveragePos: Vector | null = null;
      let previousMinPos: Vector | null = null;
      let previousMaxPos: Vector | null = null;
      let previousStdevMinPos: Vector | null = null;
      let previousStdevMaxPos: Vector | null = null;
      for (let i = 0; i < n; i++) {
         const entry = data[i];
         if (entry === null) {
            continue;
         }

         const stepSize = this.width / (n-1);

         previousAveragePos = this.draw(this.options.colour, stepSize, i, entry.average, previousAveragePos, true);

         previousMinPos = this.draw(outerColour.hex, stepSize, i, entry.min, previousMinPos, false);
         previousMaxPos = this.draw(outerColour.hex, stepSize, i, entry.max, previousMaxPos, false);

         const stdevMinPos = this.draw(stdevColour.hex, stepSize, i, entry.average - entry.standardDeviation, previousStdevMinPos, false);
         const stdevMaxPos = this.draw(stdevColour.hex, stepSize, i, entry.average + entry.standardDeviation, previousStdevMaxPos, false);
         if (i > 0 && stdevMinPos !== null && stdevMaxPos !== null && previousStdevMinPos !== null && previousStdevMaxPos !== null) {
            const rectWidth = stdevMinPos.x - previousStdevMinPos.x;
            const height = Math.min(previousStdevMaxPos.y, stdevMaxPos.y) - Math.max(previousStdevMinPos.y, stdevMinPos.y);
            const rectPos = new Vector(
               previousStdevMinPos.x,
               Math.max(previousStdevMinPos.y, stdevMinPos.y)
            );
            this.drawRect(rectPos, rectWidth, height, stdevColour.hex);

            const topTrianglePos = new Vector(previousStdevMaxPos.x, Math.min(stdevMaxPos.y, previousStdevMaxPos.y));
            if (previousStdevMaxPos.y > stdevMaxPos.y) {
               this.drawTrangle(topTrianglePos, rectWidth, previousStdevMaxPos.y - stdevMaxPos.y, stdevColour.hex, "bottom-left");
            } else {
               this.drawTrangle(topTrianglePos, rectWidth, stdevMaxPos.y - previousStdevMaxPos.y, stdevColour.hex, "bottom-right");
            }
            
            const bottomTrianglePos = new Vector(previousStdevMaxPos.x, Math.min(stdevMinPos.y, previousStdevMinPos.y));
            if (previousStdevMinPos.y > stdevMinPos.y) {
               this.drawTrangle(bottomTrianglePos, rectWidth, previousStdevMinPos.y - stdevMinPos.y, stdevColour.hex, "top-right");
            } else {
               this.drawTrangle(bottomTrianglePos, rectWidth, stdevMinPos.y - previousStdevMinPos.y, stdevColour.hex, "top-left");
            }
         }
         
         previousStdevMaxPos = stdevMaxPos;
         previousStdevMinPos = stdevMinPos;
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