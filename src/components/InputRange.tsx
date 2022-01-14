import React, { useRef, useState } from 'react';

interface InputRangeProps {
   text: string;
   min: number;
   max: number;
   defaultValue: number;
   step: number;
   func: (inputVal: number) => unknown;
   button?: string;
}

const InputRange = ({ text, min, max, defaultValue, step, func, button }: InputRangeProps) => {
   const inputRef = useRef(null);
   const [val, setVal] = useState(defaultValue);

   const onInputChange = () => {
      const inputVal = Number((inputRef.current! as HTMLInputElement).value);

      if (button === undefined) func(inputVal);
      setVal(inputVal);
   }

   return (
      <div className="input-range">
         <div className="formatter">
            <div className="text">{text}</div>

            <div>
               <div className="value">{val}</div>
               <input ref={inputRef} onInput={onInputChange} type="range" min={min} max={max} step={step} defaultValue={defaultValue} />
               <div className="min">{min}</div>
               <div className="max">{max}</div>
            </div>
         </div>

         {button ?
         <button onClick={() => func(val)}>{button}</button>
         : ""}
      </div>
   )
}

export default InputRange;
