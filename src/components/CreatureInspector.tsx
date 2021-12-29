import React, { useEffect, useState } from 'react'
import Creature from '../classes/Creature';
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

    return creature === null ? <></> : (
        <div id="creature-inspector">
            <h1>Creature Inspector</h1>
            <h2>Overview</h2>
            <p>Name: {creature.name}</p>
            <p>Age: {Game.ticks - creature.birthTime} ticks ({roundNum((Game.ticks - creature.birthTime) / Game.tps, 1)} seconds)</p>
            <p>Fruit eaten: {creature.stats.fruitEaten}</p>
        </div>
    );
}

export default CreatureInspector;
