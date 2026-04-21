import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likeProject, unlikeProject } from '../../../modules/API/projects';
import { isAuthenticated } from '../../../modules/API/API';

const LikeButton = ({ projectId, likesCount = 0, likedByMe = false }) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => (likedByMe ? unlikeProject(projectId) : likeProject(projectId)),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['project', projectId] });
            const prev = queryClient.getQueryData(['project', projectId]);
            queryClient.setQueryData(['project', projectId], (old) =>
                old ? {
                    ...old,
                    likedByMe: !likedByMe,
                    likesCount: old.likesCount + (likedByMe ? -1 : 1),
                } : old,
            );
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
            window.location.href = '/login';
            return;
        }
        mutation.mutate();
    };

    return (
        <button
            onClick={onClick}
            style={{
                background: 'transparent',
                border: 'none',
                color: likedByMe ? '#ff4e70' : 'inherit',
                cursor: 'pointer',
                fontSize: 14,
                padding: 4,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
            }}
            disabled={mutation.isLoading}
        >
            <span>{likedByMe ? '♥' : '♡'}</span>
            <span>{likesCount}</span>
        </button>
    );
};

export default LikeButton;
