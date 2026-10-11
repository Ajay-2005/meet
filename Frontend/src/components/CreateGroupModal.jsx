import React, { useState } from 'react';
import { X, Plus, Users } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function CreateGroupModal({
  isOpen,
  onClose,
  currentUser,
  onCreateGroupSuccess,
  onCacheUser
}) {
  const [groupName, setGroupName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [participants, setParticipants] = useState([]); // Array of { id, username }
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const resetForm = () => {
    setGroupName('');
    setMemberInput('');
    setParticipants([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddMember = async () => {
    const username = memberInput.trim();
    if (!username || isAddingMember) return;

    setIsAddingMember(true);
    try {
      const result = await api.searchUser(username);
      const list = Array.isArray(result) ? result : result ? [result] : [];
      const found = list.find(
        (u) => u.username.toLowerCase() === username.toLowerCase()
      );

      if (!found || !found.id) {
        showToast(`No user found with username "${username}"`, 'error');
        return;
      }
      if (found.id === currentUser?.id) {
        showToast('You are automatically included in the group', 'info');
        setMemberInput('');
        return;
      }
      if (participants.some((p) => p.id === found.id)) {
        showToast('User is already added to the group', 'info');
        return;
      }

      onCacheUser(found.id, found.username);
      setParticipants((prev) => [...prev, { id: found.id, username: found.username }]);
      setMemberInput('');
    } catch (err) {
      console.error('member search failed', err);
      showToast(`User search failed: ${err.message}`, 'error');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = (userId) => {
    setParticipants((prev) => prev.filter((p) => p.id !== userId));
  };

  const handleSubmit = async () => {
    if (!currentUser?.id) {
      showToast('Please sign in first to create a group', 'warning');
      return;
    }

    const name = groupName.trim();
    if (!name) {
      showToast('Please enter a group name', 'error');
      return;
    }

    if (participants.length === 0) {
      showToast('Please add at least one member to the group', 'error');
      return;
    }

    setIsSubmitting(true);
    const allParticipantIds = [currentUser.id, ...participants.map((p) => p.id)];

    try {
      showToast('Creating group chat...', 'info', 1500);
      const chat = await api.createChat({
        name,
        participantIds: allParticipantIds,
        groupChat: true,
        senderId: currentUser.id
      });

      showToast(`Group "${name}" created!`, 'success');
      resetForm();
      onClose();
      onCreateGroupSuccess(chat);
    } catch (err) {
      console.error('create group failed', err);
      showToast(`Failed to create group: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={20} className="text-primary" />
            <h3 className="modal-title">Create New Group</h3>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label" htmlFor="group-name">
              Group Name
            </label>
            <input
              id="group-name"
              type="text"
              className="form-input"
              placeholder="e.g. Engineering Squad"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Add Members by Username</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter username (e.g. alice, bob)..."
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={handleAddMember}
                disabled={isAddingMember || !memberInput.trim()}
                style={{ whiteSpace: 'nowrap' }}
              >
                {isAddingMember ? 'Checking...' : '+ Add'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Selected Members ({participants.length})
            </label>
            <div className="chips-container">
              {participants.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center', padding: '4px' }}>
                  Search and add usernames above
                </span>
              ) : (
                participants.map((p) => (
                  <div key={p.id} className="participant-chip">
                    <span>{p.username}</span>
                    <button
                      type="button"
                      className="chip-remove"
                      onClick={() => handleRemoveMember(p.id)}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !groupName.trim() || participants.length === 0}
          >
            {isSubmitting ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}
