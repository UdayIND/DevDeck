"use client";
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import { RoomProvider, useStorage, useUpdateMyPresence, useOthers, useSelf, useMutation } from '@/config/liveblocks.config';
import { LiveMap } from '@liveblocks/client';
import { nanoid } from 'nanoid';
import { Tree, NodeModel } from '@minoru/react-dnd-treeview';
import { useSession, signIn } from 'next-auth/react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const mockProjects = [
  { id: '1', name: 'Space Portfolio', description: 'A portfolio site for astronauts.', readme: '# Space Portfolio\n\nThis is a sample project README.\n\n- Built with Next.js\n- Space themed\n- Collaborative', files: [{ name: 'index.js', content: '// Welcome to Space Portfolio!\nconsole.log("Hello, world!");', type: 'js' }] },
  { id: '2', name: 'Dev Deck Core', description: 'Core engine for collaborative design.', readme: '# Dev Deck Core\n\nCollaborative design engine.', files: [{ name: 'core.ts', content: '// Dev Deck Core\nexport default {}', type: 'ts' }] },
  { id: '3', name: 'Open Source Docs', description: 'Documentation for open source tools.', readme: '# Open Source Docs\n\nDocs for open source.', files: [{ name: 'README.md', content: '# Open Source Docs', type: 'md' }] },
];

function getProjects() {
  const stored = localStorage.getItem("devhub-projects");
  return stored ? JSON.parse(stored) : mockProjects;
}
function saveProjects(projects: any[]) {
  localStorage.setItem("devhub-projects", JSON.stringify(projects));
}

function getRandomColor() {
  const COLORS = ["#00fff7", "#ff00c8", "#ffe600", "#00ff5a", "#fff", "#000", "#ff5722", "#2196f3", "#4caf50", "#e91e63", "#9c27b0"];
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}
function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase();
}

function getPresenceInfo(presence: any) {
  try {
    return presence?.message ? JSON.parse(presence.message) : {};
  } catch {
    return {};
  }
}

function FileTree({ files, onSelect, selectedFile, onContextMenu, onDrop }: any) {
  return (
    <Tree
      tree={files}
      rootId={0}
      render={(node: any, { depth = 0, isOpen = false, onToggle = () => {} }: { depth: number; isOpen: boolean; onToggle: () => void; }) => (
        <div style={{ marginLeft: depth * 16 }}>
          {node.droppable ? (
            <span className="font-bold text-accent-cyan mr-1">📁</span>
          ) : (
            <span className="mr-1">📄</span>
          )}
          <button
            className={`w-full text-left px-2 py-1 rounded hover:bg-gray-700 ${selectedFile?.id === node.id ? 'bg-gray-700 text-accent-cyan' : ''}`}
            onClick={() => onSelect(node)}
            onContextMenu={e => onContextMenu(e, node)}
          >
            {node.text}
          </button>
        </div>
      )}
      dragPreviewRender={(monitorProps: { item: any }) => <div>{monitorProps.item.text}</div>}
      onDrop={(dropResult: any) => {
        onDrop(dropResult);
        // TODO: Sync file tree changes with Liveblocks here
      }}
    />
  );
}

function ProjectDetailsInner({ params }: { params: { projectId: string } }) {
  const { data: session, status: sessionStatus } = useSession();
  const files = useStorage((root) => root.files || []);
  const readme = useStorage((root) => root.readme || '');
  const issues = useStorage((root) => root.issues || []);
  const updateMyPresence = useUpdateMyPresence();
  const others = useOthers();
  const self = useSelf();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [fileContent, setFileContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [addingFile, setAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState("js");
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [editingProject, setEditingProject] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editReadme, setEditReadme] = useState("");
  const [editVisibility, setEditVisibility] = useState("public");
  const [tab, setTab] = useState<'editor' | 'history' | 'issues'>('editor');
  const [commitMessage, setCommitMessage] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [newContributor, setNewContributor] = useState("");
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [newIssueDesc, setNewIssueDesc] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const router = useRouter();
  const [repoFiles, setRepoFiles] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [workflowRuns, setWorkflowRuns] = useState<any[]>([]);
  const [ciTab, setCiTab] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingCI, setLoadingCI] = useState(false);
  const accessToken = (session as any)?.accessToken;
  const [selectedRepoFile, setSelectedRepoFile] = useState<any>(null);
  const [repoFileContent, setRepoFileContent] = useState<string>('');
  const [repoFileSha, setRepoFileSha] = useState<string>('');
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [commitHistory, setCommitHistory] = useState<any[]>([]);
  const [prs, setPRs] = useState<any[]>([]);
  const [workflowLog, setWorkflowLog] = useState<string>('');
  const [creatingBranch, setCreatingBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [creatingPR, setCreatingPR] = useState(false);
  const [prTitle, setPRTitle] = useState('');
  const [prBody, setPRBody] = useState('');
  const [isGitHubRepo, setIsGitHubRepo] = useState(false);
  const [githubRepo, setGithubRepo] = useState<any>(null);

  // Liveblocks mutations
  const addFile = useMutation(({ storage }, file) => {
    const files = storage.get("files") || [];
    storage.set("files", [...files, file]);
  }, []);
  const updateFile = useMutation(({ storage }, fileName, content) => {
    const files = (storage.get("files") || []).map((f: any) => f.name === fileName ? { ...f, content } : f);
    storage.set("files", files);
  }, []);
  const deleteFile = useMutation(({ storage }, fileName) => {
    const files = (storage.get("files") || []).filter((f: any) => f.name !== fileName);
    storage.set("files", files);
  }, []);
  const renameFile = useMutation(({ storage }, oldName, newName) => {
    const files = (storage.get("files") || []).map((f: any) => f.name === oldName ? { ...f, name: newName } : f);
    storage.set("files", files);
  }, []);
  const setReadme = useMutation(({ storage }, newReadme) => {
    storage.set("readme", newReadme);
  }, []);
  const addIssue = useMutation(({ storage }, issue) => {
    const issues = storage.get("issues") || [];
    storage.set("issues", [issue, ...issues]);
  }, []);
  const updateIssue = useMutation(({ storage }, updatedIssue) => {
    const issues = (storage.get("issues") || []).map((i: any) => i.id === updatedIssue.id ? updatedIssue : i);
    storage.set("issues", issues);
  }, []);

  // Load project and files
  useEffect(() => {
    const projects = getProjects();
    const found = projects.find((p: any) => p.id === params.projectId);
    if (found) {
      setProject(found);
      setIsGitHubRepo(false);
      setLoading(false);
    } else if (params.projectId && accessToken) {
      // Try to fetch as GitHub repo
      setLoading(true);
      fetch(`https://api.github.com/repositories/${params.projectId}`, {
        headers: { Authorization: `token ${accessToken}` },
      })
        .then(res => res.ok ? res.json() : null)
        .then(repo => {
          if (repo && repo.id) {
            setGithubRepo(repo);
            setIsGitHubRepo(true);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [params.projectId, accessToken]);

  // Update file content when switching files
  useEffect(() => {
    setFileContent(selectedFile?.content || "");
    setIsDirty(false);
  }, [selectedFile]);

  // Load file history when file changes
  useEffect(() => {
    if (!project || !selectedFile) return;
    const key = `history-${project.id}-${selectedFile.name}`;
    const h = JSON.parse(localStorage.getItem(key) || '[]');
    setHistory(h);
  }, [project, selectedFile]);

  // Load contributors when project changes
  useEffect(() => {
    setContributors(project?.contributors || []);
  }, [project]);

  // On mount, set random name/color if not set
  useEffect(() => {
    const info = getPresenceInfo(self?.presence);
    if (!info.name || !info.color) {
      const name = `User-${nanoid(4)}`;
      const color = getRandomColor();
      updateMyPresence({ message: JSON.stringify({ name, color }) });
    }
  }, [self, updateMyPresence]);

  // Load repo files and workflows
  useEffect(() => {
    if (params.projectId && accessToken) {
      setLoadingFiles(true);
      // Fetch repo details (owner/name) from GitHub API
      fetch(`https://api.github.com/repositories/${params.projectId}`, {
        headers: { Authorization: `token ${accessToken}` },
      })
        .then(res => res.json())
        .then(repo => {
          // Fetch file tree
          fetch(`https://api.github.com/repos/${repo.full_name}/git/trees/${repo.default_branch}?recursive=1`, {
            headers: { Authorization: `token ${accessToken}` },
          })
            .then(res => res.json())
            .then(tree => {
              setRepoFiles(tree.tree || []);
              setLoadingFiles(false);
            });
          // Fetch workflows
          setLoadingCI(true);
          fetch(`https://api.github.com/repos/${repo.full_name}/actions/workflows`, {
            headers: { Authorization: `token ${accessToken}` },
          })
            .then(res => res.json())
            .then(data => {
              setWorkflows(data.workflows || []);
              setLoadingCI(false);
            });
          // Fetch workflow runs
          fetch(`https://api.github.com/repos/${repo.full_name}/actions/runs`, {
            headers: { Authorization: `token ${accessToken}` },
          })
            .then(res => res.json())
            .then(data => setWorkflowRuns(data.workflow_runs || []));
        });
    }
  }, [params.projectId, accessToken]);

  // Fetch branches and commits on repo load
  useEffect(() => {
    if (params.projectId && accessToken) {
      fetch(`https://api.github.com/repositories/${params.projectId}`, {
        headers: { Authorization: `token ${accessToken}` },
      })
        .then(res => res.json())
        .then(repo => {
          fetch(`https://api.github.com/repos/${repo.full_name}/branches`, {
            headers: { Authorization: `token ${accessToken}` },
          })
            .then(res => res.json())
            .then(branches => {
              setBranches(branches);
              setSelectedBranch(repo.default_branch);
            });
          fetch(`https://api.github.com/repos/${repo.full_name}/commits?sha=${repo.default_branch}`, {
            headers: { Authorization: `token ${accessToken}` },
          })
            .then(res => res.json())
            .then(setCommitHistory);
          fetch(`https://api.github.com/repos/${repo.full_name}/pulls`, {
            headers: { Authorization: `token ${accessToken}` },
          })
            .then(res => res.json())
            .then(setPRs);
        });
    }
  }, [params.projectId, accessToken]);

  // Save file content with commit
  const handleSave = () => {
    if (!project || !selectedFile) return;
    const projects = getProjects();
    const idx = projects.findIndex((p: any) => p.id === project.id);
    if (idx === -1) return;
    const fileIdx = projects[idx].files.findIndex((f: any) => f.name === selectedFile.name);
    if (fileIdx === -1) return;
    projects[idx].files[fileIdx].content = fileContent;
    saveProjects(projects);
    setIsDirty(false);
    setProject(projects[idx]);
    // Save commit to history
    const key = `history-${project.id}-${selectedFile.name}`;
    const h = JSON.parse(localStorage.getItem(key) || '[]');
    h.unshift({
      timestamp: Date.now(),
      message: commitMessage || 'Update',
      content: fileContent,
    });
    localStorage.setItem(key, JSON.stringify(h));
    setHistory(h);
    setCommitMessage('');
  };

  // Add new file
  const handleAddFile = () => {
    if (!project || !newFileName) return;
    const projects = getProjects();
    const idx = projects.findIndex((p: any) => p.id === project.id);
    if (idx === -1) return;
    if (projects[idx].files.some((f: any) => f.name === newFileName)) return alert("File already exists");
    const newFile = { name: newFileName, content: '', type: newFileType };
    projects[idx].files.push(newFile);
    saveProjects(projects);
    setProject(projects[idx]);
    setSelectedFile(newFile);
    setFileContent('');
    setAddingFile(false);
    setNewFileName("");
  };

  // Delete file
  const handleDeleteFile = (fileName: string) => {
    if (!project) return;
    if (!window.confirm(`Delete file ${fileName}?`)) return;
    const projects = getProjects();
    const idx = projects.findIndex((p: any) => p.id === project.id);
    if (idx === -1) return;
    projects[idx].files = projects[idx].files.filter((f: any) => f.name !== fileName);
    saveProjects(projects);
    setProject(projects[idx]);
    if (selectedFile?.name === fileName) {
      setSelectedFile(projects[idx].files[0] || null);
      setFileContent(projects[idx].files[0]?.content || "");
    }
  };

  // Rename file
  const handleRenameFile = (oldName: string) => {
    if (!project || !renameValue) return;
    const projects = getProjects();
    const idx = projects.findIndex((p: any) => p.id === project.id);
    if (idx === -1) return;
    if (projects[idx].files.some((f: any) => f.name === renameValue)) return alert("File already exists");
    const fileIdx = projects[idx].files.findIndex((f: any) => f.name === oldName);
    if (fileIdx === -1) return;
    projects[idx].files[fileIdx].name = renameValue;
    saveProjects(projects);
    setProject(projects[idx]);
    if (selectedFile?.name === oldName) setSelectedFile({ ...selectedFile, name: renameValue });
    setRenamingFile(null);
    setRenameValue("");
  };

  // Edit project
  const openEdit = () => {
    setEditName(project.name);
    setEditDescription(project.description);
    setEditReadme(project.readme);
    setEditVisibility(project.visibility || "public");
    setEditingProject(true);
  };
  const handleEditSave = () => {
    const projects = getProjects();
    const idx = projects.findIndex((p: any) => p.id === project.id);
    if (idx === -1) return;
    projects[idx].name = editName;
    projects[idx].description = editDescription;
    projects[idx].readme = editReadme;
    projects[idx].visibility = editVisibility;
    saveProjects(projects);
    setProject(projects[idx]);
    setEditingProject(false);
  };
  const handleDeleteProject = () => {
    if (!window.confirm("Delete this project?")) return;
    const projects = getProjects().filter((p: any) => p.id !== project.id);
    saveProjects(projects);
    router.push("/devhub/projects");
  };

  // Add contributor
  const handleAddContributor = () => {
    if (!newContributor) return;
    if (contributors.some((c: any) => c.email === newContributor)) return;
    const updated = [...contributors, { email: newContributor }];
    setContributors(updated);
    setNewContributor("");
    // Persist
    const projects = getProjects();
    const idx = projects.findIndex((p: any) => p.id === project.id);
    if (idx !== -1) {
      projects[idx].contributors = updated;
      saveProjects(projects);
      setProject(projects[idx]);
    }
  };

  // Remove contributor
  const handleRemoveContributor = (email: string) => {
    const updated = contributors.filter((c: any) => c.email !== email);
    setContributors(updated);
    const projects = getProjects();
    const idx = projects.findIndex((p: any) => p.id === project.id);
    if (idx !== -1) {
      projects[idx].contributors = updated;
      saveProjects(projects);
      setProject(projects[idx]);
    }
  };

  // Add issue
  const handleAddIssue = () => {
    if (!newIssueTitle) return;
    addIssue({ id: Date.now(), title: newIssueTitle, desc: newIssueDesc, status: 'open', comments: [] });
    setNewIssueTitle("");
    setNewIssueDesc("");
  };

  // Add comment
  const handleAddComment = () => {
    if (!selectedIssue || !newComment) return;
    const updatedIssue = {
      ...selectedIssue,
      comments: [...selectedIssue.comments, { text: newComment, ts: Date.now() }],
    };
    updateIssue(updatedIssue);
    setNewComment("");
    setSelectedIssue(updatedIssue);
  };

  const handleExport = () => {
    const data = JSON.stringify(project, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        // Merge or replace: here we replace for simplicity
        const projects = getProjects().map((p: any) => p.id === project.id ? imported : p);
        saveProjects(projects);
        setProject(imported);
        alert('Project imported!');
      } catch {
        alert('Invalid project file.');
      }
    };
    reader.readAsText(file);
  };

  // Presence bar
  const renderPresenceBar = () => (
    <div className="flex gap-2 mb-4 items-center">
      {self && (
        <div className="flex items-center gap-1">
          {(() => { const info = getPresenceInfo(self.presence); return <span className="w-4 h-4 rounded-full" style={{ background: info.color || '#00fff7' }}></span>; })()}
          <span className="text-xs font-bold">You</span>
        </div>
      )}
      {others.map((user) => {
        const info = getPresenceInfo(user.presence);
        return (
          <div key={user.connectionId} className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full" style={{ background: info.color || '#00fff7' }}></span>
            <span className="text-xs">{info.name || 'User'}</span>
          </div>
        );
      })}
    </div>
  );

  // Live cursors
  const renderCursors = () => (
    <>
      {others.map((user) => {
        const info = getPresenceInfo(user.presence);
        return user.presence?.cursor ? (
          <div
            key={user.connectionId}
            className="absolute pointer-events-none z-50"
            style={{
              left: user.presence.cursor.x,
              top: user.presence.cursor.y,
              color: info.color || '#00fff7',
            }}
          >
            <svg width="24" height="24" style={{ filter: "drop-shadow(0 0 4px #000)" }}>
              <circle cx="12" cy="12" r="8" fill={info.color || '#00fff7'} opacity={0.7} />
            </svg>
            <span className="text-xs font-bold" style={{ color: info.color || '#00fff7' }}>{info.name || 'User'}</span>
          </div>
        ) : null;
      })}
    </>
  );

  // Track mouse movement in editor area
  const editorAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!editorAreaRef.current) return;
      const rect = editorAreaRef.current.getBoundingClientRect();
      updateMyPresence({ cursor: { x: e.clientX - rect.left, y: e.clientY - rect.top } });
    };
    const area = editorAreaRef.current;
    if (area) {
      area.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (area) area.removeEventListener('mousemove', handleMouseMove);
    };
  }, [updateMyPresence]);

  // File open handler
  const handleOpenRepoFile = (file: any) => {
    setSelectedRepoFile(file);
    setRepoFileContent('');
    setRepoFileSha('');
    fetch(`https://api.github.com/repositories/${params.projectId}`, {
      headers: { Authorization: `token ${accessToken}` },
    })
      .then(res => res.json())
      .then(repo => {
        fetch(`https://api.github.com/repos/${repo.full_name}/contents/${file.path}?ref=${selectedBranch}`, {
          headers: { Authorization: `token ${accessToken}` },
        })
          .then(res => res.json())
          .then(data => {
            setRepoFileContent(atob(data.content));
            setRepoFileSha(data.sha);
          });
      });
  };

  // File save/commit handler
  const handleSaveRepoFile = (commitMsg: string) => {
    if (!selectedRepoFile || !repoFileSha) return;
    fetch(`https://api.github.com/repositories/${params.projectId}`, {
      headers: { Authorization: `token ${accessToken}` },
    })
      .then(res => res.json())
      .then(repo => {
        fetch(`https://api.github.com/repos/${repo.full_name}/contents/${selectedRepoFile.path}`, {
          method: 'PUT',
          headers: {
            Authorization: `token ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: commitMsg,
            content: btoa(repoFileContent),
            sha: repoFileSha,
            branch: selectedBranch,
          }),
        })
          .then(res => res.json())
          .then(() => alert('File committed to GitHub!'));
      });
  };

  // Branch switch handler
  const handleSwitchBranch = (branch: string) => {
    setSelectedBranch(branch);
    setSelectedRepoFile(null);
    setRepoFileContent('');
    setRepoFileSha('');
    // Optionally reload file tree for the branch
  };

  // Branch create handler
  const handleCreateBranch = () => {
    if (!newBranchName) return;
    fetch(`https://api.github.com/repositories/${params.projectId}`, {
      headers: { Authorization: `token ${accessToken}` },
    })
      .then(res => res.json())
      .then(repo => {
        fetch(`https://api.github.com/repos/${repo.full_name}/git/refs/heads/${selectedBranch}`, {
          headers: { Authorization: `token ${accessToken}` },
        })
          .then(res => res.json())
          .then(ref => {
            fetch(`https://api.github.com/repos/${repo.full_name}/git/refs`, {
              method: 'POST',
              headers: {
                Authorization: `token ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ref: `refs/heads/${newBranchName}`,
                sha: ref.object.sha,
              }),
            })
              .then(res => res.json())
              .then(() => {
                setBranches([...branches, { name: newBranchName }]);
                setSelectedBranch(newBranchName);
                setCreatingBranch(false);
                setNewBranchName('');
              });
          });
      });
  };

  // PR create handler
  const handleCreatePR = () => {
    if (!prTitle || !selectedBranch) return;
    fetch(`https://api.github.com/repositories/${params.projectId}`, {
      headers: { Authorization: `token ${accessToken}` },
    })
      .then(res => res.json())
      .then(repo => {
        fetch(`https://api.github.com/repos/${repo.full_name}/pulls`, {
          method: 'POST',
          headers: {
            Authorization: `token ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: prTitle,
            body: prBody,
            head: selectedBranch,
            base: repo.default_branch,
          }),
        })
          .then(res => res.json())
          .then(() => {
            setCreatingPR(false);
            setPRTitle('');
            setPRBody('');
            alert('Pull request created!');
          });
      });
  };

  // Commit revert handler
  const handleRevertCommit = (sha: string) => {
    // This would require a merge commit or a revert commit via the GitHub API
    alert('Revert commit not implemented in this demo.');
  };

  // CI/CD re-run workflow handler
  const handleRerunWorkflow = (runId: string) => {
    fetch(`https://api.github.com/repositories/${params.projectId}`, {
      headers: { Authorization: `token ${accessToken}` },
    })
      .then(res => res.json())
      .then(repo => {
        fetch(`https://api.github.com/repos/${repo.full_name}/actions/runs/${runId}/rerun`, {
          method: 'POST',
          headers: { Authorization: `token ${accessToken}` },
        })
          .then(() => alert('Workflow re-run triggered!'));
      });
  };

  // CI/CD view logs handler
  const handleViewWorkflowLog = (runId: string) => {
    fetch(`https://api.github.com/repositories/${params.projectId}`, {
      headers: { Authorization: `token ${accessToken}` },
    })
      .then(res => res.json())
      .then(repo => {
        fetch(`https://api.github.com/repos/${repo.full_name}/actions/runs/${runId}/logs`, {
          headers: { Authorization: `token ${accessToken}` },
        })
          .then(res => res.text())
          .then(setWorkflowLog);
      });
  };

  if (sessionStatus === 'loading') return <div className="text-center text-white py-20">Loading...</div>;
  if (sessionStatus !== 'authenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <h1 className="text-3xl font-bold mb-4">Sign in with GitHub to access Dev Mode</h1>
        <button className="btn-neon px-6 py-2 rounded-full font-semibold" onClick={() => signIn('github')}>Sign in with GitHub</button>
      </div>
    );
  }
  if (loading || !accessToken) return <div className="text-center text-white py-20">Loading...</div>;
  if (!project && !isGitHubRepo && sessionStatus === 'authenticated' && accessToken) return notFound();
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <Link href="/devhub/projects" className="text-accent-blue hover:underline">← Back to Projects</Link>
      <h1 className="text-3xl font-bold text-neon mt-4 mb-2">
        {isGitHubRepo ? githubRepo?.full_name : project?.name}
      </h1>
      <div className="flex gap-2 mb-4">
        <button className={`btn-neon px-4 py-1 rounded ${!ciTab ? '' : 'opacity-50'}`} onClick={() => setCiTab(false)}>Project</button>
        <button className={`btn-neon px-4 py-1 rounded ${ciTab ? '' : 'opacity-50'}`} onClick={() => setCiTab(true)}>CI/CD</button>
      </div>
      {ciTab ? (
        <div className="bg-gray-900 rounded p-4">
          <h2 className="text-xl font-bold text-accent-cyan mb-4">GitHub Actions (CI/CD)</h2>
          {loadingCI ? (
            <div className="text-gray-400">Loading workflows...</div>
          ) : workflows.length === 0 ? (
            <div className="text-gray-400">No workflows found.</div>
          ) : (
            <ul className="space-y-4">
              {workflows.map((wf: any) => (
                <li key={wf.id} className="p-3 rounded bg-gray-800">
                  <div className="font-semibold text-accent-cyan">{wf.name}</div>
                  <div className="text-xs text-gray-400">{wf.path}</div>
                  <div className="mt-2">
                    <strong>Recent Runs:</strong>
                    <ul className="space-y-1 mt-1">
                      {workflowRuns.filter((run: any) => run.workflow_id === wf.id).slice(0, 3).map((run: any) => (
                        <li key={run.id} className="flex items-center gap-2">
                          <span className={`text-xs rounded px-2 py-1 ${run.conclusion === 'success' ? 'bg-green-700' : run.conclusion === 'failure' ? 'bg-red-700' : 'bg-gray-700'}`}>{run.conclusion || run.status}</span>
                          <span className="text-xs">{run.name}</span>
                          <a href={run.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline text-xs">View Logs</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : isGitHubRepo ? (
        loadingFiles ? (
          <div className="text-gray-400">Loading repository files...</div>
        ) : repoFiles.length > 0 ? (
          <div>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-accent-cyan mb-2 flex items-center gap-4">Files</h2>
              <div className="flex gap-4">
                <div className="w-48 bg-gray-800 rounded p-2 text-gray-200">
                  <div className="font-bold mb-2">File Tree</div>
                  <ul>
                    {repoFiles.filter(f => f.type === 'blob').map(f => (
                      <li key={f.sha} className="truncate text-xs text-white py-1 cursor-pointer" onClick={() => handleOpenRepoFile(f)}>{f.path}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 bg-gray-900 rounded p-2 min-h-[300px]">
                  {selectedRepoFile ? (
                    <>
                      <MonacoEditor
                        height="300px"
                        language={selectedRepoFile.path.endsWith('.js') ? 'javascript' : selectedRepoFile.path.endsWith('.ts') ? 'typescript' : selectedRepoFile.path.endsWith('.md') ? 'markdown' : selectedRepoFile.path.endsWith('.json') ? 'json' : 'plaintext'}
                        value={repoFileContent}
                        onChange={v => setRepoFileContent(v ?? '')}
                        options={{ readOnly: false, minimap: { enabled: false } }}
                      />
                      <div className="flex gap-2 mt-2 items-center">
                        <input
                          className="p-1 rounded bg-gray-800 text-white border border-gray-700 flex-1"
                          placeholder="Commit message"
                          value={commitMessage}
                          onChange={e => setCommitMessage(e.target.value)}
                        />
                        <button className="btn-neon px-4 py-1 rounded" onClick={() => handleSaveRepoFile(commitMessage)}>Save to GitHub</button>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400">Select a file to view/edit.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-400">No files found in this repository.</div>
        )
      ) : (
        <>
          <p className="mb-6 text-gray-300">{project.description}</p>
          {/* ...rest of local project UI... */}
        </>
      )}
    </div>
  );
}

export default function ProjectDetails({ params }: { params: { projectId: string } }) {
  return (
    <RoomProvider id={`devhub-project-${params.projectId}`}
      initialPresence={{ cursor: null, message: null }}
      initialStorage={{ canvasObjects: new LiveMap(), files: [], readme: '', issues: [] }}
    >
      <ProjectDetailsInner params={params} />
    </RoomProvider>
  );
} 