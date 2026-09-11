"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AppShell from "../../../components/AppShell";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import ErrorMessage from "../../../components/ErrorMessage";
import Input from "../../../components/Input";
import Loading from "../../../components/Loading";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAuth } from "../../../context/AuthContext";
import { apiRequest } from "../../../services/api";

export default function CreateProjectPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [members, setMembers] = useState([]);

  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const searchUsers = async () => {
    const value = searchName.trim();

    if (!value) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      setError("");

      const data = await apiRequest(
        `/auth/users/search?name=${encodeURIComponent(value)}`,
        "GET",
        null,
        token
      );

      setSearchResults(data.users || []);
    } catch (err) {
      setError(err.message || "Unable to search users.");
    } finally {
      setSearching(false);
    }
  };

  const addMember = (user) => {
    const alreadyAdded = members.some(
      (member) => member._id === user._id
    );

    if (alreadyAdded) {
      return;
    }

    setMembers((current) => [...current, user]);

    setSearchResults((current) =>
      current.filter((item) => item._id !== user._id)
    );
  };

  const removeMember = (userId) => {
    setMembers((current) =>
      current.filter((member) => member._id !== userId)
    );
  };

  const createProject = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter a project name.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a project description.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const data = await apiRequest(
        "/projects",
        "POST",
        {
          name: name.trim(),
          description: description.trim(),
          members: members.map((member) => member._id),
        },
        token
      );

      router.push(`/projects/${data.project._id}`);
    } catch (err) {
      setError(err.message || "Unable to create project.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="page">
          <div className="page-header">
            <div>
              <h1>Create Project</h1>
              <p>
                Create a project and add existing users as members.
              </p>
            </div>
          </div>

          <Card>
            <form onSubmit={createProject}>
              <Input
                label="Project Name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter project name"
              />

              <div style={{ marginTop: 16 }}>
                <label className="label">
                  Description
                </label>

                <textarea
                  className="input"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Enter project description"
                  rows={5}
                />
              </div>

              <div style={{ marginTop: 24 }}>
                <h2>Add Members</h2>

                <p className="muted">
                  Search existing users by name and add them
                  to this project.
                </p>

                <div className="filter-row">
                  <input
                    className="input"
                    value={searchName}
                    onChange={(event) =>
                      setSearchName(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        searchUsers();
                      }
                    }}
                    placeholder="Search user by name"
                  />

                  <Button
                    type="button"
                    onClick={searchUsers}
                    disabled={searching}
                  >
                    {searching ? "Searching..." : "Search"}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="card" style={{ marginTop: 12 }}>
                    {searchResults.map((user) => (
                      <div
                        key={user._id}
                        className="list-row"
                      >
                        <div>
                          <strong>{user.name}</strong>

                          <div className="muted">
                            {user.email}
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={() => addMember(user)}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {members.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <h3>Selected Members</h3>

                    <div className="card">
                      {members.map((member) => (
                        <div
                          key={member._id}
                          className="list-row"
                        >
                          <div>
                            <strong>
                              {member.name}
                            </strong>

                            <div className="muted">
                              {member.email}
                            </div>
                          </div>

                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              removeMember(member._id)
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {members.length === 0 && (
                  <p className="muted">
                    No members added yet.
                  </p>
                )}
              </div>

              {error && (
                <div style={{ marginTop: 20 }}>
                  <ErrorMessage message={error} />
                </div>
              )}

              <div
                style={{
                  marginTop: 24,
                  display: "flex",
                  gap: 12,
                }}
              >
                <Button
                  type="submit"
                  disabled={creating}
                >
                  {creating
                    ? "Creating..."
                    : "Create Project"}
                </Button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => router.back()}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}