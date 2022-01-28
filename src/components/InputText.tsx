import React, { useEffect, useRef, useState } from 'react';
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
   const [val, setVal] = useState<string>(defaultValue.toString());

   const onInputChange = () => {
      const inputText = (inputRef.current! as HTMLInputElement).value;
      const inputVal = Number(inputText);

      if (func) func(inputVal);
      setVal(inputText);
   }

   useEffect(() => {
      setVal(defaultValue.toString());
   }, [defaultValue]);

   let warningMessage = null;
   const numVal = Number(val);
   if (isNaN(numVal)) {
      warningMessage = "The input must be a valid number.";
   } else if (numVal % 1 !== 0 && !allowDecimals) {
      warningMessage = "The input must be an integer.";
   } else if (minVal && numVal < minVal) {
      warningMessage = `The input cannot be less than ${minVal}.`;
   } else if (maxVal && numVal > maxVal) {
      warningMessage = `The input cannot be greater than ${maxVal}.`;
   }
   
   return (
      <div className="input-text">
         {text ? <span className="text">{text}:</span> : ""}
         <input ref={inputRef} onInput={onInputChange} type="text" value={val} />

         {warningMessage !== null ? 
            <Warning text={warningMessage} />
         : ""}
      </div>
   )
}

export default InputText;
