export class LSystem {
  private rules: Map<string, string>;
  sentence: string;

  constructor(axiom: string, rules: Map<string, string>) {
    this.sentence = axiom;
    this.rules = rules;
  }

  generate(iterations: number) {
    for (let i = 0; i < iterations; i++) {
      let nextSentence = "";
      for (const char of this.sentence) {
        nextSentence += this.rules.get(char) || char;
      }
      this.sentence = nextSentence;
    }
  }
}
