import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type IpaCacheRow = {
  word: string
  ipa: string
}

function normalizeWord(word: string): string {
  return word.trim().toLowerCase()
}

function extractIpaFromDictionaryPayload(payload: unknown): string {
  if (!Array.isArray(payload)) {
    return ''
  }

  for (const entry of payload) {
    if (entry && typeof entry === 'object') {
      const phonetic = (entry as Record<string, unknown>).phonetic
      if (typeof phonetic === 'string' && phonetic.trim()) {
        return phonetic.trim()
      }

      const phonetics = (entry as Record<string, unknown>).phonetics
      if (Array.isArray(phonetics)) {
        for (const item of phonetics) {
          if (item && typeof item === 'object') {
            const text = (item as Record<string, unknown>).text
            if (typeof text === 'string' && text.trim()) {
              return text.trim()
            }
          }
        }
      }
    }
  }

  return ''
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { words } = await request.json()
    const inputWords = Array.isArray(words) ? words : []
    const uniqueWords = [...new Set(inputWords.map((word) => String(word ?? '').trim()).filter(Boolean))]

    if (uniqueWords.length === 0) {
      return Response.json({ ipaMap: {} }, { headers: corsHeaders })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const normalizedWords = uniqueWords.map(normalizeWord)
    const { data: cachedRows, error: cacheError } = await supabase
      .from('ipa_cache')
      .select('word, ipa')
      .in('word', normalizedWords)

    if (cacheError) {
      throw cacheError
    }

    const cachedMap = (cachedRows ?? []).reduce<Record<string, string>>((result, row: IpaCacheRow) => {
      result[row.word] = row.ipa
      return result
    }, {})

    const ipaMap: Record<string, string> = {}
    const uncachedWords = uniqueWords.filter((word) => {
      const cachedIpa = cachedMap[normalizeWord(word)]
      if (typeof cachedIpa === 'string') {
        ipaMap[word] = cachedIpa
        return false
      }

      return true
    })

    const rowsToCache: IpaCacheRow[] = []

    for (const word of uncachedWords) {
      let ipa = ''

      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
        if (response.ok) {
          const payload = await response.json()
          ipa = extractIpaFromDictionaryPayload(payload)
        }
      } catch {
        ipa = ''
      }

      ipaMap[word] = ipa
      rowsToCache.push({
        word: normalizeWord(word),
        ipa,
      })
    }

    if (rowsToCache.length > 0) {
      const { error: upsertError } = await supabase
        .from('ipa_cache')
        .upsert(rowsToCache, { onConflict: 'word' })

      if (upsertError) {
        throw upsertError
      }
    }

    return Response.json({ ipaMap }, { headers: corsHeaders })
  } catch (error) {
    return Response.json(
      {
        message: 'Unable to resolve IPA.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    )
  }
})
