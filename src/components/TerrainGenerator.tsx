import React, { useEffect, useState } from 'react';
import { terrainInfo, BoardGenerator, Terrain, TileType } from '../classes/BoardGenerator';
import InputCheckbox from './InputCheckbox';
import InputSelect from './InputSelect';
import '../css/terrain-generator.css';
import InputText from './InputText';
import Game from '../Game';

let boardGenerator: BoardGenerator;
let currentTerrain: Terrain = terrainInfo.presets[0];
let scale: number = 5;

const generatePreview = (): void => {
   boardGenerator.changeSize(Game.boardSize.width, Game.boardSize.height, true);
   boardGenerator.generateNoise(currentTerrain, scale, true);
}

export function getTiles(): Array<Array<TileType>> {
   return boardGenerator.getTiles();
}

const changeBoardSize = (dimension: "width" | "height", newVal: number): void => {
   Game.boardSize[dimension] = newVal;

   boardGenerator.changeSize(Game.boardSize.width, Game.boardSize.height, false);
   boardGenerator.generateNoise(currentTerrain, scale, false);
}

const TerrainGenerator = () => {
   const [visible, setVisible] = useState(false);

   const toggleTerrainGeneratorVisibility = (isVisible: boolean) => {
      setVisible(isVisible);
   }

   useEffect(() => {
      boardGenerator = new BoardGenerator(Game.boardSize.width, Game.boardSize.height, 16);
      boardGenerator.generateNoise(terrainInfo.presets[0], scale, true);
   }, []);

   const presetNames = terrainInfo.presets.map(preset => preset.name);

   const onPresetChange = (newPresetName: string) => {
      for (const currentPreset of terrainInfo.presets) {
         if (currentPreset.name === newPresetName) {
            currentTerrain = currentPreset;
            boardGenerator.changeSize(Game.boardSize.width, Game.boardSize.height, true);
            boardGenerator.generateNoise(currentPreset, scale, true);
            break;
         }
      }
   }

   return <div id="terrain-generator">
      <h2 className="subheading">Terrain Generation</h2>

      <InputCheckbox name="show-terrain-generator-checkbox" text="Advanced terrain generation" defaultValue={false} func={toggleTerrainGeneratorVisibility} />

      <InputText func={newVal => changeBoardSize("width", newVal)} text="Width" defaultValue={15} maxVal={100} />
      <InputText func={newVal => changeBoardSize("height", newVal)} text="Height" defaultValue={15} maxVal={100} />

      <InputText func={newVal => scale = newVal} text="Scale" defaultValue={5} minVal={2} maxVal={20} />

      {!visible ? <>
         <InputSelect options={presetNames} name="terrain-preset-options" text="Presets:" defaultValue={terrainInfo.presets[0].name} func={onPresetChange} />
      </> : 
      <>

      </>}

      <button onClick={generatePreview}>Regenerate</button>
      <div id="board-preview-container"></div>
   </div>;
};

export default TerrainGenerator;