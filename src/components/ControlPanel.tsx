import { useEffect, useRef } from 'react';
import { createCreatures, setCreatureAmount, setFruitAmount, updateCreatureCreateAmount } from '../control-panel';
import "../css/control-panel.css";

const ControlPanel = () => {
   const creatureCreateAmountRef = useRef(null);
   const creatureCreateInputRef = useRef(null);

   const creatureAmountRef = useRef(null);
   const fruitAmountRef = useRef(null);

   useEffect(() => {
      setCreatureAmount(creatureAmountRef.current!);
      setFruitAmount(fruitAmountRef.current!);
   }, []);

   return (
      <div id="control-panel">
         <h1>Control Panel</h1>

         <h2>Overview</h2>

         <div className="panel">
            <p ref={creatureAmountRef}>Creatures: 0</p> 
            <p ref={fruitAmountRef}>Fruit: 0</p>
         </div>
         
         <h2>Creatures</h2>

         <div className="panel">
            <p ref={creatureCreateAmountRef}>Create <span>1</span> creature</p>
            <input ref={creatureCreateInputRef} onChange={() => updateCreatureCreateAmount(creatureCreateAmountRef.current!, creatureCreateInputRef.current!)} type="range" min="1" max="10" defaultValue="1" step="1" />
            <button onClick={() => createCreatures(creatureCreateInputRef.current!)}>Create creature(s)</button>
         </div>
      </div>
   );
}

export default ControlPanel;
