import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
    fetchProject,
    fetchProjectSource,
    forkProject,
} from '../../modules/API/projects';
import { unpackSource } from '../../modules/render/render';
import { createDraft, setCurrentDraftId } from '../../modules/db/drafts';
import { isAuthenticated } from '../../modules/API/API';

const EditProject = () => {
    const { id } = useParams();
    const history = useHistory();
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const project = await fetchProject(id);
                const isMine = !!project.isMine;

                if (!isMine) {
                    if (!isAuthenticated()) {
                        history.replace('/login');
                        return;
                    }
                    await forkProject(id);
                }

                const sourceBlob = await fetchProjectSource(id);
                const unpacked = await unpackSource(sourceBlob);

                const draft = await createDraft({
                    name: isMine ? project.name : `${project.name} (fork)`,
                    description: project.description,
                    state: {
                        layers: unpacked.layers,
                        layersMap: unpacked.layersMap,
                        framesMap: unpacked.framesMap,
                    },
                    forkedFrom: isMine ? project.forkedFrom || null : project.id,
                    publishedAs: isMine ? project.id : null,
                });
                setCurrentDraftId(draft.id);
                if (!cancelled) history.replace(`/editor/draft/${draft.id}`);
            } catch (err) {
                if (!cancelled) setError(err.message || String(err));
            }
        })();
        return () => { cancelled = true; };
    }, [id, history]);

    if (error) return <div style={{ padding: 24 }}>Failed to load project: {error}</div>;
    return <div style={{ padding: 24 }}>Loading project…</div>;
};

export default EditProject;
