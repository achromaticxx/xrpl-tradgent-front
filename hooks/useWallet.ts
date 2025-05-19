import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function useWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = async (connectorId: string) => {
    const connector = connectors.find((c) => c.id === connectorId)
    if (connector) {
      try {
        await connect({ connector })
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    }
  }

  return {
    address,
    isConnected,
    isPending,
    connectors,
    connect: handleConnect,
    disconnect,
  }
} 