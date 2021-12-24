import Game from "../Game";
import { Cell, cells } from "../main";
import { PolarVector, randFloat, randItem, Vector } from "../utils";
import { Entity, EntityAttributes } from "./Entity";
import { Fruit } from "./Fruit";

interface CreatureAttributes extends EntityAttributes {
   speed: number;
   vision: number;
   reproductiveRate: number;
}

interface AttributeInfo {
   min: number;
   max: number;
   /*** How strongly an attribute is factored into deciding a creature's lifespan  */
   weight: number;
   positivelyAffectsLifespan?: boolean;
}

const creatureAttributeInfo: { [key: string]: AttributeInfo } = {
   speed: {
      min: 3,
      max: 10,
      weight: 1,
      positivelyAffectsLifespan: false
   },
   // Size of the creature in px
   size: {
      min: 10,
      max: 30,
      weight: 1,
      positivelyAffectsLifespan: true
   },
   // Vision of the creature in px
   vision: {
      min: 25,
      max: 75,
      weight: 1,
      positivelyAffectsLifespan: false
   },
   // How quickly the creature gains reproductive urge
   reproductiveRate: {
      min: 0.5,
      max: 2,
      weight: 1
   }
};

const calculateLifespan = (attributes: CreatureAttributes): number => {
   // Base number of seconds that a creature will live.
   const BASE_LIFESPAN: number = 10;

   let lifespan: number = BASE_LIFESPAN * Game.tps;

   for (const attributeInfo of Object.entries(creatureAttributeInfo)) {
      if (!attributeInfo[1].positivelyAffectsLifespan) continue;

      const attributeVal = attributeInfo[0] !== "size" ? attributes[attributeInfo[0]] as number : attributes[attributeInfo[0]].x;

      if (attributeInfo[1].positivelyAffectsLifespan) {
         lifespan *= Math.pow(attributeVal / ((attributeInfo[1].min + attributeInfo[1].max) / 2), attributeInfo[1].weight);
      } else {
         lifespan *= Math.pow(((attributeInfo[1].min + attributeInfo[1].max) / 2) / attributeVal, attributeInfo[1].weight);
      }
   }

   return lifespan;
}

// Generate a random gene in a specified range.
const generateGene = (attributeName: keyof CreatureAttributes): number => {
   const attribute: AttributeInfo = creatureAttributeInfo[attributeName];
   return randFloat(attribute.min, attribute.max);
}

export function createCreature(): void {

   // Generate random attributes for the creature
   let size = generateGene("size"),
      speed = generateGene("speed"),
      vision = generateGene("vision"),
      reproductiveRate = generateGene("reproductiveRate");

   // Make larger creatures slower
   const SPEED_REDUCTION_MULTIPLIER = 1.1;
   const MAX_REDUCTION = 3;
   const reduction = creatureAttributeInfo.size.max / creatureAttributeInfo.size.min / MAX_REDUCTION;
   speed /= Math.pow(size / creatureAttributeInfo.size.min / reduction, SPEED_REDUCTION_MULTIPLIER);

   const attributes: CreatureAttributes = {
      size: new Vector(size, size),
      speed: speed,
      vision: vision,
      reproductiveRate: reproductiveRate
   };
   attributes.lifespan = calculateLifespan(attributes);

   // Get a random position for the creature
   const x = randFloat(0, Game.boardSize.width * Game.cellSize);
   const y = randFloat(0, Game.boardSize.height * Game.cellSize);
   const position = new Vector(x, y);

   new Creature(position, attributes)
}

export class Creature extends Entity {
   speed: number;
   vision: number;
   reproductiveRate: number;

   isMoving: boolean;
   targetPosition: Vector | null = null;
   reproductiveUrge: number = 0;
   partner: Creature | null = null;

   constructor(position: Vector, attributes: CreatureAttributes) {
      super(position, attributes);

      this.speed = attributes.speed;
      this.vision = attributes.vision;
      this.reproductiveRate = attributes.reproductiveRate;

      this.isMoving = false;
   }

   instantiate(element: HTMLElement): void {
      element.className = "creature";

      element.innerHTML = `
      <div class="shadow"></div>

      <div class="life">
         <div class="life-bar"></div>

         </div>
      <div class="reproduction">
         <div class="reproduction-bar"></div>
      </div>
      `;
      
      element.style.setProperty("--vision-size", `${this.vision}px`);
      element.style.setProperty("--creature-size", `${this.size.x}px`);
   };

   get life(): number {
      return (this.lifespan - this.age) / this.lifespan * 100;
   }

   updateLifebar(): void {
      const lifebar = this.element.querySelector(".life-bar") as HTMLElement;
      
      lifebar.style.width = `${this.life}%`;
      // Colour the lifebar a shade of red corresponding to how much life the creature has left
      const color = 155 + this.life;
      lifebar.style.backgroundColor = `rgb(${color}, 0, 0)`;
   };

   updateReproductionBar(): void {
      const reproductionBar = this.element.querySelector(".reproduction-bar") as HTMLElement;
      
      reproductionBar.style.width = `${this.reproductiveUrge}%`;
   };

   get wantsToReproduce(): boolean {
      return this.reproductiveUrge > this.life;
   }

   tick(): void {
      super.tick();

      // Base amount of reproductive urge gained per second
      const BASE_REPRODUCTIVE_RATE = 5;
      this.reproductiveUrge += BASE_REPRODUCTIVE_RATE * this.reproductiveRate / Game.tps;
      this.reproductiveUrge = Math.min(100, this.reproductiveUrge);

      this.updateLifebar();
      this.updateReproductionBar();

      // If the creature has a target position, move to it
      if (this.targetPosition !== null) {
         if (this.hasReachedTargetPosition()) {
            // If it has reached its target, stop moving
            this.reachTargetPosition();
         } else {
            // Otherwise continue moving
            this.moveToTargetPosition();
         }
      }

      const visionInCells = Math.floor((this.size.x/2 + this.vision) / Game.cellSize) + 1;
      const surroundingCells = super.getSurroundingCells(visionInCells);

      let surroundingEntities = super.getEntitiesInCells(surroundingCells);

      // Filter out entites which the creature cannot see
      const entitiesInVision = this.getEntitiesInVision(surroundingEntities);

      // Search through all nearby entities for any that are of use
      let closestFruit: Fruit | null = null;
      let distanceToNearestFruit = Number.MAX_SAFE_INTEGER;
      let closestPartner: Creature | null = null;
      let distanceToClosestPartner = Number.MAX_SAFE_INTEGER;
      for (const entity of entitiesInVision) {
         // If it wants to, look for any available partners
         if (this.wantsToReproduce && entity instanceof Creature && entity.wantsToReproduce && (entity.partner === null || entity.partner === this)) {
            const distanceToCreature = this.position.distanceFrom(entity.position);
            if (distanceToCreature < distanceToClosestPartner) {
               closestPartner = entity;
               distanceToClosestPartner = distanceToCreature;
            }
         }

         else if (entity instanceof Fruit) {
            if (super.isCollidingWithEntity(entity)) {
               this.eatFruit(entity);
            }

            const distanceToFruit = this.position.distanceFrom(entity.position);
            if (distanceToFruit < distanceToNearestFruit) {
               closestFruit = entity;
               distanceToNearestFruit = distanceToFruit;
            }
         }
      }

      // If there are any available partners, move to them
      if (closestPartner !== null) {
         this.targetPosition = closestPartner.position;
         this.isReproducing = true;
         return;
      }

      // Otherwise if there is a nearby fruit, go to it
      if (closestFruit !== null) {
         this.targetPosition = closestFruit.position;
         return;
      }

      // Otherwise, try to move to a random surrounding position
      if (!this.isMoving) {
         // Chance for the creature to move each second
         const MOVE_CHANCE = 0.95;
         if (Math.random() < MOVE_CHANCE / Game.tps) {
            this.targetPosition = this.findRandomPosition(surroundingCells);
         }
      }
   };

   eatFruit(fruit: Fruit): void {
      // Number of seconds of life it gives
      const FEED_AMOUNT = 10;
      this.age -= FEED_AMOUNT * Game.tps;
      // Stop the creature's age from going below 0
      this.age = Math.max(this.age, 0);

      fruit.die();
   };

   getEntitiesInVision(entitiesToCheck: ReadonlyArray<Entity>): ReadonlyArray<Entity> {
      return entitiesToCheck.filter(entity => this.canSeeEntity(entity));
   };

   canSeeEntity(entity: Entity): boolean {
      return this.position.distanceFrom(entity.position) <= this.vision + this.size.x/2;
   };

   findRandomPosition(surroundingCells: ReadonlyArray<Cell>): Vector {
      this.isMoving = true;

      // Pick a random surrounding cell
      const targetCell: Cell = randItem(surroundingCells as Array<unknown>) as Cell;

      const cellNumber = cells.indexOf(targetCell);

      return Entity.randomPositionInCell(cellNumber);
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