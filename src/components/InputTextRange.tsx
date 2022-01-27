import React, { useRef } from 'react';
import Warning from './Warning';

interface InputTextRangeProps {
   text: string;
   minValLimit: number;
   maxValLimit: number;
   minVal: any;
   maxVal: any;
   func?: (newVal: [minVal: string, maxVal: string]) => void;
}
const InputTextRange = ({ text, minValLimit, maxValLimit, minVal, maxVal, func }: InputTextRangeProps) => {
   const minValRef = useRef<HTMLInputElement>(null);
   const maxValRef = useRef<HTMLInputElement>(null);

   const minValNum = parseFloat(minVal), maxValNum = parseFloat(maxVal);
   let warningMessage: string | null = null;
   if (isNaN(minValNum) || isNaN(maxValNum)) {
      warningMessage = "The input must be a valid number.";
   } else if (minValNum < minValLimit) {
      warningMessage = `The minimum value cannot be less than ${minValLimit}.`;
   } else if (minValNum > maxValLimit) {
      warningMessage = `The maximum value cannot be greater than ${maxValLimit}.`;
   } else if (minValNum >= maxValNum) {
      warningMessage = "The minimum value must be less than maximum.";
   }

   const onMinChange = () => {
      const newVal = minValRef.current!.value;
      if (func) func([newVal, maxVal]);
   }
   const onMaxChange = () => {
      const newVal = maxValRef.current!.value;
      if (func) func([minVal, newVal]);
   }

   return <div className="input-text-range">
      <div className="text">{text}</div>
      <div className="input-container">
         <input onChange={onMinChange} ref={minValRef} type="text" value={minVal} />
      </div>
      to
      <div className="input-container">
         <input onChange={onMaxChange} ref={maxValRef} type="text" value={maxVal} />
      </div>

      {warningMessage !== null ? 
      <Warning text={warningMessage} />
   : ""}
   </div>;
};

export default InputTextRange;
