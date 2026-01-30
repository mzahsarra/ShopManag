import {type AxiosResponse } from 'axios';
import type { MinimalProduct, Product, ResponseArray } from '../types';
import { api } from '../api/axiosInstance';
export function getProducts(page: number, size: number): Promise<ResponseArray<Product>> {
    return api.get(`${import.meta.env.VITE_API}/products?page=${page}&size=${size}`);
}

export function getProductsbyShop(shopId: string, page: number, size: number): Promise<ResponseArray<Product>> {
    return api.get(`${import.meta.env.VITE_API}/products?shopId=${shopId}&page=${page}&size=${size}`);
}

export function getProductsbyShopAndCategory(
    shopId: string,
    categoryId: number,
    page: number,
    size: number,
): Promise<ResponseArray<Product>> {
    return api.get(
        `${import.meta.env.VITE_API}/products?shopId=${shopId}&categoryId=${categoryId}&page=${page}&size=${size}`,
    );
}

export function getProduct(id: string): Promise<AxiosResponse<Product>> {
    return api.get(`${import.meta.env.VITE_API}/products/${id}`);
}

export function createProduct(product: MinimalProduct): Promise<AxiosResponse<Product>> {
    return api.post(`${import.meta.env.VITE_API}/products`, product);
}

export function editProduct(product: MinimalProduct): Promise<AxiosResponse<Product>> {
    return api.put(`${import.meta.env.VITE_API}/products`, product);
}

export function deleteProduct(id: string): Promise<AxiosResponse<Product>> {
    return api.delete(`${import.meta.env.VITE_API}/products/${id}`);
}
