export class KeywordEntity {
  readonly id: number | null;
  readonly label: string;
  readonly plural: string | null;
  readonly meaning: string | null;
  readonly type: number | null;
  readonly signLanguageId: number | null;

  constructor(params: {
    id?: number | null;
    label: string;
    plural?: string | null;
    meaning?: string | null;
    type?: number | null;
    signLanguageId?: number | null;
  }) {
    this.id = params.id ?? null;
    this.label = params.label;
    this.plural = params.plural ?? null;
    this.meaning = params.meaning ?? null;
    this.type = params.type ?? null;
    this.signLanguageId = params.signLanguageId ?? null;
  }
}
