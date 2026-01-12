import { CategoryService, ProductService } from '../services';
import { useEffect, useState } from 'react';
import type { Category, Product, ResponseArray } from '../types';
import { Box, FormControl, Grid, Pagination, Typography, useMediaQuery, useTheme } from '@mui/material';
import ProductCard from './ProductCard';
import { useAppContext } from '../context';
import SelectPaginate from './SelectPaginate';

type Props = {
    shopId: string;
};

const ShopProducts = ({ shopId }: Props) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { setLoading } = useAppContext();
    const [products, setProducts] = useState<Product[] | null>(null);
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [pageSelected, setPageSelected] = useState<number>(0);
    const [filter, setFilter] = useState<Category | null>(null);

    const getProducts = () => {
        setLoading(true);
        let promisedProducts: Promise<ResponseArray<Product>>;

        if (filter && filter.name !== 'Toutes les catégories') {
            promisedProducts = ProductService.getProductsbyShopAndCategory(shopId, filter.id, pageSelected, 6);
        } else {
            promisedProducts = ProductService.getProductsbyShop(shopId, pageSelected, 6);
        }

        promisedProducts
            .then((res) => {
                setProducts(res.data.content);
                setCount(res.data.totalPages);
                setPage(res.data.pageable.pageNumber + 1);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        getProducts();
    }, [shopId, pageSelected, filter]);

    const handleChangePagination = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPageSelected(value - 1);
    };

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: { xs: 3, sm: 4, md: 5 } }}>
            {/* Filters */}
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}
            >
                <FormControl sx={{ minWidth: { xs: '100%', sm: 220 } }}>
                    <SelectPaginate
                        value={filter}
                        onChange={setFilter}
                        placeholder="Catégorie"
                        refetch={CategoryService.getCategories}
                        defaultLabel="Toutes les catégories"
                    />
                </FormControl>
            </Box>

            <Grid container alignItems="stretch" rowSpacing={3} columnSpacing={3}>
                {products?.map((product) => (
                    <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>

            {products?.length !== 0 ? (
                <Pagination
                    count={count}
                    page={page}
                    siblingCount={isMobile ? 0 : 1}
                    onChange={handleChangePagination}
                    size={isMobile ? 'small' : 'medium'}
                />
            ) : (
                <Typography variant="h6" sx={{ mt: -4, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Aucun produit correspondant
                </Typography>
            )}
        </Box>
    );
};

export default ShopProducts;
