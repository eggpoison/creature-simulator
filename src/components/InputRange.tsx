import React, { useRef, useState } from 'react';

interface InputRangeProps {
   text: string;
   min: number;
   max: number;
   defaultValue: number;
   step: number;
   func?: (inputVal: number) => unknown;
   button?: string;
   /*** If present, any values above or equal to its value will enable "extreme mode" (purely visual) */
   hasExtremeMode?: boolean;
   prefix?: string;
}

const InputRange = ({ text, min, max, defaultValue, step, func, button, hasExtremeMode, prefix }: InputRangeProps) => {
   const inputRef = useRef(null);
   const [val, setVal] = useState(defaultValue);

   const onInputChange = () => {
      const inputVal = Number((inputRef.current! as HTMLInputElement).value);

      if (func && button === undefined) func(inputVal);
      setVal(inputVal);
   }

   const extremeModeIsEnabled = hasExtremeMode ? val >= max : false;
   const className = `input-range  ${extremeModeIsEnabled ? "extreme" : ""}`;
   return (
      <div className={className}>
         <div className="formatter">
            <div className="text">{text}</div>

            <div>
               <div className="value">{val}{prefix}</div>
               <div className="bar-container">
                  <div className="min">{min}</div>
                  <input ref={inputRef} onInput={onInputChange} type="range" min={min} max={max} step={step} defaultValue={defaultValue} />
                  <div className="max">{max}</div>
               </div>
            </div>
         </div>

         {button ?
         <button onClick={() => {if (func) func(val)}}>{button}</button>
         : ""}
      </div>
   )
}

export default InputRange;
