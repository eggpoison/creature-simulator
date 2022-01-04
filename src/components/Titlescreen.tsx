import React from "react";
import { createConfettis } from "../confetti";
import "../css/titlescreen.css";
import { StartGame } from "../main";

const openSourceCode = () => {
   const githubURL = "https://github.com/eggpoison/creature-simulator";
   window.open(githubURL, '_blank')?.focus();
}

const Titlescreen = () => {
   return (
      <div id="titlescreen">
         <h1>Creature Simulator</h1>
         <div id="title-options-container">
            <button onClick={StartGame}>Start</button>
            <button onClick={() => createConfettis(50)}>Confetti!</button>
            <button>About</button>
            <button onClick={openSourceCode} id="source-code-button">Source Code</button>
         </div>
      </div>
   );
}

export default Titlescreen;