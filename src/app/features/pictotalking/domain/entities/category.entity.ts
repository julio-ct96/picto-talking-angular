import { CategoryLevel } from '../value-objects/category-level';

export class Category {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly arasaacName: string,
    public readonly description: string | null,
    public readonly level: CategoryLevel,
    public readonly imageUrl: string,
    public readonly icon: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    id: string,
    name: string,
    arasaacName: string,
    description: string | null,
    level: CategoryLevel,
    imageUrl: string,
    icon: string | null,
    createdAt: Date,
    updatedAt: Date
  ): Category {
    return new Category(
      id,
      name,
      arasaacName,
      description,
      level,
      imageUrl,
      icon,
      createdAt,
      updatedAt
    );
  }

  get isBasic(): boolean {
    return this.level === CategoryLevel.BASIC;
  }

  get isIntermediate(): boolean {
    return this.level === CategoryLevel.INTERMEDIATE;
  }

  get isAdvanced(): boolean {
    return this.level === CategoryLevel.ADVANCED;
  }
}
