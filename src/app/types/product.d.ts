interface IProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

interface IProductCreate {
  id?: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

interface IProductFilter {
  textSearch: string;
  rating: number;
  category: string;
}
