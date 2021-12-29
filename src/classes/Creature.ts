import Game from "../Game";
import { Cell, cells } from "../main";
import { drawRay, lerp, PolarVector, randFloat, randInt, randItem, Vector } from "../utils";
import Entity, { EntityAttributes } from "./Entity";
import Fruit from "./Fruit";
import Egg from './Egg';
import GameImage from "../GameImage";
import { inspectorCreature } from "../creature-inspector";

export interface CreatureAttributes extends EntityAttributes {
   name: string;
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

export const creatureAttributeInfo: { [key: string]: AttributeInfo } = {
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

      const attributeVal = attributes[attributeInfo[0]] as number;

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

const getRandomName = (): string => {
   const firstNames = ["Glorb", "James", "Obama", "Gnark"];
   const adjectives = ["Feeble", "Crippled", "Schizophrenic"];
   const nouns = ["Amoeba"];

   let chosenAdjectives = [];
   let potentialAdjectives = adjectives.slice();
   while (true) {
      if (potentialAdjectives.length === 0) break;
      if (Math.random() <= 0.4) {
         const idx = randInt(0, potentialAdjectives.length);
         chosenAdjectives.push(potentialAdjectives[idx]);
         potentialAdjectives.splice(idx, 1);
      }
      else break;
   }
   const adjectiveList = chosenAdjectives.reduce((previousValue, currentValue, i) => {
      let newVal = previousValue;
      if (i > 0 && chosenAdjectives.length - i > 1) newVal += ", ";
      else if (chosenAdjectives.length > 1 && chosenAdjectives.length - i === 1) newVal += " and ";
      return newVal + currentValue;
   }, "");

   const hasNoun = Math.random() <= 0.3;

   let name = randItem(firstNames);
   if (hasNoun && chosenAdjectives.length > 0) {
      name += " the " + adjectiveList + " " + randItem(nouns);
   } else if (chosenAdjectives.length > 0) {
      name += " the " + adjectiveList;
   } else if (hasNoun) {
      name += " the " + randItem(nouns);
   }

   return name as string;
}

export function createCreature(): void {
   const attributes: CreatureAttributes = {
      name: getRandomName(),
      size: generateGene("size"),
      speed: generateGene("speed"),
      vision: generateGene("vision"),
      reproductiveRate: generateGene("reproductiveRate"),
      lifespan: 0
   };
   attributes.lifespan = calculateLifespan(attributes)

   // Make larger creatures slower
   const SPEED_REDUCTION_MULTIPLIER = 1.1;
   const MAX_REDUCTION = 3;
   const reduction = creatureAttributeInfo.size.max / creatureAttributeInfo.size.min / MAX_REDUCTION;
   attributes.speed /= Math.pow(attributes.size / creatureAttributeInfo.size.min / reduction, SPEED_REDUCTION_MULTIPLIER);

   // Get a random position for the creature
   const x = randFloat(0, Game.boardSize.width * Game.cellSize);
   const y = randFloat(0, Game.boardSize.height * Game.cellSize);
   const position = new Vector(x, y);

   new Creature(position, attributes);
}

const REPRODUCTION_TIME = 2000;
const INCUBATION_TIME = 5000;
const ABSTINENCE_TIME = 4000;

interface CreatureStats {
   fruitEaten: number;
}

class Creature extends Entity {
   speed: number;
   vision: number;
   reproductiveRate: number;

   birthTime: number;

   isMoving: boolean;
   targetPosition: Vector | null = null;
   reproductiveUrge: number = 0;
   partner: Creature | null = null;
   reproductionStage: number = 0;
   lastReproductionTime: number = -REPRODUCTION_TIME - INCUBATION_TIME - ABSTINENCE_TIME;

   stats: CreatureStats = {
      fruitEaten: 0
   }

   constructor(position: Vector, attributes: CreatureAttributes) {
      super(position, attributes);

      this.speed = attributes.speed;
      this.vision = attributes.vision;
      this.reproductiveRate = attributes.reproductiveRate;

      this.isMoving = false;
      this.birthTime = Game.ticks;
   }

   instantiate(): HTMLElement {
      const element = document.createElement("div");
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
      element.style.setProperty("--creature-size", `${this.size}px`);

      return element;
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
      return this.reproductiveUrge > this.life && this.reproductionStage < 2;
   }

   tick(): void {
      super.tick();

      // Base amount of reproductive urge gained per second
      if (this.reproductionStage === 0 && (Game.ticks - this.lastReproductionTime) * 1000 / Game.tps > REPRODUCTION_TIME + INCUBATION_TIME + ABSTINENCE_TIME) {
         this.element.classList.remove("abstaining");
         const BASE_REPRODUCTIVE_RATE = 5;
         this.reproductiveUrge += BASE_REPRODUCTIVE_RATE * this.reproductiveRate / Game.tps;
         this.reproductiveUrge = Math.min(100, this.reproductiveUrge);
      } else if (this.reproductionStage >= 2) {
         // Stop aging if the creature is reproducing
         this.age -= 1;
      }

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

      switch (this.reproductionStage) {
         case 1: {
            /*** Average amount of particles which spawn each second */
            const particleAmount = 3;
            if (Math.random() <= particleAmount / Game.tps) {
               const imagePos = this.position.randomOffset(30);
               new GameImage("heart", 4, 2, 16, 16, imagePos);
            }
            break;
         }
         case 2: {
            if (Math.random() <= 3 / Game.tps) {
               const particleAttempts = randInt(4, 11);
               const chance = 0.7;
               for (let i = 0; i < particleAttempts; i++) {
                  if (Math.random() <= chance) {
                     const imagePos = this.position.randomOffset(40);
                     const size = randInt(12, 24);
                     new GameImage("heart", 4, 3, size, size, imagePos);
                  }
               }
            }
            if (Math.random() < 6 / Game.tps) {
               const imagePos = this.position.randomOffset(20);
               const size = randInt(12, 18);
               new GameImage("heart", 4, 3, size, size, imagePos);
            }
            break;
         }
      }

      const visionInCells = Math.floor(((this.size as number)/2 + this.vision) / Game.cellSize) + 1;
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
         const entityIsCreature: boolean = entity instanceof Creature;
         const entityIsFruit: boolean = entity instanceof Fruit;

         if (entityIsCreature && this.wantsToReproduce && entity.wantsToReproduce && (entity.partner === null || entity.partner === this)) {
            // If it wants to, look for any available partners
            const distanceToCreature = this.position.distanceFrom(entity.position);
            if (distanceToCreature < distanceToClosestPartner) {
               closestPartner = entity as Creature;
               distanceToClosestPartner = distanceToCreature;
            }
         }
         else if (entityIsFruit) {
            const distanceToFruit = this.position.distanceFrom(entity.position);
            if (distanceToFruit < distanceToNearestFruit) {
               closestFruit = entity;
               distanceToNearestFruit = distanceToFruit;
            }
         }

         if (super.isCollidingWithEntity(entity)) {
            if (entity === this.partner && this.wantsToReproduce) {
               this.handleReproduction();
            } else if (entityIsFruit) {
               this.eatFruit(entity);
            }
         }
      }

      // If there are any available partners, move to them
      if (closestPartner !== null && this.reproductionStage < 2) {
         this.targetPosition = closestPartner.position;
         this.partner = closestPartner;
         this.reproductionStage = 1;
         return;
      } else if (this.reproductionStage === 1) {
         this.reproductionStage = 0;
      } else if (this.reproductionStage >= 2) return;

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
      this.stats.fruitEaten++;

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
      return this.position.distanceFrom(entity.position) <= this.vision + (this.size as number)/2;
   };

   findRandomPosition(surroundingCells: ReadonlyArray<Cell>): Vector {
      // Pick a random surrounding cell
      const targetCell: Cell = randItem(surroundingCells as Array<unknown>) as Cell;

      const cellNumber = cells.indexOf(targetCell);

      return Entity.randomPositionInCell(cellNumber);
   };

   moveToTargetPosition(): void {
      this.isMoving = true;

      // Convert from cartesian to polar coordinates
      const angleToTarget = this.position.angleBetween(this.targetPosition!);
      const nextPosition = new PolarVector(this.speed, angleToTarget);

      if (this === inspectorCreature) {
         drawRay(this.position, this.targetPosition as Vector);
      }

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

   handleReproduction(): void {
      this.reproduce()
      .then(() => this.layEgg());
   };

   reproduce(): Promise<void> {
      return new Promise(resolve => {
         // console.log("Reproduction started");
         this.reproductionStage = 2;
         this.targetPosition = null;
         this.velocity = new Vector(0, 0);
         this.isMoving = false;
         this.reproductiveUrge = 0;
         this.element.classList.add("abstaining");
         this.lastReproductionTime = Game.ticks;
         
         setTimeout(() => {
            resolve();
         }, REPRODUCTION_TIME);
      });
   }

   layEgg(): Promise<void> {
      return new Promise(resolve => {
         // console.log("Reproduction ended, incubation started.");
         this.reproductionStage = 0;
         // Ensure that only 1 egg is created
         if ((this.partner as Creature).reproductionStage !== 0) {

            const childAttributes = this.generateChildGenes(this.partner as Creature);
   
            const eggAttributes = {
               size: 20,
               lifespan: INCUBATION_TIME / 1000 * Game.tps
            };
            const eggPos = this.position.randomOffset(10);
            new Egg(eggPos, eggAttributes, childAttributes);
         }

         this.partner = null;

         setTimeout(() => {
            resolve();
         }, INCUBATION_TIME);
      });
   }

   generateChildGenes(partner: Creature): CreatureAttributes {
      let attributes: { [key: string]: number | string } = {
         name: getRandomName()
      };

      for (const geneName of Object.keys(creatureAttributeInfo)) {
         // Pick a random allele
         let gene = Math.random() <= 0.5 ? this[geneName] : partner[geneName];
         attributes[geneName] = gene;

         // Chance to mutate the gene
         if (Math.random() <= 0.3) {
            console.log("Mutating " + geneName);
            console.log(`min ${creatureAttributeInfo[geneName].min} max ${creatureAttributeInfo[geneName].max}`);
            console.log("Initial value: " + gene);
            gene = this.mutateGene(geneName, gene);
            console.log("Mutated value: " + gene);
         }
      }

      attributes.lifespan = calculateLifespan(attributes as CreatureAttributes);

      return attributes as CreatureAttributes;
   }

   mutateGene(name: string, initialGeneVal: number): number {
      console.log(name);
      const gene = creatureAttributeInfo[name];
      console.log(initialGeneVal);
      console.log(gene);

      let newGeneVal: number = 0;

      const minMutateAmount = (gene.min + gene.max) / 2 / 5;
      const dir = randInt(0, 2);
      if (dir === 1) {
         newGeneVal += minMutateAmount;
         const lerpAmount = randFloat(0.01, 0.05);
         newGeneVal += lerp(initialGeneVal, gene.max, lerpAmount);
      } else {
         newGeneVal -= minMutateAmount;
         const lerpAmount = randFloat(0.01, 0.05);
         newGeneVal -= lerp(initialGeneVal, gene.min, lerpAmount);
      }

      return newGeneVal;
   }
}

export default Creature;