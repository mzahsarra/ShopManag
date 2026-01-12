import { Paper, Typography } from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ActionButtons } from '../components';
import { useAppContext, useToastContext } from '../context';
import { ProductService } from '../services';
import type { FormattedProduct, Product } from '../types';
import { formatterLocalizedProduct, priceFormatter } from '../utils';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setLoading, locale } = useAppContext();
    const { setToast } = useToastContext();
    const [product, setProduct] = useState<Product | null>(null);
    const [formattedProduct, setFormattedProduct] = useState<FormattedProduct | null>();

    const getProduct = (productId: string) => {
        ProductService.getProduct(productId).then((res) => {
            setProduct(res.data);
        });
    };

    useEffect(() => {
        id && getProduct(id);
    }, [id]);

    useEffect(() => {
        product && setFormattedProduct(formatterLocalizedProduct(product, locale));
    }, [locale, product]);

    const handleDelete = () => {
        setLoading(true);
        id &&
        ProductService.deleteProduct(id)
            .then(() => {
                navigate('/product');
                setToast({ severity: 'success', message: 'Le produit a bien été supprimé' });
            })
            .catch(() => {
                setToast({ severity: 'error', message: 'Une erreur est survenue lors de la suppresion' });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleEdit = () => {
        navigate(`/product/edit/${id}`);
    };

    if (!formattedProduct) return <></>;

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
                {formattedProduct.name}
            </Typography>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' } }}>
                Prix : {priceFormatter(formattedProduct.price)}
            </Typography>
            {formattedProduct.description && (
                <Typography sx={{ mt: 1.5, fontSize: { xs: '0.875rem', sm: '1rem' } }} color="text.secondary">
                    Description : {formattedProduct.description}
                </Typography>
            )}
            <Typography sx={{ mt: 1.5, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Boutique :{' '}
                {formattedProduct.shop?.name ? (
                    <Link to={`/shop/${formattedProduct.shop?.id}`} style={{ color: '#607d8b' }}>
                        {formattedProduct.shop?.name}
                    </Link>
                ) : (
                    "N'appartient à aucune boutique"
                )}
            </Typography>
            <Typography sx={{ mt: 1.5, fontStyle: 'italic', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Catégories : {''}
                {formattedProduct.categories.length === 0
                    ? 'Aucune'
                    : formattedProduct.categories.map((cat, index) => (
                        <Fragment key={cat.id}>
                            <Link to={`/category/${cat.id}`} style={{ color: '#607d8b' }}>
                                {cat.name}
                            </Link>
                            <span>{index === formattedProduct.categories.length - 1 ? '' : ', '}</span>
                        </Fragment>
                    ))}
            </Typography>
        </Paper>
    );
};

export default ProductDetails;
