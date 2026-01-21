// pristine.d.ts
declare module "async-pristinejs" {
  export interface PristineConfig {
    classTo?: string;
    errorClass?: string;
    successClass?: string;
    errorTextParent?: string;
    errorTextTag?: string;
    errorTextClass?: string;
    disableSubmitUntilValid?: boolean;
    validateDefaultValues?: boolean;
    validationStrategy?: 'live' | 'blur' | 'hybrid' | 'off';
    validateHiddenInputs?: boolean;
  }

  export interface Validator {
    fn: (val: any, ...params: any[]) => boolean | Promise<boolean>;
    msg?: string | ((val: any, params: any[]) => string);
    priority?: number;
    halt?: boolean;
  }

  export interface Field {
    input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    validators: Validator[];
    params: Record<string, any[]>;
    messages: Record<string, Record<string, string>>;
    defaultValue: any;
    touched: boolean;
    pristine: any;
    errors?: string[];
    errorsElements?: HTMLElement[];
  }

  export default class Pristine {
    constructor(form: HTMLFormElement, config?: PristineConfig);
    validate(input?: HTMLElement | boolean, silent?: boolean): Promise<boolean>;
    getErrors(input?: HTMLElement): string[] | { input: HTMLElement, errors: string[] }[];
    addValidator(elem: HTMLElement, fn: Validator['fn'], msg?: Validator['msg'], priority?: number, halt?: boolean): void;
    reset(): Promise<void>;
    destroy(): Promise<void>;
    setGlobalConfig(config: PristineConfig): void;

    static addValidator(name: string, fn: Validator['fn'], msg?: Validator['msg'], priority?: number, halt?: boolean): void;
    static addMessages(locale: string, messages: Record<string, string>): void;
    static setLocale(locale: string): void;
  }
}

