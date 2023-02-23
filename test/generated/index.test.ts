import axios from "axios";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { createFetcher } from ".";

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const baseURL = "http://localhost:3000";

test("listUsers", async () => {
  const dummyUsers = [
    { id: 1, name: "John" },
    { id: 2, name: "Jane" },
  ];
  server.use(
    rest.get(`${baseURL}/users`, (_req, res, ctx) => {
      return res(ctx.json(dummyUsers));
    }),
  );
  const requestSpy = vi.fn<{ url: string; method: string }[]>();
  server.events.on("request:start", (req) =>
    requestSpy({ url: req.url.toString(), method: req.method }),
  );

  const fetcher = createFetcher((path, { method, body }) =>
    axios({ baseURL, url: path, method, data: body }).then((res) => res.data),
  );
  const res = await fetcher.listUsers({ query: { per: 10, page: 0 } });

  expect(res).toStrictEqual(dummyUsers);
  expect(requestSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      url: "http://localhost:3000/users?per=10&page=0",
      method: "GET",
    }),
  );
  expectTypeOf(res).toMatchTypeOf<
    {
      id?: number | undefined;
      username?: string | undefined;
      firstName?: string | undefined;
      lastName?: string | undefined;
      email?: string | undefined;
      password?: string | undefined;
      phone?: string | undefined;
      userStatus?: number | undefined;
    }[]
  >();
});
