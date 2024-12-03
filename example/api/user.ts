export type createUser = {
  method: "POST";
  url: "{{SERVER}}/user";
  body: OmitAndRequired<User, "id", "username" | "password">;
  resp: Resp<User> | Resp<User, "application/xml">;
};

export type createUserList = {
  method: "POST";
  url: "{{SERVER}}/user/createWithList";
  body: OmitAndRequired<User, "id", "username" | "password">[];
  resp: Resp<User[]> | Resp<User[], "application/xml">;
};

export type deleteUser = {
  method: "DELETE";
  url: "{{SERVER}}/user/:username";
  path: {
    username: User["username"];
  };
  resp: Reason<"INvalid username supplied"> | Reason<"User not found", 404>;
};

export type getUserByName = {
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

export type userLogin = {
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

export type userLogout = {
  method: "GET";
  url: "{{SERVER}}/user/logout";
  resp: Resp<string>;
};

export type updateUser = {
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
