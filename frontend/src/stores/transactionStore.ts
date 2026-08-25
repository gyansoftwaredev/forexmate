import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import API_URL, { authFetch, apiJson } from '@/lib/api';

export interface TransactionSession {
  id: string;
  userId?: string;
  status: string;
  draftState: Record<string, any>;
}

interface TransactionState {
  sessionId: string | null;
  status: string;
  draftState: Record<string, any>;
  allowedActions: string[];
  isSaving: boolean;
  
  // Actions
  initSession: () => Promise<void>;
  updateDraft: (partialDraft: Record<string, any>) => void;
  fetchWorkflow: () => Promise<void>;
  clearSession: () => void;
}

let saveTimeout: NodeJS.Timeout | null = null;

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      status: 'CREATED',
      draftState: {},
      allowedActions: ['PRODUCT_SELECTION'],
      isSaving: false,

      initSession: async () => {
        const { sessionId } = get();
        if (sessionId) {
          try {
            await get().fetchWorkflow();
            const currentStatus = get().status;
            if (currentStatus === 'CONVERTED' || currentStatus === 'WAITING_PAYMENT') {
              get().clearSession();
            } else {
              return;
            }
          } catch (err) {
            get().clearSession();
          }
        }
        
        try {
          // Create new session via API
          const res = await authFetch(`${API_URL}/transaction-engine/session`, {
            method: 'POST',
          });
          const session = await apiJson<TransactionSession>(res);
          set({
            sessionId: session.id,
            status: session.status || 'CREATED',
            draftState: session.draftState || {},
          });
          await get().fetchWorkflow();
        } catch (err) {
          console.warn('Backend session init warning (using client-side session):', err);
          // Always provide a reliable client fallback session ID so the user is never stuck
          set({
            sessionId: `fxm_sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            status: 'CREATED',
            draftState: {},
          });
        }
      },

      updateDraft: (partialDraft: Record<string, any>) => {
        set((state) => ({
          draftState: { ...state.draftState, ...partialDraft },
          isSaving: true,
        }));

        const { sessionId, draftState } = get();
        if (!sessionId) return;

        if (saveTimeout) clearTimeout(saveTimeout);

        saveTimeout = setTimeout(async () => {
          try {
            await authFetch(`${API_URL}/transaction-engine/session/${sessionId}/draft`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(draftState),
            });
            // After saving draft, fetch new workflow steps
            await get().fetchWorkflow();
          } catch (err: any) {
            console.error('Failed to save draft:', err);
            if (err.message?.includes('already converted to an order')) {
              get().clearSession();
              get().initSession();
            }
          } finally {
            set({ isSaving: false });
          }
        }, 500); // 500ms debounce
      },

      fetchWorkflow: async () => {
        const { sessionId } = get();
        if (!sessionId) return;

        try {
          const res = await authFetch(`${API_URL}/transaction-engine/session/${sessionId}/workflow`);
          const workflow = await apiJson<{ currentState: string; allowedActions: string[] }>(res);
          set({
            status: workflow.currentState,
            allowedActions: workflow.allowedActions || [],
          });
        } catch (err) {
          console.warn('Failed to fetch workflow:', err);
          throw err;
        }
      },

      clearSession: () => {
        set({
          sessionId: null,
          status: 'CREATED',
          draftState: {},
          allowedActions: ['PRODUCT_SELECTION'],
          isSaving: false,
        });
      },
    }),
    {
      name: 'forexmate-transaction-storage',
      // We only persist the sessionId and draftState, so the user can resume
      partialize: (state) => ({ 
        sessionId: state.sessionId, 
        draftState: state.draftState 
      }),
    }
  )
);
