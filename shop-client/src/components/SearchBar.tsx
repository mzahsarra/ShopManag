import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { type ChangeEvent } from 'react';

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

const SearchBar = ({ value, onChange, placeholder = 'Rechercher...' }: Props) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
    };

    return (
        <TextField
            fullWidth
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            variant="outlined"
            size="small" // Ajout pour mobile
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                ),
            }}
            sx={{
                backgroundColor: 'white',
                '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                        borderColor: '#607d8b',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#607d8b',
                    },
                },
                // Responsive styles
                '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    padding: { xs: '8px', sm: '10px 14px' },
                },
            }}
        />
    );
};

export default SearchBar;