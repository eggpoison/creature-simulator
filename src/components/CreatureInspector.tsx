import React, { useEffect, useState } from 'react'
import Creature, { creatureGeneInfo } from '../classes/Creature';
import { setInspectorRerenderFunction, setUpdateFunction } from '../creature-inspector';
import '../css/creature-inspector.css';
import Game from '../Game';
import { roundNum } from '../utils';

const CreatureInspector = () => {
    const [creature, setCreature] = useState<Creature | null>(null);

    const [, updateState] = React.useState({});
    const forceUpdate = React.useCallback(() => updateState({}), []);

    useEffect(() => {
        setUpdateFunction((newCreature: Creature | null) => {
            setCreature(newCreature);
        });
        setInspectorRerenderFunction(() => forceUpdate());
    }, [forceUpdate]);

    const geneInfo: JSX.Element = creature === null ? <></> : <> {
        Object.entries(creatureGeneInfo).map((geneInfo, i) => {
            const gene = geneInfo[1], geneName = geneInfo[0];
            const val = creature[geneName];
            const fillWidth = (val - gene.min) / (gene.max - gene.min) * 100;
            const fillOpacity = 0.5 + (val - gene.min) / (gene.max - gene.min) / 2;
            
            return <div key={i} className="gene">
                <div className="label">{gene.display}</div>
                <div className="slider">
                    <div style={{ width: fillWidth + "%", opacity: fillOpacity, backgroundColor: gene.colour }} className="slider-fill"></div>
                    <div className="min">{gene.min}</div>
                    <div className="val">{val}</div>
                    <div className="max">{gene.max}</div>
                </div>
            </div>
        })
    } </>

    return creature === null ? <></> : (
        <div id="creature-inspector">
            <h1>Creature Inspector</h1>

            <h2>General</h2>
            <div className="panel">
                <p>Name: {creature.name}</p>
                <p>Age: {Game.ticks - creature.birthTime} ticks ({roundNum((Game.ticks - creature.birthTime) / Game.tps, 1)} seconds)</p>
            </div>

            <h2>Stats</h2>
            <div className="panel">
                <p>Generation: {creature.stats.generation}</p>
                <p>Fruit eaten: {creature.stats.fruitEaten}</p>
            </div>

            <h2>Genes</h2>
            <div className="panel">
                {geneInfo}
            </div>
        </div>
    );
}

export default CreatureInspector;
