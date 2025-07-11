// pristine.d.ts

declare module "pristinejs" {
  export interface PristineValidator {
    name: string;
    fn: (value: string, el?: HTMLElement) => boolean;
    msg: string;
    priority: number;
    halt: boolean;
  }

  export interface PristineAsyncValidator {
    name: string;
    fn: (value: string, el?: HTMLElement) => Promise<boolean>;
    msg: string;
    priority: number;
    halt: boolean;
  }

  interface PristineOptions {
    classTo?: string;
    errorClass?: string;
    successClass?: string;
    errorTextParent?: string;
    errorTextTag?: string;
    errorTextClass?: string;
  }

  enum PristineLive {
    live = "live",
    blur = "blur",
    hybrid = "hybrid",
    off = "off"
  }

  export default class Pristine {
    constructor(form: HTMLFormElement, config?: PristineOptions, live?: PristineLive);

    validate(input?: HTMLElement, silent?: boolean): Promise<boolean>;
    reset(): void;
    destroy(): void;

    static addValidator(
      name: string,
      fn: (value: string, el?: HTMLElement) => boolean,
      msg: string,
      priority?: number,
      halt?: boolean
    ): void;

    static addAsyncValidator(
      name: string,
      fn: (value: string, el?: HTMLElement) => Promise<boolean>,
      msg: string,
      priority?: number,
      halt?: boolean
    ): void;
  }
}
