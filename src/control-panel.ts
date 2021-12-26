import { createCreature } from "./classes/Creature";
import { getSuffix } from "./utils";

export function updateCreatureCreateAmount(creatureCreateAmount: HTMLElement, input: HTMLInputElement): void {
   creatureCreateAmount.innerHTML = `Create <span>${input.value}</span> creature${getSuffix(Number(input.value))}`
}

export function createCreatures(input: HTMLInputElement): void {
   const amount = Number(input.value);
   for (let i = 0; i < amount; i++) createCreature();
}

let creatureAmountElem: HTMLElement;
let fruitAmountElem: HTMLElement;

export function setCreatureAmount(elem: HTMLElement): void {
   creatureAmountElem = elem;
}
export function setFruitAmount(elem: HTMLElement): void {
   fruitAmountElem = elem;
}

export function updateControlPanel(creatureCount: number, fruitCount: number): void {
   creatureAmountElem.innerHTML = `Creatures: ${creatureCount}`;
   fruitAmountElem.innerHTML = `Fruit: ${fruitCount}`;
}