import { homedir } from 'node:os'
import { join } from 'node:path'
import { sessionIdFromFileName } from '../ai-vault/session-scanner-accumulator'
import { walkSessionFiles } from '../ai-vault/session-scanner-discovery'
import { directoryTranscriptImport } from '../native-chat/structured-agent-cli-conversations'

export const PI_TRANSCRIPT_IMPORT = directoryTranscriptImport({
  // The chat's own home, then the one Session History lists Pi's conversations from.
  accountHomeCandidates: ({ selectedAccountHomePath }) => [
    selectedAccountHomePath,
    process.env.PI_CODING_AGENT_DIR?.trim() || join(homedir(), '.pi', 'agent')
  ],
  // The file Session History lists under this id.
  findTranscript: async ({ providerSessionId, accountHomePath }) => {
    const files = await walkSessionFiles(join(accountHomePath, 'sessions'), 'pi', [], {
      extensions: new Set(['.jsonl']),
      filePredicate: (path) => sessionIdFromFileName(path) === providerSessionId
    })
    return files[0] ?? null
  },
  // A Pi chat's handle names its session file, not the id.
  handleNamesTranscript: true
})
