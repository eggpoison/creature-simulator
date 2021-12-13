import React from "react";
import { createConfettis } from "../confetti";
import "../css/titlescreen.css";
import { StartGame } from "../main";
import Button from "./Button";

const Titlescreen = () => {
   return (
      <div id="titlescreen">
         <h1>Creature Simulator</h1>
         <div id="title-options-container">
            <Button onClick={StartGame}>Start</Button>
            <Button onClick={() => createConfettis(50)}>Confetti!</Button>
            <Button>About</Button>
         </div>
      </div>
   );
}

export default Titlescreen;