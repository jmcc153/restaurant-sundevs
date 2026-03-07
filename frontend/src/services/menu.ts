import { apiFetch } from "./api";

export const menuService = {
  getMenu: async <T>() => {
    return apiFetch<T>("/menu");
  },
};
