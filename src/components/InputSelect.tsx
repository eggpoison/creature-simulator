import React, { useRef, useState } from 'react';

interface InputSelectProps {
   options: ReadonlyArray<string>;
   name: string;
   text: string;
   defaultValue: string;
   func?: Function;
}

const InputSelect = ({ options, name, text, defaultValue, func }: InputSelectProps) => {
   const selectElemRef = useRef<HTMLSelectElement | null>(null);
   const [val, setVal] = useState<string>(defaultValue);

   const htmlName = "_INPUT_" + name;

   const handleChange = (event: any) => {
      const newVal = event.target.value;
      // console.log(event.target.value);
      setVal(newVal);

      if (func) func(newVal);
   }

   return <div className="input-select">
      <label htmlFor={htmlName}>{text}</label>

      {/* <select ref={selectElemRef} value={val} onChange={() => handleChange(selectElemRef.current!.value)}> */}
      <select ref={selectElemRef} value={val} onChange={handleChange}>
         {options.map((option, idx) => {
            return <option key={idx}>{option}</option>;
         })}
      </select>
   </div>;
};

export default InputSelect;
