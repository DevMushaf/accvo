export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateCustomerInput = Pick<Customer, 'name'> &
  Partial<Pick<Customer, 'email' | 'phone' | 'notes'>>;

export type UpdateCustomerInput = Partial<
  Pick<Customer, 'name' | 'email' | 'phone' | 'notes'>
>;
