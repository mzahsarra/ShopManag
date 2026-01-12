import {
    Box,
    Button,
    Divider,
    Fab,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Switch,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShopService } from '../services';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import type { MinimalShop, ObjectPropertyString } from '../types';
import { useAppContext, useToastContext } from '../context';
import type {AxiosError} from "axios";

const schema = (shop: MinimalShop) => ({
    name: shop.name ? '' : 'Ce champ est requis',
});

const ShopForm = () => {
    const { id } = useParams();
    const isAddMode = !id;
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { setLoading } = useAppContext();
    const { setToast } = useToastContext();
    const [errors, setErrors] = useState<ObjectPropertyString<MinimalShop>>();
    const [shop, setShop] = useState<MinimalShop>({
        name: '',
        inVacations: false,
        openingHours: [],
    });

    useEffect(() => {
        if (!isAddMode && id) {
            setLoading(true);
            ShopService.getShop(id)
                .then((res) => {
                    setShop({
                        ...res.data,
                        id: id,
                    });
                })
                .finally(() => setLoading(false));
        }
    }, [id, isAddMode, setLoading]);

    const createShop = () => {
        setLoading(true);
        ShopService.createShop(shop)
            .then(() => {
                navigate('/');
                setToast({ severity: 'success', message: 'La boutique a bien été créée' });
            })
            .catch((error: AxiosError<{message: string}>) => {
                setToast({ severity: 'error', message: error.response?.data?.message || 'Une erreur est survenue lors de la création' });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const editShop = () => {
        setLoading(true);
        ShopService.editShop(shop)
            .then(() => {
                navigate(`/shop/${id}`);
                setToast({ severity: 'success', message: 'La boutique a bien été modifiée' });
            })
            .catch((error: AxiosError<{message: string}>) => {
                setToast({ severity: 'error', message: error.response?.data?.message || 'Une erreur est survenue lors de la modification'      });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleChange = (index: number, key: string, value: number | string | undefined) => {
        const openingHours = [...shop.openingHours];
        const openingHour = {
            ...openingHours[index],
            [key]: value,
        };
        openingHours[index] = openingHour;
        setShop({ ...shop, openingHours });
    };

    const handleClickAddHours = () => {
        setShop({ ...shop, openingHours: [...shop.openingHours, { day: 1, openAt: '09:00:00', closeAt: '18:00:00' }] });
    };

    const handleClickClearHours = (index: number) => {
        setShop({ ...shop, openingHours: shop.openingHours.filter((_o, i) => i !== index) });
    };

    const validate = () => {
        const validationErrors = schema(shop);
        setErrors(validationErrors);
        return Object.values(validationErrors).every((error) => error === '');
    };

    const handleSubmit = () => {
        if (!validate()) return;
        if (isAddMode) {
            createShop();
        } else {
            editShop();
        }
    };

    return (
        <Paper elevation={1} sx={{ padding: { xs: 2, sm: 3, md: 4 } }}>
            <Typography
                variant="h2"
                sx={{
                    marginBottom: 3,
                    textAlign: 'center',
                    fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
                }}
            >
                {isAddMode ? 'Ajouter une boutique' : 'Modifier la boutique'}
            </Typography>

            <Box sx={{ display: 'block', ml: 'auto', mr: 'auto', width: { xs: '100%', sm: '90%', md: '80%' }, mb: 3 }}>
                <Divider>Informations de la boutique</Divider>
                <FormControl sx={{ mt: 2, width: { xs: '100%', sm: '70%', md: '50%' } }}>
                    <TextField
                        autoFocus
                        required
                        label="Nom"
                        value={shop.name}
                        onChange={(e) => setShop({ ...shop, name: e.target.value })}
                        fullWidth
                        error={!!errors?.name}
                        helperText={errors?.name}
                        sx={{ marginBottom: 3 }}
                    />

                    <FormControlLabel
                        value="start"
                        control={
                            <Switch
                                checked={shop.inVacations}
                                onChange={(e) => setShop({ ...shop, inVacations: e.target.checked })}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />
                        }
                        label="En congé"
                        sx={{ marginBottom: 2 }}
                    />
                </FormControl>

                {/* OpeningHours */}
                <Divider>Horaires d&apos;ouverture de la boutique</Divider>
                <Box sx={{ mt: 1, mb: 3 }}>
                    <Fab size="small" color="primary" aria-label="add" onClick={handleClickAddHours}>
                        <AddIcon />
                    </Fab>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 3 }}>
                    {shop.openingHours.map((openingHour, index) => (
                        <Paper elevation={2} key={index} sx={{ position: 'relative' }}>
                            <Box
                                sx={{
                                    px: { xs: 1.5, sm: 2 },
                                    pb: 1,
                                    pt: { xs: 6, sm: 7 },
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    justifyContent: 'center',
                                    alignItems: { xs: 'stretch', sm: 'flex-start' },
                                    gap: { xs: 2, sm: 1 },
                                }}
                            >
                                <FormControl sx={{ marginBottom: { xs: 0, sm: 2 }, width: { xs: '100%', sm: 'auto' } }}>
                                    <InputLabel id={`day-select-label-${index}`}>Jour</InputLabel>
                                    <Select
                                        labelId={`day-select-label-${index}`}
                                        id={`day-select-${index}`}
                                        value={openingHour.day}
                                        label="Jour"
                                        onChange={(e) => handleChange(index, 'day', e.target.value)}
                                        sx={{ minWidth: { xs: '100%', sm: 125 } }}
                                    >
                                        <MenuItem value={1}>Lundi</MenuItem>
                                        <MenuItem value={2}>Mardi</MenuItem>
                                        <MenuItem value={3}>Mercredi</MenuItem>
                                        <MenuItem value={4}>Jeudi</MenuItem>
                                        <MenuItem value={5}>Vendredi</MenuItem>
                                        <MenuItem value={6}>Samedi</MenuItem>
                                        <MenuItem value={7}>Dimanche</MenuItem>
                                    </Select>
                                </FormControl>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <TimePicker
                                        label="Ouvre à"
                                        ampm={false}
                                        value={openingHour.openAt ? dayjs(`2014-08-18T${openingHour.openAt}`) : null}
                                        onChange={(v: Dayjs | null) =>
                                            handleChange(index, 'openAt', v ? v.format('HH:mm:ss') : undefined)
                                        }
                                        slotProps={{
                                            textField: {
                                                variant: 'outlined',
                                                size: 'small',
                                                fullWidth: true
                                            }
                                        }}
                                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                                    />
                                </LocalizationProvider>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <TimePicker
                                        label="Ferme à"
                                        ampm={false}
                                        value={openingHour.closeAt ? dayjs(`2014-08-18T${openingHour.closeAt}`) : null}
                                        onChange={(v: Dayjs | null) =>
                                            handleChange(index, 'closeAt', v ? v.format('HH:mm:ss') : undefined)
                                        }
                                        slotProps={{
                                            textField: {
                                                variant: 'outlined',
                                                size: 'small',
                                                fullWidth: true
                                            }
                                        }}
                                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            <Fab
                                size="small"
                                color="primary"
                                sx={{ position: 'absolute', top: 5, right: 5 }}
                                onClick={() => handleClickClearHours(index)}
                            >
                                <ClearIcon />
                            </Fab>
                        </Paper>
                    ))}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button variant="contained" onClick={handleSubmit} fullWidth={isMobile} sx={{ maxWidth: isMobile ? 'none' : 'auto' }}>
                    Valider
                </Button>
            </Box>
        </Paper>
    );
};

export default ShopForm;