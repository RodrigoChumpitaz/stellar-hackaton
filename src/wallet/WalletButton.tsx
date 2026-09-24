import { useWallet } from './WalletProvider.js';

function abbreviate(address: string) { return `${address.slice(0, 4)}…${address.slice(-4)}`; }
function avatarHue(address: string) { return [...address].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360; }

/** Control visual agnóstico de estilos, listo para la barra de navegación del módulo de UI. */
export function WalletButton() {
  const wallet = useWallet();
  if (!wallet.isConnected) {
    return <button type="button" onClick={() => void wallet.connect()} disabled={wallet.isConnecting}>
      {wallet.isConnecting ? 'Conectando…' : 'Conectar Wallet'}
    </button>;
  }
  return <div aria-label={`Wallet conectada: ${wallet.publicKey}`}>
    <span aria-hidden="true" style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: `hsl(${avatarHue(wallet.publicKey!)}, 70%, 50%)` }} />
    <span>{wallet.xlmBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })} XLM · {abbreviate(wallet.publicKey!)}</span>
    <button type="button" onClick={wallet.disconnect}>Desconectar</button>
  </div>;
}
