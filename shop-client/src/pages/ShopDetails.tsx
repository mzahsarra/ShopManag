import { Box, Paper, Typography } from '@mui/material';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ActionButtons, ShopProducts } from '../components';
import { ShopService } from '../services';
import type { Shop } from '../types';
import { useAppContext, useToastContext } from '../context';
import { pluralize } from '../utils';

const DAY: Record<number, string> = {
    1: 'Lundi',
    2: 'Mardi',
    3: 'Mercredi',
    4: 'Jeudi',
    5: 'Vendredi',
    6: 'Samedi',
    7: 'Dimanche',
};

const ShopDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setLoading } = useAppContext();
    const { setToast } = useToastContext();
    const [shop, setShop] = useState<Shop | null>(null);

    const getShop = (shopId: string) => {
        ShopService.getShop(shopId).then((res) => {
            res.data.openingHours = res.data.openingHours.sort((a, b) => a.day - b.day);
            setShop(res.data);
        });
    };

    useEffect(() => {
        id && getShop(id);
    }, [id]);

    const displayHours = (hours: string): string => {
        return moment(hours, 'HH:mm').format('HH:mm');
    };

    const handleDelete = () => {
        setLoading(true);
        id &&
        ShopService.deleteShop(id)
            .then(() => {
                navigate('/');
                setToast({ severity: 'success', message: 'La boutique a bien été supprimée' });
            })
            .catch(() => {
                setToast({ severity: 'error', message: 'Une erreur est survenue lors de la suppresion' });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleEdit = () => {
        navigate(`/shop/edit/${id}`);
    };

    if (!shop) return <></>;

    return (
        <Paper
            elevation={1}
            sx={{
                position: 'relative',
                padding: { xs: 2, sm: 3, md: 4 },
            }}
        >
            <ActionButtons handleDelete={handleDelete} handleEdit={handleEdit} />

            <Typography
                variant="h3"
                sx={{
                    textAlign: 'center',
                    marginBottom: 3,
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    pr: { xs: 8, sm: 0 }
                }}
            >
                {shop.name}
            </Typography>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' } }}>
                Cette boutique comporte {shop.nbProducts} {pluralize('produit', shop.nbProducts)}
            </Typography>
            <Typography sx={{ my: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {shop.inVacations ? 'En congé actuellement' : "N'est pas en congé actuellement"}
            </Typography>
            <Typography sx={{ my: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }} color="text.secondary">
                Boutique créée le : {moment(shop.createdAt).format('DD/MM/YYYY')}
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    my: 4,
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        mb: 2,
                        fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem' }
                    }}
                >
                    Horaires d&apos;ouverture :
                </Typography>
                {shop.openingHours.map((openingHour) => (
                    <Box
                        key={openingHour.id}
                        sx={{
                            width: { xs: '100%', sm: 250 },
                            maxWidth: 300,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: { xs: 2, sm: 0 }
                        }}
                    >
                        <Typography sx={{ mb: 1.5, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            {DAY[openingHour.day]}
                        </Typography>
                        <Typography sx={{ mb: 1.5, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            {displayHours(openingHour?.openAt)} - {displayHours(openingHour?.closeAt)}
                        </Typography>
                    </Box>
                ))}
            </Box>

            <Typography
                variant="h4"
                sx={{
                    textAlign: 'center',
                    mb: 2,
                    fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem' }
                }}
            >
                Les produits :
            </Typography>
            {id && <ShopProducts shopId={id} />}
        </Paper>
    );
};

export default ShopDetails;