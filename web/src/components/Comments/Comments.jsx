import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    fetchComments,
    fetchReplies,
    postComment,
    deleteComment,
    hideComment,
    reportComment,
} from '../../modules/API/comments';
import { isAuthenticated } from '../../modules/API/API';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import Avatar from '../shared/Avatar/Avatar';
import BaseButton from '../shared/BaseButton/BaseButton';
import { useStyles } from './Comments.styles';

const MAX = 500;

const relTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d`;
    return d.toLocaleDateString();
};

const Composer = ({ projectId, parentId, onCancel, placeholder = 'Write a comment…', autoFocus }) => {
    const classes = useStyles();
    const queryClient = useQueryClient();
    const [text, setText] = useState('');
    const [error, setError] = useState(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (autoFocus && textareaRef.current) textareaRef.current.focus();
    }, [autoFocus]);

    const mutation = useMutation({
        mutationFn: () => postComment(projectId, { text, parentId }),
        onSuccess: () => {
            setText('');
            queryClient.invalidateQueries({ queryKey: ['comments', projectId] });
            if (parentId) {
                queryClient.invalidateQueries({ queryKey: ['replies', parentId] });
                onCancel?.();
            }
        },
        onError: (err) => setError(err.message || 'Failed to post'),
    });

    if (!isAuthenticated()) {
        return (
            <div className={classes.loginPrompt}>
                <Link to="/login">Sign in</Link> to join the conversation.
            </div>
        );
    }

    const submit = () => {
        const trimmed = text.replace(/\s+/g, ' ').trim();
        if (!trimmed) { setError('Empty.'); return; }
        if (trimmed.length > MAX) { setError(`Max ${MAX} characters.`); return; }
        setError(null);
        mutation.mutate();
    };

    return (
        <div className={classes.composer}>
            <textarea
                ref={textareaRef}
                className={classes.textarea}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                maxLength={MAX}
                rows={parentId ? 2 : 3}
                onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') submit();
                }}
            />
            <div className={classes.composerFooter}>
                <div className={classes.counter}>{text.length}/{MAX}</div>
                <div className={classes.composerActions}>
                    {error && <span className={classes.error}>{error}</span>}
                    {onCancel && (
                        <button type="button" className={classes.cancelBtn} onClick={onCancel}>
                            Cancel
                        </button>
                    )}
                    <BaseButton size="small" onClick={submit} disabled={mutation.isLoading || !text.trim()}>
                        {mutation.isLoading ? 'Posting…' : (parentId ? 'Reply' : 'Post')}
                    </BaseButton>
                </div>
            </div>
        </div>
    );
};

const CommentActions = ({ comment, projectId, isProjectOwner, onReply, isReplying }) => {
    const classes = useStyles();
    const queryClient = useQueryClient();

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['comments', projectId] });
        if (comment.parentId) {
            queryClient.invalidateQueries({ queryKey: ['replies', comment.parentId] });
        }
    };

    const onDelete = async () => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await deleteComment(comment.id);
            invalidate();
        } catch (err) {
            window.alert(err.message || 'Delete failed');
        }
    };

    const onHide = async () => {
        try {
            await hideComment(comment.id);
            invalidate();
        } catch (err) {
            window.alert(err.message || 'Hide failed');
        }
    };

    const onReport = async () => {
        const reason = window.prompt('Why are you reporting this?');
        if (reason === null) return;
        try {
            await reportComment(comment.id, reason);
            window.alert('Report submitted. Thanks.');
        } catch (err) {
            window.alert(err.message || 'Report failed');
        }
    };

    return (
        <div className={classes.actions}>
            {!comment.parentId && onReply && isAuthenticated() && (
                <button
                    type="button"
                    className={classes.actionBtn}
                    onClick={() => onReply(isReplying ? null : comment.id)}
                >
                    {isReplying ? 'Cancel' : 'Reply'}
                </button>
            )}
            {comment.isMine && (
                <button type="button" className={classes.actionBtn} onClick={onDelete}>Delete</button>
            )}
            {isProjectOwner && !comment.isMine && (
                <button type="button" className={classes.actionBtn} onClick={onHide}>Hide</button>
            )}
            {!comment.isMine && isAuthenticated() && (
                <button type="button" className={classes.actionBtn} onClick={onReport}>Report</button>
            )}
        </div>
    );
};

const CommentItem = ({ comment, projectId, isProjectOwner, isReply = false, onReply, replyingTo }) => {
    const classes = useStyles();
    const isReplying = replyingTo === comment.id;
    return (
        <div className={isReply ? classes.reply : classes.comment}>
            <Avatar
                src={comment.author?.avatarUrl}
                username={comment.author?.username}
                displayName={comment.author?.displayName}
                size={isReply ? 28 : 36}
            />
            <div className={classes.body}>
                <div className={classes.meta}>
                    {comment.author?.username ? (
                        <Link to={`/user/${comment.author.username}`} className={classes.name}>
                            {comment.author.displayName || comment.author.username}
                        </Link>
                    ) : (
                        <span className={classes.name}>Unknown</span>
                    )}
                    {comment.isOP && <span className={classes.opBadge}>OP</span>}
                    <span className={classes.time}>· {relTime(comment.createdAt)}</span>
                </div>
                <div className={classes.text}>{comment.text}</div>
                <CommentActions
                    comment={comment}
                    projectId={projectId}
                    isProjectOwner={isProjectOwner}
                    onReply={isReply ? null : onReply}
                    isReplying={isReplying}
                />
                {isReplying && (
                    <Composer
                        projectId={projectId}
                        parentId={comment.id}
                        autoFocus
                        placeholder={`Reply to @${comment.author?.username || 'user'}`}
                        onCancel={() => onReply(null)}
                    />
                )}
            </div>
        </div>
    );
};

const RepliesThread = ({ thread, projectId, isProjectOwner, onReply, replyingTo }) => {
    const classes = useStyles();
    const [expanded, setExpanded] = useState(false);

    const { data: expandedData } = useQuery({
        queryKey: ['replies', thread.id],
        queryFn: () => fetchReplies(thread.id, { limit: 100 }),
        enabled: expanded,
    });

    const replies = expanded ? (expandedData?.items || thread.replies) : thread.replies;

    return (
        <div className={classes.repliesBlock}>
            {replies.map((r) => (
                <CommentItem
                    key={r.id}
                    comment={r}
                    projectId={projectId}
                    isProjectOwner={isProjectOwner}
                    isReply
                    onReply={onReply}
                    replyingTo={replyingTo}
                />
            ))}
            {!expanded && thread.hasMoreReplies && (
                <button
                    type="button"
                    className={classes.showMore}
                    onClick={() => setExpanded(true)}
                >
                    Show all {thread.replyCount} replies
                </button>
            )}
        </div>
    );
};

const Comments = ({ projectId, projectOwnerId }) => {
    const classes = useStyles();
    const { data: me } = useCurrentUser();
    const [replyingTo, setReplyingTo] = useState(null);
    const sentinelRef = useRef(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
    } = useInfiniteQuery({
        queryKey: ['comments', projectId],
        queryFn: ({ pageParam }) => fetchComments(projectId, { cursor: pageParam }),
        getNextPageParam: (last) => last?.nextCursor || undefined,
    });

    useEffect(() => {
        if (!sentinelRef.current) return;
        const el = sentinelRef.current;
        const obs = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }, { rootMargin: '200px' });
        obs.observe(el);
        return () => obs.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const isProjectOwner = !!(me && projectOwnerId && String(me.id) === String(projectOwnerId));

    const threads = data?.pages?.flatMap((p) => p.items) || [];

    return (
        <div className={classes.container}>
            <h2 className={classes.title}>Comments</h2>
            <Composer projectId={projectId} placeholder="Write a comment…"/>
            {error && <div className={classes.error}>Failed to load: {error.message}</div>}
            <div className={classes.list}>
                {threads.map((c) => (
                    <div key={c.id} className={classes.thread}>
                        <CommentItem
                            comment={c}
                            projectId={projectId}
                            isProjectOwner={isProjectOwner}
                            onReply={setReplyingTo}
                            replyingTo={replyingTo}
                        />
                        {c.replyCount > 0 && (
                            <RepliesThread
                                thread={c}
                                projectId={projectId}
                                isProjectOwner={isProjectOwner}
                                onReply={setReplyingTo}
                                replyingTo={replyingTo}
                            />
                        )}
                    </div>
                ))}
            </div>
            {isLoading && <div className={classes.status}>Loading…</div>}
            {!isLoading && threads.length === 0 && (
                <div className={classes.status}>No comments yet. Be the first.</div>
            )}
            <div ref={sentinelRef} style={{ height: 1 }}/>
            {isFetchingNextPage && <div className={classes.status}>Loading more…</div>}
        </div>
    );
};

export default Comments;
