import React, { useEffect, useState } from 'react';
import { terrainInfo, BoardGenerator, Terrain, TileType, TerrainLayer } from '../classes/BoardGenerator';
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

interface LayerProps {
   layer: TerrainLayer;
   id: number;
   changeFunc: (layer: TerrainLayer, layerID: string) => void;
   removeFunc: (id: number) => void;
   hasRemoveButton: boolean;
}
const Layer = ({ layer, id, changeFunc, removeFunc, hasRemoveButton: hasRemoveFunction }: LayerProps): JSX.Element => {
   const layerName = terrainInfo.tiles[layer.type].name;

   const changeLayerType = (event: any): void => {
      const newVal = event.target.value;
      
      // Find the layer id
      for (const [layerID, layerInfo] of Object.entries(terrainInfo.tiles)) {
         if (layerInfo.name === newVal) {
            layer.type = layerID;
            changeFunc(layer, layerID);
         }
      }
   }
   
   const tileNames = Object.values(terrainInfo.tiles).map(tile => tile.name);

   return <div className="terrain-layer">
      <p>Type:
         <select value={layerName} onChange={changeLayerType}>
            {tileNames.map((name, i) => {
               return <option key={i}>{name}</option>
            })}
         </select>
      </p>

      {hasRemoveFunction ? 
      <div onClick={() => removeFunc(id)} className="remove-button">x</div>
      : ""}
   </div>;
}

const defaultTerrainLayer: TerrainLayer = {
   type: "grass",
   height: [0, 1]
};

const newTerrainLayer = (): TerrainLayer => {
   return Object.assign({}, defaultTerrainLayer);
}

const AdvancedTerrainGenerator = () => {
   const [layers, setLayers] = useState<Array<TerrainLayer>>([newTerrainLayer()]);

   const createNewLayer = (): void => {
      const newLayer = newTerrainLayer();
      console.log(newLayer);

      const newLayersArray = layers.concat([newLayer]);
      setLayers(newLayersArray);
   }
   
   const changeLayerType = (layer: TerrainLayer, layerID: string) => {
      setLayers(layers.map(currentLayer => {
         return currentLayer === layer ? {...currentLayer, type: layerID} : currentLayer;
      }));
   }

   const removeLayer = (id: number): void => {
      let newArr = new Array<TerrainLayer>();
      for (let i = 0; i < layers.length; i++) {
         if (i !== id) newArr.push(layers[i]);
      }
      setLayers(newArr);
   }

   return <div id="advanced-terrain-generator">
      <button onClick={createNewLayer}>Create new layer</button>

      {layers.map((layer, i) => <Layer layer={layer} key={i} id={i} changeFunc={changeLayerType} removeFunc={removeLayer} hasRemoveButton={layers.length > 1} />)}
   </div>;
};

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
         <AdvancedTerrainGenerator />
      </>}

      <button onClick={generatePreview}>Regenerate</button>
      <div id="board-preview-container"></div>
   </div>;
};

export default TerrainGenerator;