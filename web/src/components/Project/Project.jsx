import React from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProject } from '../../modules/API/projects';
import BaseButton from '../shared/BaseButton/BaseButton';
import LikeButton from '../shared/LikeButton/LikeButton';
import Avatar from '../shared/Avatar/Avatar';
import { flagEmoji, countryName } from '../../modules/countries';

const Project = () => {
    const { id } = useParams();
    const history = useHistory();

    const { data: project, error, isLoading } = useQuery({
        queryKey: ['project', id],
        queryFn: () => fetchProject(id),
    });

    if (error) return <div style={{ padding: 24 }}>Error: {error.message}</div>;
    if (isLoading || !project) return <div style={{ padding: 24 }}>Loading…</div>;

    const { author } = project;

    return (
        <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
            <h1 style={{ margin: 0 }}>{project.name}</h1>

            {author?.username && (
                <Link
                    to={`/user/${author.username}`}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 8,
                        color: 'inherit',
                        textDecoration: 'none',
                        opacity: 0.85,
                    }}
                >
                    <Avatar src={author.avatarUrl} username={author.username} displayName={author.displayName} size={28}/>
                    <span>@{author.username}</span>
                    {author.country && (
                        <span title={countryName(author.country)}>{flagEmoji(author.country)}</span>
                    )}
                </Link>
            )}

            {project.description && <p style={{ marginTop: 16 }}>{project.description}</p>}
            {project.forkedFrom && (
                <p style={{ opacity: 0.7, fontSize: 14 }}>
                    Forked from <Link to={`/project/${project.forkedFrom}`}>another project</Link>
                </p>
            )}

            <div style={{ margin: '16px 0' }}>
                {project.previewUrl ? (
                    <img
                        src={project.previewUrl}
                        alt={project.name}
                        style={{ maxWidth: '100%', background: '#fff' }}
                    />
                ) : 'No preview'}
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <LikeButton
                    projectId={project.id}
                    likesCount={project.likesCount}
                    likedByMe={project.likedByMe}
                />
                <BaseButton size="small" onClick={() => history.push(`/editor/${project.id}`)}>
                    {project.isMine ? 'Edit' : 'Fork & edit'}
                </BaseButton>
                {project.forkCount > 0 && (
                    <div style={{ opacity: 0.6, fontSize: 14 }}>Forks: {project.forkCount}</div>
                )}
            </div>
        </div>
    );
};

export default Project;
