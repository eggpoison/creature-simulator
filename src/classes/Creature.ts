import Game from "../Game";
import { drawRay, PolarVector, randFloat, randInt, randItem, Vector } from "../utils";
import Entity, { EntityGenes } from "./Entity";
import Fruit from "./Fruit";
import Egg from './Egg';
import GameImage from "./GameImage";
import { closeInspector, inspectorCreature } from "../creature-inspector";
import { TileType } from "./BoardGenerator";

export interface CreatureGenes extends EntityGenes {
   speed: number;
   vision: number;
   reproductiveRate: number;
}

interface GeneInfo {
   display: string;
   colour: string;
   min: number;
   max: number;
   /*** How strongly an attribute is factored into deciding a creature's lifespan  */
   weight: number;
   positivelyAffectsLifespan?: boolean;
}

export const creatureGeneInfo: { [key: string]: GeneInfo } = {
   speed: {
      display: "speed",
      colour: "#eeff00",
      min: 3,
      max: 10,
      weight: 1,
      positivelyAffectsLifespan: false
   },
   // Size of the creature in px
   size: {
      display: "size",
      colour: "#ff8f00",
      min: 10,
      max: 30,
      weight: 1,
      positivelyAffectsLifespan: true
   },
   // Vision of the creature in px
   vision: {
      display: "vision",
      colour: "#5400ff",
      min: 25,
      max: 75,
      weight: 1,
      positivelyAffectsLifespan: false
   },
   // How quickly the creature gains reproductive urge
   reproductiveRate: {
      display: "reproductive rate",
      colour: "#ff00e0",
      min: 0.5,
      max: 2,
      weight: 1
   }
};

const calculateLifespan = (attributes: CreatureGenes): number => {
   // Base number of seconds that a creature will live.
   const BASE_LIFESPAN: number = 10;

   let lifespan: number = BASE_LIFESPAN * Game.tps;

   for (const attributeInfo of Object.entries(creatureGeneInfo)) {
      if (!attributeInfo[1].positivelyAffectsLifespan) continue;

      const attributeVal = attributes[attributeInfo[0]] as number;

      if (attributeInfo[1].positivelyAffectsLifespan) {
         lifespan *= Math.pow(attributeVal / ((attributeInfo[1].min + attributeInfo[1].max) / 2), attributeInfo[1].weight);
      } else {
         lifespan *= Math.pow(((attributeInfo[1].min + attributeInfo[1].max) / 2) / attributeVal, attributeInfo[1].weight);
      }
   }

   // Creatures which have less offspring give their offspring a higher lifespan
   lifespan /= Math.pow(attributes.reproductiveRate, 0.7);

   return lifespan;
}

// Generate a random gene in a specified range.
const generateGene = (attributeName: keyof CreatureGenes): number => {
   const attribute: GeneInfo = creatureGeneInfo[attributeName];
   return randFloat(attribute.min, attribute.max);
}

export function createCreature(): void {
   const attributes: CreatureGenes = {
      size: generateGene("size"),
      speed: generateGene("speed"),
      vision: generateGene("vision"),
      reproductiveRate: generateGene("reproductiveRate"),
      lifespan: 0
   };
   attributes.lifespan = calculateLifespan(attributes);

   const position = Game.board.randomPosition();
   new Creature(position, attributes);
}

const REPRODUCTION_TIME = 2000;
const ABSTINENCE_TIME = 4000;

interface CreatureStats {
   fruitEaten: number;
   generation: number;
}

class Creature extends Entity {
   readonly speed: number;
   readonly moveSpeed: number;
   readonly vision: number;
   readonly reproductiveRate: number;
   readonly name: string;

   private readonly birthTileType: TileType;
   readonly birthTime: number;
   /** A random number from -100 to 100, used for randomness */
   readonly seed = randInt(-100, 100, true);

   private isMoving: boolean;
   private targetPosition: Vector | null = null;
   protected reproductiveUrge: number = 0;
   protected partner: Creature | null = null;
   reproductionStage: number = 0;
   lastReproductionTime: number = -REPRODUCTION_TIME - Game.settings.eggIncubationTime - ABSTINENCE_TIME;

   stats: CreatureStats = {
      fruitEaten: 0,
      generation: 1
   }

   constructor(position: Vector, attributes: CreatureGenes) {
      super(position, attributes);

      this.speed = attributes.speed;
      this.vision = attributes.vision;
      this.reproductiveRate = attributes.reproductiveRate;

      this.birthTileType = Game.board.getTileType(position);
      this.birthTime = Game.ticks;
      this.isMoving = false;

      this.moveSpeed = this.calculateMoveSpeed();

      this.name = this.getName();
   }

   private getName(): string {
      const firstNames = ["Glorb", "James", "Obama", "Gnark", "Norbert"];
      const adjectives = ["Feeble", "Crippled", "Schizophrenic", "Weak"];
      const nouns = ["Amoeba"];
   
      let chosenAdjectives = [];
      let potentialAdjectives = adjectives.slice();
      while (true) {
         if (potentialAdjectives.length === 0) break;
         if (Math.random() <= 0.5) {
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

   private calculateMoveSpeed(): number {
      const SPEED_REDUCTION_MULTIPLIER = 1.1;
      const MAX_REDUCTION = 3;
      const reduction = creatureGeneInfo.size.max / creatureGeneInfo.size.min / MAX_REDUCTION;
      return this.speed /  Math.pow(this.size / creatureGeneInfo.size.min / reduction, SPEED_REDUCTION_MULTIPLIER);
   }

   instantiate(): HTMLElement {
      const element = document.createElement("div");
      element.className = "creature";

      if (Game.settings.creatureColour === "regular") {
         element.style.backgroundColor = "green";
      } else if (Game.settings.creatureColour === "gene-based") {
         const r = (this.speed - creatureGeneInfo.speed.min) * 255 / (creatureGeneInfo.speed.max / creatureGeneInfo.speed.min);
         const g = (this.size - creatureGeneInfo.size.min) * 255 / (creatureGeneInfo.size.max / creatureGeneInfo.size.min);
         const b = (this.reproductiveRate - creatureGeneInfo.reproductiveRate.min) * 255 / (creatureGeneInfo.reproductiveRate.max / creatureGeneInfo.reproductiveRate.min);
         element.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
      } else if (Game.settings.creatureColour === "rgb") {
         element.classList.add("rgb");
         const delay = randInt(0, 2000, true);
         element.style.animationDelay = delay + "ms";
      }

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

   private updateLifebar(): void {
      const lifebar = this.element.querySelector(".life-bar") as HTMLElement;
      
      lifebar.style.width = `${this.life}%`;
      // Colour the lifebar a shade of red corresponding to how much life the creature has left
      const color = 155 + this.life;
      lifebar.style.backgroundColor = `rgb(${color}, 0, 0)`;
   };

   private updateReproductionBar(): void {
      const reproductionBar = this.element.querySelector(".reproduction-bar") as HTMLElement;
      
      reproductionBar.style.width = `${this.reproductiveUrge}%`;
   };

   get wantsToReproduce(): boolean {
      return this.reproductiveUrge > this.life && this.reproductionStage < 2;
   }

   tick(): void {
      const currentTile = Game.board.getTileType(this.position);
      
      let ageAmount = 1;
      if (currentTile.effects?.metabolismMultiplier) ageAmount *= currentTile.effects.metabolismMultiplier;
      super.tick(ageAmount);

      // Base amount of reproductive urge gained per second
      if (this.reproductionStage === 0 && (Game.ticks - this.lastReproductionTime) * 1000 / Game.tps > REPRODUCTION_TIME + Game.settings.eggIncubationTime + ABSTINENCE_TIME) {
         this.element.classList.remove("abstaining");
         const BASE_REPRODUCTIVE_RATE = 2;
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
            this.moveToTargetPosition(currentTile);
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

      let entitiesInVision = Game.board.getNearby(this.position, this.vision);
      while (true) {
         const selfIdx = entitiesInVision.indexOf(this);
         if (selfIdx !== -1) entitiesInVision.splice(selfIdx, 1);
         else break;
      }

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
            const fruitTileType = Game.board.getTileType(entity.position);
            if (!(fruitTileType !== this.birthTileType && Math.random() >= Game.settings.tilePreference)) {
               const distanceToFruit = this.position.distanceFrom(entity.position);
               if (distanceToFruit < distanceToNearestFruit) {
                  closestFruit = entity;
                  distanceToNearestFruit = distanceToFruit;
               }
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
            const randomPosition = Game.board.randomNearbyPosition(this.position, this.vision, this.birthTileType);
            this.targetPosition = randomPosition;
         }
      }
   };

   private eatFruit(fruit: Fruit): void {
      this.stats.fruitEaten++;

      // Number of seconds of life it gives
      const FEED_AMOUNT = 10;
      this.age -= FEED_AMOUNT * Game.tps;
      // Stop the creature's age from going below 0
      this.age = Math.max(this.age, 0);

      fruit.die();
   };

   damage(amount: number): void {
      this.age += amount;
   }

   private moveToTargetPosition(currentTile: TileType): void {
      this.isMoving = true;

      if (this === inspectorCreature) {
         drawRay(this.position, this.targetPosition as Vector);
      }

      let moveSpeed = this.moveSpeed;

      if (currentTile.effects?.speedMultiplier) moveSpeed *= currentTile.effects.speedMultiplier;

      // Convert from cartesian to polar coordinates
      const angleToTarget = this.position.angleBetween(this.targetPosition!);
      const nextPosition = new PolarVector(moveSpeed, angleToTarget);

      this.velocity = nextPosition.convertToCartesian();
   };

   private hasReachedTargetPosition(): boolean {
      // Use black magic to figure out if the creature is facing towards the target position

      const relativeTargetVec = new Vector(this.position.x - this.targetPosition!.x, this.position.y - this.targetPosition!.y);

      const dotProduct = this.velocity.dot(relativeTargetVec);
      return dotProduct > 0;
   };

   private reachTargetPosition(): void {
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
         this.reproductionStage = 0;
         // Ensure that only 1 egg is created
         if ((this.partner as Creature).reproductionStage !== 0) {
            const childAttributes = this.generateChildGenes(this.partner as Creature);

            const eggAttributes = {
               size: 20,
               lifespan: Game.settings.eggIncubationTime * Game.tps
            };
            const eggPos = this.position.randomOffset(10);
            new Egg(eggPos, eggAttributes, childAttributes, this.stats.generation + 1);
         }

         this.partner = null;

         setTimeout(() => {
            resolve();
         }, Game.settings.eggIncubationTime * 1000);
      });
   }

   generateChildGenes(partner: Creature): CreatureGenes {
      let attributes: { [key: string]: number } = {};

      for (const geneName of Object.keys(creatureGeneInfo)) {
         // Pick a random allele
         let gene = Math.random() <= 0.5 ? this[geneName] : partner[geneName];
         attributes[geneName] = gene;

         // Chance to mutate the gene
         if (Math.random() <= 0.3) {
            gene = this.mutateGene(geneName, gene);
         }
      }

      attributes.lifespan = calculateLifespan(attributes as CreatureGenes);

      return attributes as CreatureGenes;
   }

   private mutateGene(name: string, initialGeneVal: number): number {
      const gene = creatureGeneInfo[name];

      // min mutate amount * math.random() (maybe go higher )
      let mutateAmount = (gene.min + gene.max) / 300;

      mutateAmount *= randFloat(0.1, 1) * Game.settings.creatureMutationRate;

      const dir = Math.sign(Math.random() - 0.5);
      mutateAmount *= dir;

      mutateAmount *= Game.settings.creatureMutationRate;

      return initialGeneVal + mutateAmount;
   }

   die(): void {
      if (this === inspectorCreature) {
         closeInspector();
      }

      super.die();
   }
}

export default Creature;