/**
 * @file src/App.tsx
 *
 * Root component.
 * Add routes here when you introduce React Router or TanStack Router.
 */

import { Web3Provider } from "@/providers/Web3Provider";
import { HomePage } from "@/pages/HomePage";
import "@/styles/globals.css";

export default function App() {
  return (
    <Web3Provider>
      {/* Router goes here when you're ready */}
      <HomePage />
    </Web3Provider>
  );
}
