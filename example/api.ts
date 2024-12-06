type createPet = {
  method: "PUT";
  url: "{{SERVER}}/pet";
  resp: Resp<Pet> | Resp<Pet, "application/xml">;
};

// @deprecated in line
type deletePet = {
  method: "DELETE";
  url: "{{SERVER}}/pet/:petId";
  headers: {
    api_key: string;
  };
  path: {
    petId: Pet["id"];
  };
  resp: Reason<"Invalid pet value">;
};

/**
 * @deprecated in js doc
 */
type findPetByID = {
  method: "GET";
  url: "{{SERVER}}/:petId";
  path: {
    petId: Pet["id"];
  };
  resp:
    | Resp<Pet>
    | Resp<Pet, "application/xml">
    | Reason<"Invalid ID supplied">
    | Reason<"Pet not Found", 404>;
};

type findPetByStatus = {
  method: "GET";
  url: "{{SERVER}}/findByStatus";
  query: Pet["status"];
  resp:
    | Resp<Pet>
    | Resp<Pet, "application/xml">
    | Reason<"Invalid status value">;
};

type findPetByTags = {
  method: "GET";
  url: "{{SERVER}}/findByTags";
  query: Pet["tags"];
  resp:
    | Resp<Pet>
    | Resp<Pet, "application/xml">
    | Reason<"Invalid status value">;
};

type updatePet = {
  method: "POST";
  url: "{{SERVER}}/pet";
  body: OmitAndRequired<Pet, "id", "name" | "photoUrls">;
  resp:
    | Resp<Pet>
    | Resp<Pet, "application/xml">
    | Reason<"Pet not found", 401>
    | Reason<"Validation expection", 422>;
};

type updatePetWithForm = {
  method: "POST";
  url: "{{SERVER}}/pet/:petId";
  path: {
    petId: Pet["id"];
  };
  query: Pick<Pet, "name" | "status">;
  resp: Reason<"Invalid ID supplied">;
};

type updatePetImage = {
  method: "POST";
  url: "{{SERVER}}/pet/:petId/uploadImage";
  path: {
    petId: Pet["id"];
  };
  /**
   *  requestBody:
        content:
          application/octet-stream:
            schema:
              type: string
              format: binary
   */
  body: binary;
  query: Record<string, string>;
  resp: Resp<Pet> | Reason<"Pet not Found", 404>;
};

type placeOrder = {
  method: "POST";
  url: "{{SERVER}}/store/order";
  body: Order;
  resp:
    | Resp<Order>
    | Reason<"Invalid input">
    | Reason<"Validation exception", 422>;
};

type getOrderById = {
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

type getInventory = {
  method: "GET";
  url: "{{SERVER}}/store/inventory";
  resp: Record<Pet["status"], int32>;
};

type deleteOrder = {
  method: "DELETE";
  url: "{{SERVER}}/store/order/:orderId";
  path: {
    orderId: Order["id"];
  };
  resp: Reason<"Invalid ID supplied"> | Reason<"Order not found", 404>;
};

type createUser = {
  method: "POST";
  url: "{{SERVER}}/user";
  body: OmitAndRequired<User, "id", "username" | "password">;
  resp: Resp<User> | Resp<User, "application/xml">;
};

type createUserList = {
  method: "POST";
  url: "{{SERVER}}/user/createWithList";
  body: OmitAndRequired<User, "id", "username" | "password">[];
  resp: Resp<User[]> | Resp<User[], "application/xml">;
};

type deleteUser = {
  method: "DELETE";
  url: "{{SERVER}}/user/:username";
  path: {
    username: User["username"];
  };
  resp: Reason<"INvalid username supplied"> | Reason<"User not found", 404>;
};

type getUserByName = {
  method: "GET";
  url: "{{SERVER}}/user/:username";
  path: {
    username: User["username"];
  };
  resp:
    | Resp<User>
    | Resp<User, "application/xml">
    | Reason<"INvalid username supplied">
    | Reason<"User not found", 404>;
};

type userLogin = {
  method: "GET";
  url: "{{SERVER}}/user/login";
  query: Pick<User, "username" | "password">;
  resp:
    | Resp<
        string,
        "application/json",
        200,
        {
          "X-Rate-Limit": string;
          "X-Expires-After": string;
        }
      >
    | Resp<
        string,
        "application/xml",
        200,
        {
          "X-Rate-Limit": string;
          "X-Expires-After": string;
        }
      >
    | Reason<"Invalid username/password supplied ">;
};

type userLogout = {
  method: "GET";
  url: "{{SERVER}}/user/logout";
  resp: Resp<string>;
};

type updateUser = {
  method: "PUT";
  url: "{{SERVER}}/user/:username";
  path: {
    username: User["username"];
  };
  resp:
    | Resp<string>
    | Reason<"INvalid username supplied">
    | Reason<"User not found", 404>;
};

type TreeLike<T> = {
  id: number;
  children: TreeLike<T>[];
};

type tryCircleRef = {
  url: "TEST";
  body: TreeLike<{ name: string }>;
};
