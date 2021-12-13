import Game from "../Game";
import { Cell, cells } from "../main";
import { PolarVector, randFloat, randItem, Vector } from "../utils";
import { Entity, EntityAttributes } from "./Entity";

interface CreatureAttributes extends EntityAttributes {
   speed: number;
   vision: number;
}

interface Attribute {
   min: number;
   max: number;
}

const creatureAttributeBounds: { [key: string]: Attribute } = {
   speed: {
      min: 3,
      max: 10
   },
   // Size of the creature in px
   size: {
      min: 10,
      max: 30
   },
   // Vision of the creature in px
   vision: {
      min: 25,
      max: 75
   }
};

const calculateLifespan = (size: number, speed: number, vision: number): number => {
   // Base number of seconds that a creature will live.
   const BASE_LIFESPAN: number = 10;

   let lifespan: number = BASE_LIFESPAN * Game.tps;

   // Larger size increases lifespan, smaller size decreases lifespan
   const SIZE_WEIGHT = 1;
   lifespan *= Math.pow(size / ((creatureAttributeBounds.size.min + creatureAttributeBounds.size.max) / 2), SIZE_WEIGHT);

   // Higher speed decreases lifespan, slower speed increases lifespan
   const SPEED_WEIGHT = 1;
   lifespan *= Math.pow(((creatureAttributeBounds.speed.min + creatureAttributeBounds.speed.max) / 2) / speed, SPEED_WEIGHT);

   // High vision decreases lifespan, low vision increases lifespan
   const VISION_WEIGHT = 1;
   lifespan *= Math.pow(((creatureAttributeBounds.vision.min + creatureAttributeBounds.vision.max) / 2) / vision, VISION_WEIGHT);

   return lifespan;
}

// Generate a random gene in a specified range.
const generateGene = (attribute: Attribute): number => {
   return randFloat(attribute.min, attribute.max);
}

export function createCreature(): void {
   // Generate random attributes for the creature
   let size = generateGene(creatureAttributeBounds.size),
         speed = generateGene(creatureAttributeBounds.speed),
         vision = generateGene(creatureAttributeBounds.vision);

   // Make larger creatures slower
   const SPEED_REDUCTION_MULTIPLIER = 1.1;
   const MAX_REDUCTION = 3;
   const reduction = creatureAttributeBounds.size.max / creatureAttributeBounds.size.min / MAX_REDUCTION;
   speed /= Math.pow(size / creatureAttributeBounds.size.min / reduction, SPEED_REDUCTION_MULTIPLIER);

   const lifespan = calculateLifespan(size, speed, vision);
   const attributes: CreatureAttributes = {
      lifespan: lifespan,
      size: new Vector(size, size),
      speed: speed,
      vision: vision
   };

   // Get a random position for the creature
   const x = randFloat(0, Game.boardSize.width * Game.cellSize);
   const y = randFloat(0, Game.boardSize.height * Game.cellSize);
   const position = new Vector(x, y);

   new Creature(position, attributes)
}

export class Creature extends Entity {
   speed: number;
   vision: number;

   isMoving: boolean;
   targetPosition: Vector | null = null;

   constructor(position: Vector, attributes: CreatureAttributes) {
      super(position, attributes);

      this.speed = attributes.speed;
      this.vision = attributes.vision;

      this.isMoving = false;
   }

   instantiate(element: HTMLElement): void {
      element.className = "creature";

      element.innerHTML = `
      <div class="shadow"></div>
      `;
      
      element.style.setProperty("--vision-size", `${this.vision}px`);
      element.style.setProperty("--creature-size", `${this.size.x}px`);
   };

   tick(): void {
      super.tick();

      // If the creature has a target position, move to it
      if (this.targetPosition !== null) {
         if (this.hasReachedTargetPosition()) {
            // If it has reached its target, stop moving
            this.reachTargetPosition();
         } else {
            // Otherwise continue moving
            this.moveToTargetPosition();
            return;
         }
      }

      const visionInCells = Math.floor((this.size.x/2 + this.vision) / Game.cellSize) + 1;
      const surroundingCells = super.getSurroundingCells(visionInCells);

      // Chance for the creature to move each second
      const MOVE_CHANCE = 0.95;
      if (Math.random() < MOVE_CHANCE / Game.tps) {
         this.targetPosition = this.findRandomPosition(surroundingCells);
      }
   };

   findRandomPosition(surroundingCells: ReadonlyArray<Cell>): Vector {
      this.isMoving = true;

      // Pick a random surrounding cell
      const targetCell: Cell = randItem(surroundingCells as Array<unknown>) as Cell;

      const cellNumber = cells.indexOf(targetCell);

      return super.randomPositionInCell(cellNumber);
   };

   moveToTargetPosition(): void {
      // Convert from cartesian to polar coordinates
      const angleToTarget = this.position.angleBetween(this.targetPosition!);
      const nextPosition = new PolarVector(this.speed, angleToTarget);

      this.velocity = nextPosition.convertToCartesian();
   };

   hasReachedTargetPosition(): boolean {
      // Use black magic to figure out if the creature is facing towards the target position

      const relativeTargetVec = new Vector(this.position.x - this.targetPosition!.x, this.position.y - this.targetPosition!.y);

      const dotProduct = this.velocity.dot(relativeTargetVec);
      return dotProduct > 0;
   };

   reachTargetPosition(): void {
      this.isMoving = false;

      this.velocity = new Vector(0, 0);

      this.targetPosition = null;
   };
}