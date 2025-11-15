import { Window } from 'happy-dom';

const windowInstance = new Window();

const globalProperties: Record<string, unknown> = {
    Audio: windowInstance.Audio,
    document: windowInstance.document,
    navigator: windowInstance.navigator,
    window: windowInstance,
};

Object.assign(globalThis, globalProperties);

globalThis.HTMLElement = windowInstance.HTMLElement;
globalThis.HTMLInputElement = windowInstance.HTMLInputElement;
globalThis.Node = windowInstance.Node;
globalThis.MutationObserver = windowInstance.MutationObserver;

Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: windowInstance.localStorage,
});

Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: windowInstance.sessionStorage,
});

globalThis.requestAnimationFrame = windowInstance.requestAnimationFrame.bind(windowInstance);
globalThis.cancelAnimationFrame = windowInstance.cancelAnimationFrame.bind(windowInstance);
