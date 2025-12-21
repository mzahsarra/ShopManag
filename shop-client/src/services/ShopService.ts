import type { MinimalShop } from './../types/shop';
import axios, {type AxiosResponse } from 'axios';
import type { Shop } from '../types';
import type { ResponseArray } from '../types/response';

export function getShops(page: number, size: number): Promise<ResponseArray<Shop>> {
    return axios.get(`${import.meta.env.VITE_API}/shops?page=${page}&size=${size}`);
}

export function getShopsSorted(page: number, size: number, sort: string): Promise<ResponseArray<Shop>> {
    return axios.get(`${import.meta.env.VITE_API}/shops?page=${page}&size=${size}&sortBy=${sort}`);
}

export function getShopsFiltered(page: number, size: number, urlFilters: string): Promise<ResponseArray<Shop>> {
    return axios.get(`${import.meta.env.VITE_API}/shops?page=${page}&size=${size}${urlFilters}`);
}

/**
 * Méthode générique qui gère tous les paramètres (recherche, tri, filtres, pagination)
 */
export function getShopsWithParams(queryString: string): Promise<ResponseArray<Shop>> {
    return axios.get(`${import.meta.env.VITE_API}/shops?${queryString}`);
}

export function getShop(id: string): Promise<AxiosResponse<Shop>> {
    return axios.get(`${import.meta.env.VITE_API}/shops/${id}`);
}

export function createShop(shop: MinimalShop): Promise<AxiosResponse<Shop>> {
    return axios.post(`${import.meta.env.VITE_API}/shops`, shop);
}

export function editShop(shop: MinimalShop): Promise<AxiosResponse<Shop>> {
    if (!shop.id) {
        throw new Error('L\'id est requis pour la modification');
    }
    return axios.put(`${import.meta.env.VITE_API}/shops`, shop);
}

export function deleteShop(id: string): Promise<AxiosResponse<Shop>> {
    return axios.delete(`${import.meta.env.VITE_API}/shops/${id}`);
}