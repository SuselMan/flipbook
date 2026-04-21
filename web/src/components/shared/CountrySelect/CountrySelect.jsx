import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { countryList, flagEmoji } from '../../../modules/countries';

const CountrySelect = ({ value, onChange, label = 'Country', disabled, helperText }) => {
    const selected = value ? countryList.find((c) => c.code === value) || null : null;
    return (
        <Autocomplete
            options={countryList}
            value={selected}
            onChange={(_e, v) => onChange?.(v?.code || null)}
            disabled={disabled}
            getOptionLabel={(o) => o?.name || ''}
            isOptionEqualToValue={(o, v) => o?.code === v?.code}
            renderOption={(props, option) => (
                <li {...props} key={option.code}>
                    <span style={{ marginRight: 8, fontSize: 18 }}>{flagEmoji(option.code)}</span>
                    {option.name}
                </li>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    variant="standard"
                    helperText={helperText}
                />
            )}
        />
    );
};

export default CountrySelect;
