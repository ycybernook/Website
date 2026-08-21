export type OptionChoice = {
  id: string;
  label: string;
  price_delta: number;
  sort_order: number;
};

export type OptionGroup = {
  id: string;
  name: string;
  kind: "select" | "quantity_stepper";
  required: boolean;
  sort_order: number;
  option_choices: OptionChoice[];
};

export type Product = {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  base_price: number;
  active: boolean;
  sort_order: number;
  option_groups: OptionGroup[];
};

export type SelectedOption = {
  group_id: string;
  group_name: string;
  choice_id: string;
  choice_label: string;
  price_delta: number;
};

export type CartItem = {
  line_id: string;
  product_id: string;
  product_name: string;
  image_url: string | null;
  unit_price: number;
  quantity: number;
  selected_options: SelectedOption[];
};

export type Fulfillment = "pickup" | "delivery";

export type OrderStatus = "pending_payment" | "paid" | "cancelled";
