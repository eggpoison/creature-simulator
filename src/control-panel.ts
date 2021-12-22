import { createCreature } from "./entities/Creature";
import { getSuffix } from "./utils";

export function updateCreatureCreateAmount(creatureCreateAmount: HTMLElement, input: HTMLInputElement): void {
   creatureCreateAmount.innerHTML = `Create <span>${input.value}</span> creature${getSuffix(Number(input.value))}`
}

export function createCreatures(input: HTMLInputElement): void {
   const amount = Number(input.value);
   for (let i = 0; i < amount; i++) createCreature();
}