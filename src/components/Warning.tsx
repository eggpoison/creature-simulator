import React from 'react';

interface WarningProps {
   text: string;
}

const Warning = ({ text }: WarningProps) => {
   return (
      <div className="warning">
         <h3>Warning</h3>
         <p>{text}</p>
      </div>
   )
}

export default Warning;
