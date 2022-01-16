import { useRef, useState } from 'react';

interface InputCheckboxProps {
   name: string;
   text: string;
   defaultValue: boolean;
   func: (inputVal: boolean, elem?: HTMLElement) => void;
}

const InputCheckbox = ({ name, text, defaultValue, func }: InputCheckboxProps) => {
   const inputRef = useRef(null);
   const [val, setVal] = useState(defaultValue);

   const onInputChange = () => {
      const inputVal = !!Number((inputRef.current! as HTMLInputElement).checked);

      func(inputVal, inputRef.current!);
      setVal(inputVal);
   }

   const htmlName = "_INPUT_" + name;

   const className = `input-checkbox ${val ? "selected" : ""}`;
   return (
      <div className={className}>
         <input ref={inputRef} onChange={onInputChange} type="checkbox" id={htmlName} defaultChecked={defaultValue} />
         <label htmlFor={htmlName}>{text}</label>
      </div>
   )
}

export default InputCheckbox;
