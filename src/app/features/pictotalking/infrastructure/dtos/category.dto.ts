export interface CategoryDto {
  id: string;
  name: string;
  arasaacName: string;
  description: string | null;
  level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  imageUrl: string;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}
