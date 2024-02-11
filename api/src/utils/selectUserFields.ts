import { DbUser } from "../db";

export const selectUserFields = (user: DbUser) => {
  return {
    id: user.id,
    themeId: user.themeId,
  };
};
