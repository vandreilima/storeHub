interface IProdutc {
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

interface IProdutcFilter {
  textSearch: string;
  rating: number;
  category: string;
}
