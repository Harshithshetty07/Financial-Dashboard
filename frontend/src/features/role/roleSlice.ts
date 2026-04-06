import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Role } from '../../types';

interface RoleState {
  current: Role;
}

// ─── Load persisted role from localStorage ────────────────────────────────────
const loadRole = (): Role => {
  try {
    const saved = localStorage.getItem('fintrack_role') as Role | null;
    if (saved === 'admin' || saved === 'viewer') return saved;
  } catch {
    // ignore
  }
  return 'viewer';
};

const initialState: RoleState = {
  current: loadRole(),
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    setRole(state, action: PayloadAction<Role>) {
      state.current = action.payload;
      try {
        localStorage.setItem('fintrack_role', action.payload);
      } catch {
        // ignore
      }
    },
  },
});

export const { setRole } = roleSlice.actions;
export default roleSlice.reducer;