type Subcategory = {
  code: string;
  name: string;
  shortName: string;
  shortNameEn: string;
  description?: string;
};

type Category = {
  id: number;
  code: string;
  name: string;
  shortName: string;
  shortNameEn: string;
  subcategories: Subcategory[];
};


export type { Category, Subcategory };
