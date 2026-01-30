import  {type AxiosResponse } from 'axios';
import type {Category, MinimalCategory, ResponseArray} from '../types';
import { api } from '../api/axiosInstance';
export function getCategories(page: number, size: number): Promise<ResponseArray<Category>> {
    return api.get(`${import.meta.env.VITE_API}/categories?page=${page}&size=${size}`);
}

export function getCategory(id: number | string): Promise<AxiosResponse<Category>> {
    return api.get(`${import.meta.env.VITE_API}/categories/${id}`);
}

export function createCategory(category: MinimalCategory): Promise<AxiosResponse<Category>> {
    return api.post(`${import.meta.env.VITE_API}/categories`, category);
}

export function editCategory(category: MinimalCategory): Promise<AxiosResponse<Category>> {
    return api.put(`${import.meta.env.VITE_API}/categories`, category);
}

export function deleteCategory(id: string): Promise<AxiosResponse<Category>> {
    return api.delete(`${import.meta.env.VITE_API}/categories/${id}`);
}
