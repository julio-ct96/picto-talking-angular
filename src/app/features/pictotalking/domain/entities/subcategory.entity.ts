export class Subcategory {
  private constructor(
    public readonly id: string,
    public readonly categoryId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly imageUrl: string,
    public readonly arasaacCategories: readonly string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    id: string,
    categoryId: string,
    name: string,
    description: string | null,
    imageUrl: string,
    arasaacCategories: readonly string[],
    createdAt: Date,
    updatedAt: Date
  ): Subcategory {
    return new Subcategory(
      id,
      categoryId,
      name,
      description,
      imageUrl,
      arasaacCategories,
      createdAt,
      updatedAt
    );
  }

  belongsToCategory(categoryId: string): boolean {
    return this.categoryId === categoryId;
  }
}
