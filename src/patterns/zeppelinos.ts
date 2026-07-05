import { ZEPPELINOS_ADMIN_SLOT, ZEPPELINOS_IMPL_SLOT } from '../constants'
import { parseAddress } from '../decode'
import { ethGetStorageAt } from '../rpc'
import type { RawProxy } from '../types'

/**
 * Detect a legacy ZeppelinOS (pre-EIP-1967) upgradeable proxy.
 *
 * ZeppelinOS proxies predate EIP-1967 and store the implementation at
 * `keccak256('org.zeppelinos.proxy.implementation')` (`0x7050…f8c3`) — the
 * un-decremented ancestor of the EIP-1967 slot scheme. Circle's USDC
 * (`FiatTokenProxy`) is the most prominent deployment still on this layout.
 *
 * Reads the implementation slot; if non-zero, reads the admin slot
 * (`keccak256('org.zeppelinos.proxy.admin')`) in parallel and attaches it
 * when present.
 *
 * Returns `null` when the implementation slot is empty or malformed.
 */
export async function detectZeppelinOs(
  rpc: string,
  address: string,
  fetchFn: typeof globalThis.fetch,
): Promise<RawProxy | null> {
  let implRaw: string
  let adminRaw: string
  try {
    [implRaw, adminRaw] = await Promise.all([
      ethGetStorageAt(rpc, address, ZEPPELINOS_IMPL_SLOT, fetchFn),
      ethGetStorageAt(rpc, address, ZEPPELINOS_ADMIN_SLOT, fetchFn).catch(() => '0x'),
    ])
  } catch {
    return null
  }

  const impl = parseAddress(implRaw)
  if (!impl || impl === '0x0000000000000000000000000000000000000000') return null

  const proxy: RawProxy = {
    pattern: 'zeppelinos',
    targets: [{ address: impl }],
  }

  const admin = parseAddress(adminRaw)
  if (admin && admin !== '0x0000000000000000000000000000000000000000') {
    proxy.admin = admin
  }

  return proxy
}
