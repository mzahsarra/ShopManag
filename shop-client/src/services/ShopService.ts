import type { MinimalShop } from './../types/shop';
import {type AxiosResponse } from 'axios';
import { api } from '../api/axiosInstance';
import type { Shop } from '../types';
import type { ResponseArray } from '../types/response';

export function getShops(page: number, size: number): Promise<ResponseArray<Shop>> {
    return api.get(`${import.meta.env.VITE_API}/shops?page=${page}&size=${size}`);
}

export function getShopsSorted(page: number, size: number, sort: string): Promise<ResponseArray<Shop>> {
    return api.get(`${import.meta.env.VITE_API}/shops?page=${page}&size=${size}&sortBy=${sort}`);
}

export function getShopsFiltered(page: number, size: number, urlFilters: string): Promise<ResponseArray<Shop>> {
    return api.get(`${import.meta.env.VITE_API}/shops?page=${page}&size=${size}${urlFilters}`);
}


export function searchShops(page: number, size: number, q: string, filters: string = ''): Promise<ResponseArray<Shop>> {
    return api.get(
        `${import.meta.env.VITE_API}/shops?page=${page}&size=${size}&name=${encodeURIComponent(q)}${filters}`
    );
}

export function getShopsWithParams(queryString: string): Promise<ResponseArray<Shop>> {
    return api.get(`${import.meta.env.VITE_API}/shops?${queryString}`);
}

export function getShop(id: string): Promise<AxiosResponse<Shop>> {
    return api.get(`${import.meta.env.VITE_API}/shops/${id}`);
}

export function createShop(shop: MinimalShop): Promise<AxiosResponse<Shop>> {
    return api.post(`${import.meta.env.VITE_API}/shops`, shop);
}

export function editShop(shop: MinimalShop): Promise<AxiosResponse<Shop>> {
    if (!shop.id) {
        throw new Error('L\'id est requis pour la modification');
    }
    return api.put(`${import.meta.env.VITE_API}/shops`, shop);
}

export function deleteShop(id: string): Promise<AxiosResponse<Shop>> {
    return api.delete(`${import.meta.env.VITE_API}/shops/${id}`);
}