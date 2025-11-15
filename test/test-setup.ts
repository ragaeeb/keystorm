import { Window } from 'happy-dom';

const windowInstance = new Window();

const globalProperties: Record<string, unknown> = {
    Audio: windowInstance.Audio,
    document: windowInstance.document,
    navigator: windowInstance.navigator,
    window: windowInstance,
};

Object.assign(globalThis, globalProperties);

const myGlobalThis: any = globalThis;

myGlobalThis.HTMLElement = windowInstance.HTMLElement;
myGlobalThis.HTMLInputElement = windowInstance.HTMLInputElement;
myGlobalThis.Node = windowInstance.Node;
myGlobalThis.MutationObserver = windowInstance.MutationObserver;

Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: windowInstance.localStorage });

Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: windowInstance.sessionStorage });

myGlobalThis.requestAnimationFrame = windowInstance.requestAnimationFrame.bind(windowInstance);
myGlobalThis.cancelAnimationFrame = windowInstance.cancelAnimationFrame.bind(windowInstance);
