import Game from '../Game';
import { roundNum, Vector } from "../utils";

class Graph {
   element: HTMLElement;
   width: number;
   height: number;
   allDataPoints: Array<Array<number>>;
   time = Game.ticks / 20;

   maxYHeight = 0.9;

   constructor(width: number, height: number, allDataPoints: Array<Array<number>>) {
      this.width = width;
      this.height = height;
      this.allDataPoints = allDataPoints;

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

   plotData() {
      const colours = ["red", "green", "purple", "aqua", "yellow"];

      this.allDataPoints.forEach((dataPoints, i) => {
         let dataMaxY = 0;
         for (const dataPoint of dataPoints) {
            if (dataPoint > dataMaxY) dataMaxY = dataPoint;
         }
   
         let previousPos: Vector = new Vector(0, 0);
         for (let i = 0; i < dataPoints.length; i++) {
            const dataPoint = dataPoints[i];
            const stepSize = this.width / dataPoints.length;
   
            const point = document.createElement("div");
            point.className = "point";
            point.style.backgroundColor = colours[i];
            this.element.appendChild(point);
   
            const pos = new Vector(
               stepSize * i,
               dataPoint / dataMaxY * this.height * this.maxYHeight
            );
   
            point.style.left = pos.x + "px";
            point.style.bottom = pos.y + "px";
   
            if (i > 0) {
               const line = document.createElement("div");
               line.className = "line";
               this.element.appendChild(line);
   
               line.style.left = previousPos.x + "px";
               line.style.bottom = previousPos.y + "px";
   
               const dist = previousPos.distanceFrom(pos);
               const ang = -previousPos.angleBetween(pos);
               line.style.width = dist + "px";
               line.style.transform = `rotate(${ang}rad)`;
            }
            previousPos = pos;
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
      const X_AXIS_MEASUREMENTS = 10;
      const Y_AXIS_MEASUREMENTS = 10;

      // TIME
      for (let i = 0; i < X_AXIS_MEASUREMENTS; i++) {
         const val = this.time / X_AXIS_MEASUREMENTS * i;



         const measurement = this.createAxisMeasurement(val);
         measurement.classList.add("x");
         measurement.style.left = this.width / X_AXIS_MEASUREMENTS * i + "px";
      }

      let dataMaxY = 0;
      console.log(this.allDataPoints);
      console.log(this.allDataPoints[0]);
      for (const dataPoint of this.allDataPoints[0]) {
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