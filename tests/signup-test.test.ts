import { createMocks } from 'node-mocks-http';
import { db_context } from '../dbConfig/db_context';
import userSignup from '../pages/api/user-signup';

describe('tests auth functions', () => {
  // eslint-disable-next-line no-unused-vars
  let context;
  const roleName = db_context.roleName();

  beforeAll(async () => {
    context = await db_context.build(roleName);
  });

  beforeEach(async () => {
    await db_context.reset();
  });

  afterAll(async () => {
    await db_context.close(roleName);
  });

  it('tests user signup', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      //@ts-ignore
      body: JSON.stringify(mockSignupData),
    });

    await userSignup(req, res);

    const response = JSON.parse(res._getData());

    console.log(JSON.parse(res._getData()));

    expect(Boolean(response.user.displayName)).toBe(true);
    expect(response.user.role === 'USER').toBe(true);

    expect(res._getStatusCode()).toBe(200);
  });
});

let mockSignupData = {
  email: 'test@test.com',
  displayName: 'TEST USER',
  password: 'asdfasdf',
  confirmPassword: 'asdfasdf',
  reCaptchaToken: 'asdf',
};
