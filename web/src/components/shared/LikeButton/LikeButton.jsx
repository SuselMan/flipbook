import React, { useState } from 'react';
import clsx from 'clsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likeProject, unlikeProject } from '../../../modules/API/projects';
import { isAuthenticated } from '../../../modules/API/API';
import { ReactComponent as LikeIcon } from '../../../shared/icons/like.svg';
import { useStyles } from './LikeButton.styles';

const LikeButton = ({ projectId, likesCount = 0, likedByMe = false, size = 'small' }) => {
    const classes = useStyles();
    const queryClient = useQueryClient();
    const [popping, setPopping] = useState(false);

    const mutation = useMutation({
        mutationFn: () => (likedByMe ? unlikeProject(projectId) : likeProject(projectId)),
        onMutate: async () => {
            // Optimistic: patch both the single-project cache and any feed caches.
            await queryClient.cancelQueries({ queryKey: ['project', projectId] });
            const prev = queryClient.getQueryData(['project', projectId]);
            queryClient.setQueryData(['project', projectId], (old) =>
                old ? {
                    ...old,
                    likedByMe: !likedByMe,
                    likesCount: (old.likesCount || 0) + (likedByMe ? -1 : 1),
                } : old,
            );
            queryClient.getQueriesData({ queryKey: ['feed'] }).forEach(([key, data]) => {
                if (!data?.pages) return;
                queryClient.setQueryData(key, {
                    ...data,
                    pages: data.pages.map((page) => ({
                        ...page,
                        items: page.items.map((p) =>
                            p.id === projectId
                                ? {
                                    ...p,
                                    likedByMe: !likedByMe,
                                    likesCount: (p.likesCount || 0) + (likedByMe ? -1 : 1),
                                }
                                : p
                        ),
                    })),
                });
            });
            return { prev };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.prev) queryClient.setQueryData(['project', projectId], ctx.prev);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            queryClient.invalidateQueries({ queryKey: ['feed'] });
        },
    });

    const onClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated()) {
            window.location.assign('/login');
            return;
        }
        if (mutation.isLoading) return;
        setPopping(true);
        setTimeout(() => setPopping(false), 320);
        mutation.mutate();
    };

    const isBig = size === 'big';

    return (
        <div className={classes.wrapper}>
            <button
                type="button"
                className={clsx(classes.button, {
                    [classes.big]: isBig,
                    [classes.liked]: likedByMe,
                    [classes.pop]: popping,
                })}
                onClick={onClick}
                disabled={mutation.isLoading}
                aria-label={likedByMe ? 'Unlike' : 'Like'}
                aria-pressed={likedByMe}
            >
                <LikeIcon/>
            </button>
            <span className={clsx(classes.count, { [classes.countBig]: isBig })}>
                {likesCount}
            </span>
        </div>
    );
};

export default LikeButton;
