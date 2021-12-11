import React, { MouseEventHandler } from "react";

interface ButtonProps {
   children: string;
   onClick?: MouseEventHandler;
}

const Button = (props: ButtonProps) => {
   return (
      <button onClick={props.onClick}>
         {props.children}
      </button>
   );
}

export default Button;