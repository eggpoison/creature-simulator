class Graph {
   element: HTMLElement;
   width: number;
   height: number;

   constructor(width: number, height: number) {
      this.element = this.instantiate();

      this.width = width;
      this.height = height;
   }
   instantiate(): HTMLElement {
      const element = document.createElement("div");
      element.className = "graph";

      element.style.width = this.width + "px";
      element.style.height = this.height + "px";

      return element;
   }
}

export default Graph;