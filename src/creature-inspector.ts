import Creature from './classes/Creature';

export let inspectorIsOpen: boolean = false;
export let inspectorCreature: Creature | null = null;

export let updateInspector: Function;
export function setUpdateFunction(func: (creature: Creature | null) => void): void {
    updateInspector = func;
}

export let rerenderInspector: Function;
export function setInspectorRerenderFunction(func: () => void): void {
    rerenderInspector = func;
}

export function openInspector(creature: Creature): void {
    inspectorIsOpen = true;
    inspectorCreature = creature;
    updateInspector(creature);
}

export function closeInspector(): void {
    inspectorIsOpen = false;
    inspectorCreature = null;
    updateInspector(null);
}