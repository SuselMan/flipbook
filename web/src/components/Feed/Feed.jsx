import React, { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchFeed } from '../../modules/API/projects';
import LikeButton from '../shared/LikeButton/LikeButton';
import Avatar from '../shared/Avatar/Avatar';
import { flagEmoji, countryName } from '../../modules/countries';
import { useStyles } from './Feed.styles';

const SORTS = { new: 'new', top: 'top', hot: 'hot' };

const ProjectCard = ({ project, classes }) => {
    const { author } = project;
    return (
        <div className={classes.card}>
            <Link to={`/project/${project.id}`} className={classes.thumbWrap}>
                {project.thumbnailUrl ? (
                    <img
                        src={project.thumbnailUrl}
                        alt={project.name || 'Untitled'}
                        className={classes.thumb}
                        onMouseEnter={(e) => { if (project.previewUrl) e.currentTarget.src = project.previewUrl; }}
                        onMouseLeave={(e) => { if (project.thumbnailUrl) e.currentTarget.src = project.thumbnailUrl; }}
                    />
                ) : <div className={classes.thumbPlaceholder}/>}
            </Link>
            <div className={classes.meta}>
                <Link to={`/project/${project.id}`} className={classes.name}>
                    {project.name || 'Untitled'}
                </Link>
                <LikeButton
                    projectId={project.id}
                    likesCount={project.likesCount || 0}
                    likedByMe={!!project.likedByMe}
                />
            </div>
            {author?.username && (
                <Link to={`/user/${author.username}`} className={classes.author}>
                    <Avatar
                        src={author.avatarUrl}
                        username={author.username}
                        displayName={author.displayName}
                        size={24}
                    />
                    <span className={classes.authorName}>
                        @{author.username}
                    </span>
                    {author.country && (
                        <span title={countryName(author.country)} className={classes.flag}>
                            {flagEmoji(author.country)}
                        </span>
                    )}
                </Link>
            )}
        </div>
    );
};

const Feed = () => {
    const { sort: sortParam } = useParams();
    const sort = SORTS[sortParam] || 'new';
    const classes = useStyles();
    const sentinelRef = useRef(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
    } = useInfiniteQuery({
        queryKey: ['feed', sort, 'global'],
        queryFn: ({ pageParam }) => fetchFeed({ sort, scope: 'global', cursor: pageParam }),
        getNextPageParam: (last) => last?.nextCursor || undefined,
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

    const items = data?.pages?.flatMap((p) => p.items) || [];

    return (
        <div className={classes.container}>
            {error && <div className={classes.error}>Failed to load: {error.message}</div>}
            <div className={classes.grid}>
                {items.map((p) => <ProjectCard key={p.id} project={p} classes={classes}/>)}
            </div>
            {isLoading && <div className={classes.status}>Loading…</div>}
            {!isLoading && items.length === 0 && <div className={classes.status}>No projects yet</div>}
            <div ref={sentinelRef} style={{ height: 1 }}/>
            {isFetchingNextPage && <div className={classes.status}>Loading more…</div>}
        </div>
    );
};

export default Feed;
