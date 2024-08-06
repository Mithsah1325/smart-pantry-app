"use client";
import Header from './components/Header'
import Inventory from './components/Inventory'


export default function Home() {
  return (
    <div className="app">
      <Header />
      <Inventory />
    </div>
  );
}
