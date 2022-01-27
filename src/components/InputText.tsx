import React, { useRef, useState } from 'react';
import Warning from './Warning';

interface InputTextProps {
   text?: string;
   defaultValue: number;
   minVal?: number;
   maxVal?: number;
   func?: (newVal: number) => void;
   allowDecimals?: boolean;
}

const InputText = ({ text, defaultValue, func, minVal, maxVal, allowDecimals }: InputTextProps) => {
   const inputRef = useRef(null);
   const [val, setVal] = useState<any>(defaultValue);

   const onInputChange = () => {
      const inputVal = Number((inputRef.current! as HTMLInputElement).value);

      if (func) func(inputVal);
      setVal(inputVal);
   }

   let warningMessage = null;
   if (isNaN(val)) {
      warningMessage = "The input must be a valid number.";
   } else if (val % 1 !== 0 && !allowDecimals) {
      warningMessage = "The input must be an integer.";
   } else if (minVal && val < minVal) {
      warningMessage = `The input cannot be less than ${minVal}.`;
   } else if (maxVal && val > maxVal) {
      warningMessage = `The input cannot be greater than ${maxVal}.`;
   }
   
   return (
      <div className="input-text">
         {text ? <span className="text">{text}:</span> : ""}
         <input ref={inputRef} onInput={onInputChange} type="text" defaultValue={defaultValue} />

         {warningMessage !== null ? 
            <Warning text={warningMessage} />
         : ""}
      </div>
   )
}

export default InputText;
