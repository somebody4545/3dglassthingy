"use client";

import * as THREE from "three";

// Global texture cache to avoid reloading textures for each SelectorObject
class TextureCache {
  private static instance: TextureCache;
  private imageTextures: Map<string, THREE.Texture> = new Map();
  private videoTextures: Map<string, THREE.VideoTexture> = new Map();
  private videoElements: Map<string, HTMLVideoElement> = new Map();
  private loadingPromises: Map<string, Promise<THREE.Texture | THREE.VideoTexture>> = new Map();

  static getInstance(): TextureCache {
    if (!TextureCache.instance) {
      TextureCache.instance = new TextureCache();
    }
    return TextureCache.instance;
  }

  async getImageTexture(src: string): Promise<THREE.Texture> {
    if (this.imageTextures.has(src)) {
      return this.imageTextures.get(src)!;
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)! as Promise<THREE.Texture>;
    }

    const loadPromise = new Promise<THREE.Texture>((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        src,
        (texture) => {
          // Apply consistent texture settings
          texture.rotation = -Math.PI / 2; // clockwise
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          texture.flipY = false;
          texture.needsUpdate = true;

          this.imageTextures.set(src, texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error(`Failed to load image texture: ${src}`, error);
          reject(error);
        }
      );
    });

    this.loadingPromises.set(src, loadPromise);

    try {
      const texture = await loadPromise;
      this.loadingPromises.delete(src);
      return texture;
    } catch (error) {
      this.loadingPromises.delete(src);
      throw error;
    }
  }

  async getVideoTexture(src: string): Promise<THREE.VideoTexture> {
    if (this.videoTextures.has(src)) {
      return this.videoTextures.get(src)!;
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)! as Promise<THREE.VideoTexture>;
    }

    const loadPromise = new Promise<THREE.VideoTexture>((resolve, reject) => {
      const video = document.createElement('video');
      video.src = src;
      video.crossOrigin = 'anonymous';
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';

      video.addEventListener('loadeddata', () => {
        const vTex = new THREE.VideoTexture(video);
        vTex.minFilter = THREE.LinearFilter;
        vTex.magFilter = THREE.LinearFilter;
        vTex.rotation = -Math.PI / 2;
        vTex.center.set(0.5, 0.5);
        vTex.wrapS = vTex.wrapT = THREE.RepeatWrapping;
        vTex.repeat.x = 1;
        vTex.repeat.y = 1;
        vTex.flipY = false;
        vTex.needsUpdate = true;

        this.videoTextures.set(src, vTex);
        this.videoElements.set(src, video);
        resolve(vTex);
      });

      video.addEventListener('error', (error) => {
        console.error(`Failed to load video texture: ${src}`, error);
        reject(error);
      });
    });

    this.loadingPromises.set(src, loadPromise);

    try {
      const texture = await loadPromise;
      this.loadingPromises.delete(src);
      return texture;
    } catch (error) {
      this.loadingPromises.delete(src);
      throw error;
    }
  }

  getVideoElement(src: string): HTMLVideoElement | null {
    return this.videoElements.get(src) || null;
  }

  // Cleanup method to dispose of textures when no longer needed
  disposeTexture(src: string, type: 'image' | 'video'): void {
    if (type === 'image' && this.imageTextures.has(src)) {
      const texture = this.imageTextures.get(src)!;
      texture.dispose();
      this.imageTextures.delete(src);
    } else if (type === 'video' && this.videoTextures.has(src)) {
      const texture = this.videoTextures.get(src)!;
      const video = this.videoElements.get(src);
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
        this.videoElements.delete(src);
      }
      texture.dispose();
      this.videoTextures.delete(src);
    }
  }

  // Preload all textures for a given section data
  async preloadTextures(sections: Array<{image?: string, video?: string}>): Promise<void> {
    const promises: Promise<THREE.Texture | THREE.VideoTexture>[] = [];

    for (const section of sections) {
      if (section.image) {
        promises.push(this.getImageTexture(section.image));
      }
      if (section.video) {
        promises.push(this.getVideoTexture(section.video));
      }
    }

    await Promise.all(promises);
  }
}

export const textureCache = TextureCache.getInstance();