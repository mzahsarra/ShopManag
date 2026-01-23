import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL ?? "http://localhost:8080";

export type Shop = {
  id: number;
  name: string;
  createdAt: string;
  inVacations: boolean;
  nbProducts: number;
  nbCategories?: number;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // page courante (0-based)
  size: number;
};

export async function searchShops(params: {
  q?: string;
  inVacations?: boolean;
  page?: number;
  size?: number;
  sort?: string; // ex: "name,asc"
}): Promise<PageResponse<Shop>> {
  const { q, inVacations, page = 0, size = 10, sort } = params;

  const res = await axios.get<PageResponse<Shop>>(`${API_URL}/api/v1/shops/search`, {
    params: {
      ...(q ? { q } : {}),
      ...(inVacations !== undefined ? { inVacations } : {}),
      page,
      size,
      ...(sort ? { sort } : {}),
    },
  });

  return res.data;
}
