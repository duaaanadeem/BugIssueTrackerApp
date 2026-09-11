export function getUserId(user) {
  return user?._id || user?.id || user;
}

export function getProjectMembers(project) {
  const members = Array.isArray(project?.members) ? project.members : [];
  const seen = new Set();

  return members.filter((member) => {
    if (!member || typeof member !== 'object') return false;
    const id = String(getUserId(member) || '');
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
