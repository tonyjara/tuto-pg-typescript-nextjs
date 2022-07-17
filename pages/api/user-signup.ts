import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { merge, snakeCase, mapKeys, camelCase } from 'lodash';
import { pool } from '../../dbConfig/pool';

const camelCaseObjectKeys = (object: any) => {
  return mapKeys(object, (value, key) => camelCase(key)) as any;
};

export default async function userSignup(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data = JSON.parse(req.body);

    const { email, password, displayName } = data;

    const hashedPass = await bcrypt.hash(password, 10);

    const user = {
      email,
      password: hashedPass,
      bio: '',
      displayName,
      gender: '',
      phone: '',
      profilePhoto: null,
      userId: 1,
    };

    const response = await pool?.query(
      'INSERT INTO users(email, role, password) VALUES($1, $2, $3 ) RETURNING *;',
      [user.email.toLowerCase(), 'USER', user.password]
    );

    if (response && 'rows' in response) {
      const userId = response.rows[0].id;
      const { bio, displayName, gender, phone, profilePhoto } = user;
      const profile = { bio, displayName, gender, phone, profilePhoto, userId };

      const snaked = Object.keys(profile)
        .map((x) => snakeCase(x))
        .toString();

      const makeProfile = await pool?.query(
        `INSERT INTO user_profile(${snaked}) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;`,
        [bio, displayName, gender, phone, profilePhoto, userId]
      );

      if (makeProfile && 'rows' in makeProfile) {
        const returnedUser = camelCaseObjectKeys(
          merge(makeProfile.rows[0], response.rows[0])
        );
        if ('message' in returnedUser) {
          throw res.status(500).json({ message: returnedUser.message });
        }

        const filteredUser = {
          email: returnedUser.email,
          createdAt: returnedUser.createdAt,
          updatedAt: returnedUser.updatedAt,
          role: returnedUser.role,
          bio: returnedUser.bio,
          displayName: returnedUser.displayName,
        };

        return res.status(200).json({ user: filteredUser });
      }
    }

    return res.status(500).json({ message: 'unexpected' });
  } catch (e: any) {
    if ('message' in e) {
      return res.status(500).json({ message: e.message });
    }
    return res.status(500).json({ message: 'something went wrong' });
  }
}
