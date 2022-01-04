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
               <div className="settings-container">

               </div>
            </div>
         </div>
         <div className="graph-container">
            <p>Your graph will appear here once you choose an option.</p>
         </div>
      </div>
   );
}

export default GraphViewer;
