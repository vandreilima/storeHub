interface ICart {
  id: number;
  userId: number;
  products: ICartProduct[];
  date: string;
}

interface ICartProduct {
  productId: number;
  quantity: number;
}

interface ICartItem {
  product: IProduct;
  quantity: number;
}
