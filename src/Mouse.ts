import Creature from "./classes/Creature";
import { cells } from "./main";
import { createHoverBox, getElem, Vector } from "./utils";
import { closeInspector, openInspector } from "./creature-inspector";

const MIN_HOVER_DIST: number = 30;
let hoverBox: HTMLElement | null = null;
let mouse: Vector;
let closestCreature: Creature | null = null;

const highlight = (creature: Creature): void => {
    creature.element.classList.add("highlighted");
}

const removePreviousHighlight = (): void => {
    document.querySelector(".creature.highlighted")?.classList.remove("highlighted");
}

export function handleMouse(event: MouseEvent): void {
    const mouseScreenX = event.clientX;
    const mouseScreenY = event.clientY;

    const board = getElem("board");
    const boardBounds = board.getBoundingClientRect();
    const boardPosX = boardBounds.x;
    const boardPosY = boardBounds.y;

    mouse = new Vector(mouseScreenX - boardPosX, mouseScreenY - boardPosY);
    if (mouse.x < 0 || mouse.x > boardBounds.width || mouse.y < 0 || mouse.y > boardBounds.height) return;

    updateMouse();
}

export function updateMouse(): void {
    if (!mouse) return;

    const board = getElem("board");

    let creatures: Array<Creature> = new Array<Creature>();
    for (const cell of cells) {
        creatures = creatures.concat(cell.filter(entity => entity instanceof Creature) as Array<Creature>);
    }

    closestCreature = null;
    let distanceToClosestCreature = MIN_HOVER_DIST;
    for (const creature of creatures) {
        const dist = mouse.distanceFrom(creature.position) - (creature.size as number)/2;

        if (dist < distanceToClosestCreature) {
            closestCreature = creature;
            distanceToClosestCreature = dist;
        }
    }

    removePreviousHighlight();

    if (closestCreature !== null) {
        highlight(closestCreature);
        const newHoverBox = createHoverBox(closestCreature.name, new Vector(closestCreature.position.x, closestCreature.position.y + 20 + closestCreature.size/2), board);
        // Remove previous hover box if possible
        if (hoverBox !== null && hoverBox !== newHoverBox) {
            hoverBox.remove();
        }
        hoverBox = newHoverBox;

        board.classList.add("highlight");
    } else {
        board.classList.remove("highlight");
        hoverBox?.remove();
        hoverBox = null;
    }
}

export function mouseClick(): void {
    if (closestCreature !== null) {
        openInspector(closestCreature);
    } else {
        closeInspector();
    }
}