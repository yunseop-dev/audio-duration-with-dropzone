// forked by https://github.com/remotion-dev/remotion/blob/main/packages/media-utils/src/get-audio-duration-in-seconds.ts

import { pLimit } from './p-limit';

const limit = pLimit(3);

const metadataCache: { [key: string]: number } = {};

const fn = (src: string): Promise<number> => {
    if (metadataCache[src]) {
        return Promise.resolve(metadataCache[src]);
    }

    if (typeof document === 'undefined') {
        throw new Error('getAudioDuration() is only available in the browser.');
    }

    const audio = document.createElement('audio');
    audio.src = src;
    return new Promise<number>((resolve, reject) => {
        const onError = () => {
            reject(audio.error);
            cleanup();
        };

        const onLoadedMetadata = () => {
            metadataCache[src] = audio.duration;
            resolve(audio.duration);
            cleanup();
        };

        const cleanup = () => {
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('error', onError);
            audio.remove();
        };

        audio.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
        audio.addEventListener('error', onError, { once: true });
    });
};

export const getAudioDuration = (src: string) => {
    return limit(fn, src);
};
