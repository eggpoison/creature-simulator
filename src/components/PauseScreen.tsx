const PauseScreen = () => {
   return (
      <div id="pause-screen" className="hidden">
         <hgroup>
            <h1>Paused!</h1>
            <h2>Press <span>&lt;space&gt;</span> to unpause.</h2>
         </hgroup>
      </div>
   )
}

export default PauseScreen;