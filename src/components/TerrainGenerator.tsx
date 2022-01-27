import React, { useEffect, useRef, useState } from 'react';
import { terrainInfo, BoardGenerator, Terrain, TileType, TerrainLayer } from '../classes/BoardGenerator';
import InputCheckbox from './InputCheckbox';
import InputSelect from './InputSelect';
import InputText from './InputText';
import InputTextRange from './InputTextRange';
import '../css/terrain-generator.css';
import Game from '../Game';
import { randItem } from '../utils';

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

interface LayerThumbnailProps {
   width: number;
   height: number;
   tile: TileType;
   tileName: string;
}
const LayerThumbnail = ({ width, height, tile, tileName }: LayerThumbnailProps): JSX.Element => {
   const canvasRef = useRef<HTMLCanvasElement>(null);

   useEffect(() => {
      const canvas = canvasRef.current!;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      if (tile.thumbnailFunc) {
         const createRenderListener = (): void => {
            tile.thumbnailFunc!(canvas, width, height, createRenderListener);
         }

         Game.createRenderListener(createRenderListener);
      }

      const ctx = canvas.getContext("2d")!;
      const colours = tile.colour;
      if (colours.length === 1) {
         ctx.fillStyle = tile.colour[0];
         ctx.rect(0, 0, width, height);
         ctx.fill();
      } else {
         const resolution = 8;
         const w = width / resolution;
         const h = height / resolution;
         for (let y = 0; y < resolution; y++) {
            for (let x = 0; x < resolution; x++) {
               const colour = randItem(tile.colour) as string;
               ctx.beginPath();
               ctx.fillStyle = colour;
               ctx.rect(x * w, y * h, w, h);
               ctx.fill();
            }
         }
      }
   }, [height, tile, tile.colour, width]);

   return <canvas width={width} height={height} className={`thumbnail ${tileName}`} ref={canvasRef}></canvas>;
}

interface LayerNoiseTypeProps {
   layer: TerrainLayer;
   type: "height" | "temperature";
   changeLevelFunc: (layer: TerrainLayer, type: "height" | "temperature", newVal: [number, number] | null) => void;
   toggleLevelFunc: (type: "height" | "temperature", newEnabled: boolean) => void;
}
const LayerNoiseType = ({ layer, type, changeLevelFunc, toggleLevelFunc }: LayerNoiseTypeProps): JSX.Element => {
   const [enabled, setEnabled] = useState(typeof layer[type] !== "undefined");
   let defaultVal: [string, string];
   if (typeof layer[type] === "undefined") {
      // not enabled
      defaultVal = ["0", "1"];
   } else if (Array.isArray(layer[type])) {
      // [number, number]
      const layerArr = layer[type] as [number, number];
      defaultVal = [layerArr[0].toString(), layerArr[1].toString()];
   } else {
      // number
      defaultVal = ["0", layer[type]!.toString()];
   }
   const [val, setVal] = useState<[string, string]>(defaultVal);
   
   let text;
   if (type === "height") {
      text = "Height: ";
   } else {
      text = "Temperature: ";
   }

   const toggleEnable = (): void => {
      const newVal = !enabled;
      toggleLayerLevel(type, newVal);
      setEnabled(newVal);

      if (!newVal) {
         setVal(["0", "1"]);
      }
   }

   const changeLayerLevel = (type: "height" | "temperature", newVal: [minVal: string, maxVal: string]): void => {
      const minVal = parseFloat(newVal[0]);
      const maxVal = parseFloat(newVal[1]);
      if (!isNaN(minVal) && !isNaN(maxVal)) {
         changeLevelFunc(layer, type, enabled ? [minVal, maxVal] : null);
      }

      setVal(newVal);
   }

   const toggleLayerLevel = (type: "height" | "temperature", newEnabled: boolean): void => {
      toggleLevelFunc(type, newEnabled);
   }

   let className = "layer-noise-type";
   if (enabled) {
      className += " enabled";
   }
   return <div className={className}>
      <input type="checkbox" checked={enabled} onChange={toggleEnable} />
      <InputTextRange func={([minVal, maxVal]) => changeLayerLevel(type, [minVal, maxVal])} text={text} minValLimit={0} maxValLimit={1} minVal={val[0]} maxVal={val[1]} />
   </div>
}

interface LayerProps {
   layer: TerrainLayer;
   id: number;
   changeTypeFunc: (layer: TerrainLayer, layerID: string) => void;
   changeLevelFunc: (layer: TerrainLayer, type: "height" | "temperature", newVal: [number, number] | null) => void;
   toggleLevelFunc: (layer: TerrainLayer, type: "height" | "temperature", newEnabled: boolean) => void;
   removeFunc: (id: number) => void;
   hasRemoveButton: boolean;
}
const Layer = ({ layer, id, changeTypeFunc: changeFunc, changeLevelFunc, toggleLevelFunc, removeFunc, hasRemoveButton: hasRemoveFunction }: LayerProps): JSX.Element => {
   const tile = terrainInfo.tiles[layer.type];
   const layerName = tile.name;

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

   const toggleLayerLevel = (type: "height" | "temperature", newEnabled: boolean): void => {
      toggleLevelFunc(layer, type, newEnabled);
   }
   
   const tileNames = Object.values(terrainInfo.tiles).map(tile => tile.name);
   const thumbnailSize = 64;
   return <div className="terrain-layer">
      <div className="formatter"></div>
      <LayerThumbnail width={thumbnailSize} height={thumbnailSize} tile={tile} tileName={layer.type} />

      <div>
         <p>Type:
            <select value={layerName} onChange={changeLayerType}>
               {tileNames.map((name, i) => {
                  return <option key={i}>{name}</option>
               })}
            </select>
         </p>

         <LayerNoiseType layer={layer} type="height" changeLevelFunc={changeLevelFunc} toggleLevelFunc={toggleLayerLevel} />
         <LayerNoiseType layer={layer} type="temperature" changeLevelFunc={changeLevelFunc} toggleLevelFunc={toggleLayerLevel} />
      </div>

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

let updateCurrentTerrain: () => void;

interface AdvancedTerrainGeneratorProps {
   terrain: Array<TerrainLayer>;
}
const AdvancedTerrainGenerator = (props: AdvancedTerrainGeneratorProps) => {
   const [layers, setLayers] = useState<Array<TerrainLayer>>(props.terrain);

   updateCurrentTerrain = (): void => {
      const newTerrain: Terrain = {
         name: "",
         noise: ["height", "temperature"],
         terrainLayers: layers
      };
      currentTerrain = Object.assign({}, newTerrain);

      generatePreview();
   }

   const createNewLayer = (): void => {
      const newLayer = newTerrainLayer();

      const newLayersArray = layers.concat([newLayer]);
      setLayers(newLayersArray);
   }
   
   const changeLayerType = (layer: TerrainLayer, newType: string): void => {
      const newLayerArray = layers.slice();
      for (const currentLayer of newLayerArray) {
         if (currentLayer === layer) {
            currentLayer.type = newType;
         }
      }
      setLayers(newLayerArray);
   }

   const changeLayerLevel = (layer: TerrainLayer, type: "height" | "temperature", newVal: [number, number] | null): void => {
      const newLayerArray = layers.slice();
      for (const currentLayer of newLayerArray) {
         if (currentLayer !== layer) continue;

         if (newVal !== null) {
            currentLayer[type] = newVal;
         } else {
            delete currentLayer[type];
         }
      }
      setLayers(newLayerArray);
   }

   const toggleLayerLevel = (layer: TerrainLayer, type: "height" | "temperature", isEnabled: boolean, newVal?: [minVal: number, maxVal: number]): void => {
      const newLayerArray = layers.slice();
      for (const currentLayer of newLayerArray) {
         if (currentLayer !== layer) continue;

         if (isEnabled) {
            currentLayer[type] = [0, 1];
         } else {
            delete currentLayer[type];
         }
      }
      setLayers(newLayerArray);
   }

   const removeLayer = (id: number): void => {
      let newArr = new Array<TerrainLayer>();
      for (let i = 0; i < layers.length; i++) {
         if (i !== id) newArr.push(layers[i]);
      }
      setLayers(newArr);
   }

   console.log(layers);

   return <div id="advanced-terrain-generator">
      <button onClick={createNewLayer}>Create new layer</button>

      {layers.map((layer, i) => <Layer layer={layer} key={i} id={i} changeTypeFunc={changeLayerType} changeLevelFunc={changeLayerLevel} toggleLevelFunc={toggleLayerLevel} removeFunc={removeLayer} hasRemoveButton={layers.length > 1} />)}
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

   const terrain = currentTerrain.terrainLayers;
   return <div id="terrain-generator">
      <h2 className="subheading">Terrain Generation</h2>

      <InputCheckbox func={toggleTerrainGeneratorVisibility} name="show-terrain-generator-checkbox" text="Advanced terrain generation" defaultValue={false} />

      <InputText func={newVal => changeBoardSize("width", newVal)} text="Width" defaultValue={15} maxVal={100} />
      <InputText func={newVal => changeBoardSize("height", newVal)} text="Height" defaultValue={15} maxVal={100} />

      <InputText func={newVal => scale = newVal} text="Scale" defaultValue={5} minVal={2} maxVal={20} />

      {!visible ? <>
         <InputSelect options={presetNames} name="terrain-preset-options" text="Presets:" defaultValue={terrainInfo.presets[0].name} func={onPresetChange} />
         
         <button onClick={generatePreview}>Regenerate</button>
      </> : 
      <>
         <AdvancedTerrainGenerator terrain={terrain} />
         
         <button onClick={() => updateCurrentTerrain()}>Regenerate</button>
      </>}

      <div id="board-preview-container"></div>
   </div>;
};

export default TerrainGenerator;