import { Get } from "@kiyoshiro/openapi-typescript-any-client";

export interface paths {
  "/users": {
    /** List all users */
    get: operations["listUsers"];
    /** Create an user */
    post: operations["createUser"];
  };
  "/users/{id}": {
    /** Get an user */
    get: operations["getUser"];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    User: {
      /**
       * Format: int64
       * @example 1
       */
      id?: number;
      /** @example john */
      username?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      phone?: string;
      /**
       * Format: int32
       * @description User Status
       */
      userStatus?: number;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type external = Record<string, never>;

export interface operations {
  listUsers: {
    /** List all users */
    parameters: {
      query: {
        per: number;
        page: number;
      };
    };
    responses: {
      /** @description A paged array of users */
      200: {
        content: {
          "application/json": components["schemas"]["User"][];
        };
      };
    };
  };
  createUser: {
    /** Create an user */
    requestBody?: {
      content: {
        "application/json": components["schemas"]["User"];
      };
    };
    responses: {
      /** @description A paged array of users */
      200: {
        content: {
          "application/json": components["schemas"]["User"];
        };
      };
    };
  };
  getUser: {
    /** Get an user */
    parameters: {
      path: {
        id: number;
      };
    };
    responses: {
      /** @description A paged array of users */
      200: {
        content: {
          "application/json": components["schemas"]["User"];
        };
      };
    };
  };
}

export const operationIdToPath = {
  listUsers: "/users",
  createUser: "/users",
  getUser: "/users/{id}",
} as const;

export const operationIdToMethod = {
  listUsers: "get",
  createUser: "post",
  getUser: "get",
} as const;

export type OperationIds = keyof operations;

export type OperationIdToResponseBody<OpId extends OperationIds> = Get<
  operations[OpId],
  ["requestBody", "content", "application/json"]
>;

type Func<OpId extends OperationIds> = (
  params: Get<operations[OpId], ["parameters"]> & OperationIdToResponseBody<OpId> extends never
    ? {}
    : {
        body: OperationIdToResponseBody<OpId>;
      },
) => Promise<Get<operations[OpId], ["responses", "200", "content", "application/json"]>>;

type Fetchers = {
  /**
   * @path /users
   * @summary List all users
   */
  listUsers: Func<"listUsers">;

  /**
   * @path /users
   * @summary Create an user
   */
  createUser: Func<"createUser">;

  /**
   * @path /users/{id}
   * @summary Get an user
   */
  getUser: Func<"getUser">;
};

export const createFetcher = (
  ownFetcher: (
    path: string,
    param: {
      method: "get" | "post" | "put" | "patch" | "delete" | "option" | "head";
      body?: Record<string, unknown>;
    },
  ) => Promise<unknown>,
) =>
  new Proxy(
    {},
    {
      get:
        (_, operationId: keyof operations) =>
        (params: {
          path?: Record<string, unknown>;
          query?: Record<string, unknown>;
          body?: Record<string, unknown>;
        }) =>
          ownFetcher(
            operationIdToPath[operationId].replace(
              /\{\w+\}/g,
              (_, key) => (params.path as any)[key],
            ) + (params.query ? `?${new URLSearchParams(params.query as any)}` : ""),
            {
              method: operationIdToMethod[operationId],
              body: params.body,
            },
          ),
    },
  ) as Fetchers;