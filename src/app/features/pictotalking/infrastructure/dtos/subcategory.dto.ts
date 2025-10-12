export interface SubcategoryDto {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  imageUrl: string;
  arasaacCategories: string[];
  createdAt: string;
  updatedAt: string;
}
