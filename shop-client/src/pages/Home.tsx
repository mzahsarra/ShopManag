import {
    Box,
    Fab,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Pagination,
    Select,
    type SelectChangeEvent,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filters, ShopCard, SearchBar } from '../components';
import { useAppContext } from '../context';
import { ShopService } from '../services';
import type {ResponseArray, Shop} from '../types';

const Home = () => {
    const navigate = useNavigate();
    const { setLoading } = useAppContext();
    const [shops, setShops] = useState<Shop[] | null>(null);
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [pageSelected, setPageSelected] = useState<number>(0);

    const [sort, setSort] = useState<string>('');
    const [filters, setFilters] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const getShops = () => {
        setLoading(true);
        let promisedShops: Promise<ResponseArray<Shop>>;

        const searchParam = searchQuery ? `&name=${encodeURIComponent(searchQuery)}` : '';

        if (sort) {
            promisedShops = ShopService.getShopsSorted(pageSelected, 9, sort + searchParam);
        } else if (filters) {
            promisedShops = ShopService.getShopsFiltered(pageSelected, 9, filters + searchParam);
        } else if (searchQuery) {
            promisedShops = ShopService.getShopsFiltered(pageSelected, 9, searchParam);
        } else {
            promisedShops = ShopService.getShops(pageSelected, 9);
        }

        promisedShops
            .then((res) => {
                setShops(res.data.content);
                setCount(res.data.totalPages);
                setPage(res.data.pageable.pageNumber + 1);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        // Debounce pour la recherche
        const timeoutId = setTimeout(() => {
            getShops();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [pageSelected, sort, filters, searchQuery]);

    const handleChangePagination = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPageSelected(value - 1);
    };

    const handleChangeSort = (event: SelectChangeEvent) => {
        setSort(event.target.value as string);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setPageSelected(0); // Réinitialiser à la première page lors d'une recherche
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <Typography variant="h2">Les boutiques</Typography>

            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}
            >
                <Fab variant="extended" color="primary" aria-label="add" onClick={() => navigate('/shop/create')}>
                    <AddIcon sx={{ mr: 1 }} />
                    Ajouter une boutique
                </Fab>
            </Box>

            {/* Barre de recherche */}
            <Box sx={{ width: '100%' }}>
                <SearchBar
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Rechercher une boutique par nom..."
                />
            </Box>

            {/* Sort and filters */}
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}
            >
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel id="demo-simple-select-label">Trier par</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={sort}
                        label="Trier par"
                        onChange={handleChangeSort}
                    >
                        <MenuItem value="">
                            <em>Aucun</em>
                        </MenuItem>
                        <MenuItem value="name">Nom</MenuItem>
                        <MenuItem value="createdAt">Date de création</MenuItem>
                        <MenuItem value="nbProducts">Nombre de produits</MenuItem>
                    </Select>
                </FormControl>

                <Filters setUrlFilters={setFilters} setSort={setSort} sort={sort} />
            </Box>

            {/* Shops */}
            <Grid container alignItems="center" rowSpacing={3} columnSpacing={3}>
                {shops?.map((shop) => (
                    <Grid key={shop.id} size={4}>
                        <ShopCard shop={shop} />
                    </Grid>
                ))}
            </Grid>

            {/* Pagination */}
            {shops?.length !== 0 ? (
                <Pagination count={count} page={page} siblingCount={1} onChange={handleChangePagination} />
            ) : (
                <Typography variant="h5" sx={{ mt: -1 }}>
                    Aucune boutique correspondante
                </Typography>
            )}
        </Box>
    );
};

export default Home;