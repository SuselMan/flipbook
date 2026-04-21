import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useLiveQuery } from 'dexie-react-hooks';
import { fetchMyProjects } from '../../modules/API/projects';
import { db } from '../../modules/db/db';
import { deleteDraft, setCurrentDraftId } from '../../modules/db/drafts';
import { isAuthenticated } from '../../modules/API/API';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import Avatar from '../shared/Avatar/Avatar';
import { useStyles } from './MyProjects.styles';

const PublishedTab = () => {
    const classes = useStyles();
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
        useInfiniteQuery({
            queryKey: ['me', 'projects'],
            queryFn: ({ pageParam }) => fetchMyProjects({ cursor: pageParam }),
            getNextPageParam: (last) => last?.nextCursor || undefined,
            enabled: isAuthenticated(),
        });

    if (!isAuthenticated()) return <div className={classes.status}>Please <Link to="/login">login</Link> to view your projects.</div>;
    if (error) return <div className={classes.status}>Error: {error.message}</div>;

    const items = data?.pages?.flatMap((p) => p.items) || [];

    return (
        <div>
            <div className={classes.grid}>
                {items.map((p) => (
                    <Link key={p.id} to={`/project/${p.id}`} className={classes.card}>
                        <div className={classes.thumbWrap}>
                            {p.thumbnailUrl
                                ? <img src={p.thumbnailUrl} alt={p.name} className={classes.thumb}/>
                                : <div className={classes.thumbPlaceholder}/>}
                        </div>
                        <div className={classes.meta}>
                            <div className={classes.name}>{p.name || 'Untitled'}</div>
                            <div className={classes.stats}>♥ {p.likesCount || 0}</div>
                        </div>
                    </Link>
                ))}
            </div>
            {isLoading && <div className={classes.status}>Loading…</div>}
            {!isLoading && items.length === 0 && <div className={classes.status}>No published projects yet</div>}
            {hasNextPage && (
                <button className={classes.loadMore} onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? 'Loading…' : 'Load more'}
                </button>
            )}
        </div>
    );
};

const DraftsTab = () => {
    const classes = useStyles();
    const history = useHistory();
    const drafts = useLiveQuery(
        () => db.drafts.orderBy('updatedAt').reverse().toArray(),
        [],
    );

    const open = (id) => {
        setCurrentDraftId(id);
        history.push(`/editor/draft/${id}`);
    };

    const remove = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Delete this draft? This cannot be undone.')) {
            await deleteDraft(id);
        }
    };

    if (drafts === undefined) return <div className={classes.status}>Loading…</div>;
    if (drafts.length === 0) return <div className={classes.status}>No drafts yet. <Link to="/">Start drawing</Link>.</div>;

    return (
        <div className={classes.grid}>
            {drafts.map((d) => (
                <div key={d.id} className={classes.card} onClick={() => open(d.id)} role="button">
                    <div className={classes.thumbWrap}>
                        <div className={classes.thumbPlaceholder}/>
                    </div>
                    <div className={classes.meta}>
                        <div className={classes.name}>{d.name || 'Untitled draft'}</div>
                        <button className={classes.deleteBtn} onClick={(e) => remove(e, d.id)}>✕</button>
                    </div>
                    <div className={classes.draftMeta}>
                        {d.forkedFrom ? 'Fork · ' : ''}
                        {d.publishedAs ? 'Published · ' : ''}
                        Updated {new Date(d.updatedAt).toLocaleDateString()}
                    </div>
                </div>
            ))}
        </div>
    );
};

const MyProjects = () => {
    const classes = useStyles();
    const { data: me } = useCurrentUser();
    const [tab, setTab] = useState('published');
    return (
        <div className={classes.container}>
            {me && (
                <div className={classes.profileRow}>
                    <Avatar src={me.avatarUrl} username={me.username} displayName={me.displayName} size={48}/>
                    <div className={classes.profileText}>
                        <Link to={`/user/${me.username}`} className={classes.profileName}>
                            {me.displayName || me.username}
                        </Link>
                        <div className={classes.profileHandle}>@{me.username}</div>
                    </div>
                    <Link to="/me/settings" className={classes.settingsLink}>Edit profile</Link>
                </div>
            )}
            <div className={classes.tabs}>
                <button
                    className={tab === 'published' ? classes.tabActive : classes.tab}
                    onClick={() => setTab('published')}
                >Published</button>
                <button
                    className={tab === 'drafts' ? classes.tabActive : classes.tab}
                    onClick={() => setTab('drafts')}
                >Drafts</button>
            </div>
            {tab === 'published' ? <PublishedTab/> : <DraftsTab/>}
        </div>
    );
};

export default MyProjects;
