import {
    Box,
    Fab,
    Grid,
    Pagination,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../components';
import { useAppContext } from '../context';
import { ProductService } from '../services';
import type { Product } from '../types';

const Products = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { setLoading } = useAppContext();
    const [products, setProducts] = useState<Product[] | null>(null);
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [pageSelected, setPageSelected] = useState<number>(0);

    const getProducts = () => {
        setLoading(true);
        ProductService.getProducts(pageSelected, 9)
            .then((res) => {
                setProducts(res.data.content);
                setCount(res.data.totalPages);
                setPage(res.data.pageable.pageNumber + 1);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        getProducts();
    }, [pageSelected]);

    const handleChangePagination = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPageSelected(value - 1);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: { xs: 3, sm: 4, md: 5 } }}>
            <Typography 
                variant="h2"
                sx={{ 
                    fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                    textAlign: 'center'
                }}
            >
                Les produits
            </Typography>

            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}
            >
                <Fab 
                    variant={isMobile ? 'circular' : 'extended'} 
                    color="primary" 
                    aria-label="add" 
                    onClick={() => navigate('/product/create')}
                    size={isMobile ? 'medium' : 'large'}
                >
                    <AddIcon sx={{ mr: isMobile ? 0 : 1 }} />
                    {!isMobile && 'Ajouter un produit'}
                </Fab>
            </Box>

            {/* Products Grid - Responsive */}
            <Grid container alignItems="stretch" rowSpacing={3} columnSpacing={3}>
                {products?.map((product) => (
                    <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <ProductCard product={product} displayShop />
                    </Grid>
                ))}
            </Grid>

            {/* Pagination */}
            {products?.length !== 0 ? (
                <Pagination 
                    count={count} 
                    page={page} 
                    siblingCount={isMobile ? 0 : 1} 
                    onChange={handleChangePagination}
                    size={isMobile ? 'small' : 'medium'}
                />
            ) : (
                <Typography variant="h5" sx={{ mt: -1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    Aucun produit correspondant
                </Typography>
            )}
        </Box>
    );
};

export default Products;
