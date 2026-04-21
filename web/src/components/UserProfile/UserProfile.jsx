import React, { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchUserProfile, fetchUserProjects } from '../../modules/API/projects';
import Avatar from '../shared/Avatar/Avatar';
import LikeButton from '../shared/LikeButton/LikeButton';
import { flagEmoji, countryName } from '../../modules/countries';
import { useStyles } from './UserProfile.styles';

const UserProfile = () => {
    const { username } = useParams();
    const classes = useStyles();
    const sentinelRef = useRef(null);

    const { data: user, error: userError } = useQuery({
        queryKey: ['user-profile', username],
        queryFn: () => fetchUserProfile(username),
    });

    const {
        data: projectsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: projectsLoading,
    } = useInfiniteQuery({
        queryKey: ['user-projects', username],
        queryFn: ({ pageParam }) => fetchUserProjects(username, { cursor: pageParam }),
        getNextPageParam: (last) => last?.nextCursor || undefined,
        enabled: !!user,
    });

    useEffect(() => {
        if (!sentinelRef.current) return;
        const el = sentinelRef.current;
        const obs = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }, { rootMargin: '400px' });
        obs.observe(el);
        return () => obs.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (userError) {
        return <div className={classes.container}>
            <div className={classes.status}>User not found</div>
        </div>;
    }
    if (!user) {
        return <div className={classes.container}><div className={classes.status}>Loading…</div></div>;
    }

    const items = projectsData?.pages?.flatMap((p) => p.items) || [];
    const joined = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
        : '';

    return (
        <div className={classes.container}>
            <div className={classes.headerCard}>
                <Avatar
                    src={user.avatarUrl}
                    username={user.username}
                    displayName={user.displayName}
                    size={96}
                />
                <div className={classes.headerText}>
                    <h1 className={classes.displayName}>
                        {user.displayName || user.username}
                        {user.country && (
                            <span title={countryName(user.country)} className={classes.flag}>
                                {flagEmoji(user.country)}
                            </span>
                        )}
                    </h1>
                    <div className={classes.handle}>@{user.username}</div>
                    {user.bio && <p className={classes.bio}>{user.bio}</p>}
                    <div className={classes.stats}>
                        <span>♥ {user.karma} karma</span>
                        <span>{user.publishedCount} published</span>
                        {joined && <span>Joined {joined}</span>}
                    </div>
                </div>
            </div>

            <h2 className={classes.sectionTitle}>Projects</h2>
            <div className={classes.grid}>
                {items.map((p) => (
                    <div key={p.id} className={classes.card}>
                        <Link to={`/project/${p.id}`} className={classes.thumbWrap}>
                            {p.thumbnailUrl
                                ? <img
                                      src={p.thumbnailUrl}
                                      alt={p.name}
                                      className={classes.thumb}
                                      onMouseEnter={(e) => { if (p.previewUrl) e.currentTarget.src = p.previewUrl; }}
                                      onMouseLeave={(e) => { if (p.thumbnailUrl) e.currentTarget.src = p.thumbnailUrl; }}
                                  />
                                : <div className={classes.thumbPlaceholder}/>}
                        </Link>
                        <div className={classes.meta}>
                            <Link to={`/project/${p.id}`} className={classes.name}>
                                {p.name || 'Untitled'}
                            </Link>
                            <LikeButton projectId={p.id} likesCount={p.likesCount || 0} likedByMe={!!p.likedByMe}/>
                        </div>
                    </div>
                ))}
            </div>
            {!projectsLoading && items.length === 0 && (
                <div className={classes.status}>No projects yet.</div>
            )}
            <div ref={sentinelRef} style={{ height: 1 }}/>
            {isFetchingNextPage && <div className={classes.status}>Loading more…</div>}
        </div>
    );
};

export default UserProfile;
