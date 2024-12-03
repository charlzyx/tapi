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

// @ignore must be last line of type alias declear block
type cannotseeme = {
  url: "hide in bash";
};

/**
 * @ignore in js Doc
 */
type cannotseemetoo = {
  url: "hide in bash";
};
