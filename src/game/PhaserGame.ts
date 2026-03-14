// Single point of initialization for the Phaser instance.
// Scenes are added here as each phase is built out.
// Not imported by main.ts yet — Phaser is excluded from the bundle
// until a phase that needs it is activated.
import Phaser from 'phaser';

let instance: Phaser.Game | null = null;

export interface PhaserGameConfig {
  parent: HTMLElement;
  width: number;
  height: number;
}

export function initPhaserGame(config: PhaserGameConfig): Phaser.Game {
  if (instance) return instance;

  instance = new Phaser.Game({
    type: Phaser.AUTO,
    parent: config.parent,
    width: config.width,
    height: config.height,
    backgroundColor: '#181818',
    pixelArt: true,
    scene: [], // scenes are registered here as phases are built
  });

  return instance;
}

export function getPhaserGame(): Phaser.Game | null {
  return instance;
}
