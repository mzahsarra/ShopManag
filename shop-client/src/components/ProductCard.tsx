import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context';
import type { FormattedProduct, Product } from '../types';
import { formatterLocalizedProduct, priceFormatter } from '../utils';

type Props = {
    product: Product;
    displayShop?: boolean;
};

const ProductCard = ({ product, displayShop = false }: Props) => {
    const navigate = useNavigate();
    const { locale } = useAppContext();
    const [formattedProduct, setFormattedProduct] = useState<FormattedProduct>(
        formatterLocalizedProduct(product, locale),
    );

    useEffect(() => setFormattedProduct(formatterLocalizedProduct(product, locale)), [locale]);

    return (
        <Card
            sx={{
                minWidth: 275,
                height: displayShop ? { xs: 'auto', sm: 270 } : { xs: 'auto', sm: 230 },
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column'
            }}
            onClick={() => navigate(`/product/${formattedProduct.id}`)}
        >
            <CardContent sx={{ flex: 1 }}>
                <Typography
                    variant="h4"
                    color="text.primary"
                    gutterBottom
                    sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                >
                    {formattedProduct.name}
                </Typography>
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Prix : {priceFormatter(formattedProduct.price)}
                </Typography>
                {formattedProduct.description && (
                    <Typography
                        sx={{
                            mt: 1.5,
                            maxHeight: { xs: 'auto', sm: 50 },
                            overflow: 'hidden',
                            fontSize: { xs: '0.875rem', sm: '0.875rem' }
                        }}
                        color="text.secondary"
                    >
                        {formattedProduct.description}
                    </Typography>
                )}
                {displayShop && (
                    <Typography sx={{ mt: 1.5, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Boutique : {formattedProduct.shop?.name ?? 'Aucune'}
                    </Typography>
                )}
                <Typography sx={{ mt: 1.5, fontStyle: 'italic', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Catégories : {''}
                    {formattedProduct.categories.length === 0
                        ? 'Aucune'
                        : formattedProduct.categories.map((cat, index) => (
                            <span key={cat.id}>
                                  {cat.name}
                                {index === formattedProduct.categories.length - 1 ? '' : ', '}
                              </span>
                        ))}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default ProductCard;
