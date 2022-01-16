import React, { useRef, useState } from 'react';
import Warning from './Warning';

interface InputTextProps {
   text: string;
   defaultValue: number;
   func?: (newVal: number) => void;
}

const InputText = ({ text, defaultValue, func }: InputTextProps) => {
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
   } else if (val === 0) {
      warningMessage = "You must have an input value.";
   } else if (val % 1 !== 0) {
      warningMessage = "The input must be an integer.";
   }
   
   return (
      <div className="input-text">
         <span className="text">{text}:</span>
         <input ref={inputRef} onInput={onInputChange} type="text" defaultValue={defaultValue} />

         {warningMessage !== null ? 
            <Warning text={warningMessage} />
         : ""}
      </div>
   )
}

export default InputText;
