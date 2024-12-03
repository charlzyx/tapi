export type placeOrder = {
  method: "POST";
  url: "{{SERVER}}/store/order";
  body: Order;
  resp:
    | Resp<Order>
    | Reason<"Invalid input">
    | Reason<"Validation exception", 422>;
};

export type getOrderById = {
  method: "GET";
  url: "{{SERVER}}/store/order/:orderId";
  path: {
    orderId: Order["id"];
  };
  resp:
    | Resp<Order>
    | Resp<Order, "application/xml">
    | Reason<"Invalid ID supplied">
    | Reason<"Order not found", 404>;
};

export type getInventory = {
  method: "GET";
  url: "{{SERVER}}/store/inventory";
  resp: Record<Pet["status"], int32>;
};

export type deleteOrder = {
  method: "DELETE";
  url: "{{SERVER}}/store/order/:orderId";
  path: {
    orderId: Order["id"];
  };
  resp: Reason<"Invalid ID supplied"> | Reason<"Order not found", 404>;
};
