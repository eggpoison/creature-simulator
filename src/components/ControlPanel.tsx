import React, { useEffect, useRef } from 'react';
import Creature, { createCreature } from '../classes/Creature';
import Entity from '../classes/Entity';
import Fruit from '../classes/Fruit';
import "../css/control-panel.css";
import Game from '../Game';
import { getSuffix, roundNum } from '../utils';
import { openGraphViewer } from '../graph-viewer';

export let updateControlPanel: Function;

const createCreatures = (input: HTMLInputElement): void => {
   const amount = Number(input.value);
   for (let i = 0; i < amount; i++) createCreature();
}

const ControlPanel = () => {
   const creatureCreateAmountRef = useRef(null);
   const creatureCreateInputRef = useRef(null);
   const timewarpRef = useRef(null);

   const [, updateState] = React.useState({});
   const forceUpdate = React.useCallback(() => updateState({}), []);

   useEffect(() => {
      updateControlPanel = forceUpdate;
   }, [forceUpdate]);

   let creatureCreateAmount: HTMLElement | string | null = creatureCreateAmountRef.current;
   if (creatureCreateAmount === null) creatureCreateAmount = "";

   const creatureCreateInputVal = creatureCreateInputRef.current !== null ? Number((creatureCreateInputRef.current as HTMLInputElement).value) : 0;

   const timewarp = timewarpRef.current !== null ? Number((timewarpRef.current as HTMLInputElement).value) : 1;
   Game.timewarp = timewarp;

   return (
      <div id="control-panel">
         <h1>Control Panel</h1>

         {Game.hasStarted ? (
         <>
         <button onClick={openGraphViewer}>View Graphs</button>

         <h2>Overview</h2>
         
         <div className="panel">
            <p>Creatures: {Entity.count(Creature)}</p> 
            <p>Fruit: {Entity.count(Fruit)}</p>
            <p>Time elapsed: {roundNum(Game.ticks / 20, 1)} seconds <i>({Game.ticks} ticks)</i></p>
         </div>
         
         <h2>Creatures</h2>
         
         <div className="panel">
            <p ref={creatureCreateAmountRef}>Create <span>{creatureCreateInputVal}</span> creature{getSuffix(creatureCreateInputVal)}</p>
            <input ref={creatureCreateInputRef} type="range" min="1" max="10" defaultValue="1" step="1" />
            <button onClick={() => createCreatures(creatureCreateInputRef.current!)}>Create creature(s)</button>
         </div>

<h2>World</h2>
         
         <div className="panel">
            <p>Width:</p>
            <p>Height:</p>
            <p>Timewarp: {timewarp}</p>
            <input ref={timewarpRef} type="range" min="0.5" max="10" defaultValue = "1" step="0.1" />
         </div>
         </>
         ) : (
            <p className="notice">Start to view the control panel!</p>
         )}
      </div>
   );
}

export default ControlPanel;
