import { getElem, Vector} from '../utils';

export const gameImages: Array<GameImage> = new Array<GameImage>();

class GameImage {
    name: string;
    position: Vector;

    element!: HTMLElement;
    width: number;
    height: number;

    numFrames: number;
    frame: number = 0;
    ticksPerFrame: number;

    constructor(name: string, numFrames: number, ticksPerFrame: number, width: number, height: number, position: Vector) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.numFrames = numFrames;
        this.ticksPerFrame = ticksPerFrame;
        this.position = position;

        this.init();
        this.updateBackgroundImage();

        gameImages.push(this);
    }
    init(): void {
        this.element = document.createElement("div");
        this.element.className = "game-image";
        this.element.style.width = this.width + "px";
        this.element.style.height = this.height + "px";
        getElem("board").appendChild(this.element);

        this.element.style.backgroundSize = `${this.width}px ${this.height}px`;
        this.element.style.top = this.position.y + "px";
        this.element.style.left = this.position.x + "px";
    }

    updateBackgroundImage() {
        const frame = Math.floor(this.frame);
        const src = require(`../images/${this.name}/${this.name}-${frame}.png`).default;
        this.element.style.backgroundImage = `url(${src})`;
    }

    tick(): void {
        this.frame += 1 / this.ticksPerFrame;
        if (this.frame >= this.numFrames) {
            this.die();
            return;
        }
        this.updateBackgroundImage();
    }

    die(): void {
        this.element.remove();

        gameImages.splice(gameImages.indexOf(this), 1);
    }
}

export default GameImage;