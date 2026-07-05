---
'@1001-digital/proxies': minor
---

Add `zeppelinos` pattern — legacy ZeppelinOS (pre-EIP-1967) upgradeable proxies.

`detectZeppelinOs` reads the implementation from `keccak256('org.zeppelinos.proxy.implementation')` (`0x7050…f8c3`) and attaches the admin from `keccak256('org.zeppelinos.proxy.admin')` when set. Wired into `detectProxy` between `eip-1822` and `eip-1167`.

These proxies predate EIP-1967's decremented-slot scheme and were previously undetectable: the EIP-1967 slots are empty, and `implementation()` sits behind an `ifAdmin` modifier, so the EIP-897 probe reverts for any non-admin caller. The most prominent deployment still on this layout is Circle's USDC (`FiatTokenProxy`, `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48`), which now resolves to its `FiatTokenV2_2` implementation.

New exports: `detectZeppelinOs`, `ZEPPELINOS_IMPL_SLOT`, `ZEPPELINOS_ADMIN_SLOT`.
