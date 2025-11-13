interface IUser {
  id: number;
  username: string;
  email: string;
  password: string;
  roles: string[];
  address: {
    geolocation: {
      lat: string;
      long: string;
    };
    city: string;
    street: string;
    number: number;
    zipcode: string;
  };
  name: {
    firstname: number;
    lastname: number;
  };
  phone: number;
  __v: 0;
}
