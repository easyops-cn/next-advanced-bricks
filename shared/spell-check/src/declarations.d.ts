declare module "typo-js" {
  class Typo {
    constructor(lang: string, aff: string, dic: string);
    check(word: string): boolean;
    checkExact(word: string): boolean;
    suggest(word: string): string[];
  }
  export default Typo;
}

declare module "*/generated-dictionary.js" {
  export const aff: string;
  export const dic: string;
}
