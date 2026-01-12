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
import { CategoryCard } from '../components';
import { useAppContext } from '../context';
import { CategoryService } from '../services';
import type { Category } from '../types';

const Categories = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { setLoading } = useAppContext();
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [pageSelected, setPageSelected] = useState<number>(0);

    const getCategories = () => {
        setLoading(true);
        CategoryService.getCategories(pageSelected, 9)
            .then((res) => {
                setCategories(res.data.content);
                setCount(res.data.totalPages);
                setPage(res.data.pageable.pageNumber + 1);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        getCategories();
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
                Les catégories
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
                    onClick={() => navigate('/category/create')}
                    size={isMobile ? 'medium' : 'large'}
                >
                    <AddIcon sx={{ mr: isMobile ? 0 : 1 }} />
                    {!isMobile && 'Ajouter une catégorie'}
                </Fab>
            </Box>

            {/* Categories Grid - Responsive */}
            <Grid container alignItems="stretch" rowSpacing={3} columnSpacing={3}>
                {categories?.map((category) => (
                    <Grid key={category.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <CategoryCard category={category} />
                    </Grid>
                ))}
            </Grid>

            {/* Pagination */}
            {categories?.length !== 0 ? (
                <Pagination 
                    count={count} 
                    page={page} 
                    siblingCount={isMobile ? 0 : 1} 
                    onChange={handleChangePagination}
                    size={isMobile ? 'small' : 'medium'}
                />
            ) : (
                <Typography variant="h5" sx={{ mt: -1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    Aucune catégorie correspondante
                </Typography>
            )}
        </Box>
    );
};

export default Categories;
