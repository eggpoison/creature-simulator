import React from 'react';
import '../css/graph-viewer.css';
import '../css/graphs.css';

const GraphViewer = () => {
   return (
      <div id="graph-viewer" className="hidden">
         <h1>View Graphs</h1>
         <div className="formatter">
            <div className="options">
               <h2>Options</h2>
               <div className="options-container">

               </div>
            </div>
            <div className="settings">
               <h2>Settings</h2>
            </div>
         </div>
         <div className="graph-container">

         </div>
         {/* <div className="main">
            <div id="graph-options-container" className="side">
               <h3>Displayed graphs:</h3>
               <div id="graph-options">

               </div>
            </div>
            <div id="graph-container" className="side"></div>
         </div> */}
      </div>
   );
}

export default GraphViewer;
