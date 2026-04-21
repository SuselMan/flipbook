import React, { useState, useRef, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import TextField from '@mui/material/TextField';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { updateMe, uploadAvatar, deleteAvatar } from '../../modules/API/projects';
import CountrySelect from '../shared/CountrySelect/CountrySelect';
import Avatar from '../shared/Avatar/Avatar';
import BaseButton from '../shared/BaseButton/BaseButton';
import { isAuthenticated } from '../../modules/API/API';
import { useStyles } from './Settings.styles';

const COUNTRY_COOLDOWN_DAYS = 7;

const resizeImageToWebp = (file) => new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const scale = Math.max(size / img.width, size / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);
        canvas.toBlob((blob) => {
            URL.revokeObjectURL(url);
            if (blob) resolve(blob);
            else reject(new Error('Failed to encode avatar'));
        }, 'image/webp', 0.92);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
});

const Settings = () => {
    const classes = useStyles();
    const history = useHistory();
    const queryClient = useQueryClient();
    const { data: me, isLoading } = useCurrentUser();

    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [country, setCountry] = useState(null);
    const [saving, setSaving] = useState(false);
    const [avatarBusy, setAvatarBusy] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const fileRef = useRef();

    useEffect(() => {
        if (me) {
            setDisplayName(me.displayName || '');
            setBio(me.bio || '');
            setCountry(me.country || null);
        }
    }, [me]);

    if (!isAuthenticated()) {
        history.replace('/login');
        return null;
    }
    if (isLoading || !me) return <div className={classes.container}>Loading…</div>;

    const countryChangedAt = me.countryChangedAt ? new Date(me.countryChangedAt).getTime() : 0;
    const daysSinceChange = countryChangedAt
        ? Math.floor((Date.now() - countryChangedAt) / (24 * 3_600_000))
        : null;
    const daysLeft = daysSinceChange != null && daysSinceChange < COUNTRY_COOLDOWN_DAYS
        ? COUNTRY_COOLDOWN_DAYS - daysSinceChange
        : 0;
    const countryLocked = daysLeft > 0 && country === me.country;

    const save = async () => {
        setError(null); setMessage(null); setSaving(true);
        try {
            const patch = { displayName, bio };
            if (country !== me.country) patch.country = country;
            const { user } = await updateMe(patch);
            queryClient.setQueryData(['me'], user);
            setMessage('Saved');
        } catch (err) {
            setError(err.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const onAvatarPick = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarBusy(true); setError(null); setMessage(null);
        try {
            const blob = await resizeImageToWebp(file);
            const { user } = await uploadAvatar(blob);
            queryClient.setQueryData(['me'], user);
            setMessage('Avatar updated');
        } catch (err) {
            setError(err.message || 'Avatar upload failed');
        } finally {
            setAvatarBusy(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const onAvatarDelete = async () => {
        setAvatarBusy(true); setError(null); setMessage(null);
        try {
            const { user } = await deleteAvatar();
            queryClient.setQueryData(['me'], user);
            setMessage('Avatar removed');
        } catch (err) {
            setError(err.message || 'Delete failed');
        } finally {
            setAvatarBusy(false);
        }
    };

    return (
        <div className={classes.container}>
            <h1 className={classes.title}>Settings</h1>

            {error && <div className={classes.error}>{error}</div>}
            {message && <div className={classes.message}>{message}</div>}

            <section className={classes.section}>
                <h2 className={classes.sectionTitle}>Avatar</h2>
                <div className={classes.avatarRow}>
                    <Avatar src={me.avatarUrl} username={me.username} displayName={me.displayName} size={96}/>
                    <div className={classes.avatarActions}>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={onAvatarPick}
                        />
                        <BaseButton size="small" onClick={() => fileRef.current?.click()} disabled={avatarBusy}>
                            Upload
                        </BaseButton>
                        {me.avatarUrl && (
                            <BaseButton size="small" onClick={onAvatarDelete} disabled={avatarBusy}>
                                Remove
                            </BaseButton>
                        )}
                    </div>
                </div>
            </section>

            <section className={classes.section}>
                <h2 className={classes.sectionTitle}>Account</h2>
                <TextField label="Email" variant="standard" value={me.email || ''} disabled/>
                <TextField label="Username" variant="standard" value={me.username} disabled helperText="Cannot be changed"/>
            </section>

            <section className={classes.section}>
                <h2 className={classes.sectionTitle}>Profile</h2>
                <TextField
                    label="Display name"
                    variant="standard"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value.slice(0, 50))}
                    inputProps={{ maxLength: 50 }}
                />
                <TextField
                    label="Bio"
                    variant="standard"
                    value={bio}
                    onChange={(e) => setBio(e.target.value.replace(/[\r\n]+/g, ' ').slice(0, 200))}
                    inputProps={{ maxLength: 200 }}
                    helperText={`${bio.length}/200`}
                />
                <CountrySelect
                    value={country}
                    onChange={setCountry}
                    label="Country"
                    disabled={countryLocked}
                    helperText={countryLocked
                        ? `You can change country again in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`
                        : 'Used for the local feed'}
                />
            </section>

            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <BaseButton size="small" onClick={save} disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                </BaseButton>
            </div>

            <section className={classes.section} style={{ marginTop: 24 }}>
                <h2 className={classes.sectionTitle}>More</h2>
                <Link to="/me/settings/hotkeys" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.85 }}>
                    ⌨  Customize hotkeys →
                </Link>
            </section>
        </div>
    );
};

export default Settings;
