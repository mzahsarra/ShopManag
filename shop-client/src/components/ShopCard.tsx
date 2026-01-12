import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import type { Shop } from '../types';
import { pluralize } from '../utils';

type Props = {
    shop: Shop;
};

const ShopCard = ({ shop }: Props) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/shop/${shop.id}`);
    };

    return (
        <Card
            sx={{
                minWidth: 275,
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
            onClick={handleClick}
        >
            <CardContent sx={{ flex: 1 }}>
                <Typography
                    variant="h4"
                    color="text.primary"
                    gutterBottom
                    sx={{
                        textAlign: 'center',
                        fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}
                >
                    {shop.name}
                </Typography>
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {shop.nbProducts} {pluralize('produit', shop.nbProducts)}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {shop.nbCategories} {pluralize('catégorie', shop.nbProducts)}
                </Typography>
                <Typography sx={{ my: 1.5, fontSize: { xs: '0.875rem', sm: '1rem' } }} color="text.secondary">
                    Créée le : {moment(shop.createdAt).format('DD/MM/YYYY')}
                </Typography>
                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    En congé : {shop.inVacations ? 'oui' : 'non'}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default ShopCard;